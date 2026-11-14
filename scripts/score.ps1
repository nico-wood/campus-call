#Requires -Version 5.1
<#
.SYNOPSIS
  Campus Call harness score. Prints one number on stdout.
  score = 50*(e2e pass rate) + 25*(unit pass rate) + 15*(AI eval pass rate) + 10*(lint and typecheck).
  Logs go to stderr and logs/. Exit code is 0 so a caller can read the number.
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-ErrLine {
  param([string]$Message)
  [Console]::Error.WriteLine($Message)
}

$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

function Quote-CmdArg {
  param([string]$Value)
  if ($Value -match '[\s"]') {
    return '"' + ($Value -replace '"', '\"') + '"'
  }
  return $Value
}

function Invoke-Tool {
  param(
    [string[]]$ArgumentList,
    [int]$TimeoutSec,
    [string]$Label
  )
  $logs = Join-Path $root "logs"
  if (-not (Test-Path -LiteralPath $logs)) {
    New-Item -ItemType Directory -Path $logs | Out-Null
  }

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $env:ComSpec
  $quoted = foreach ($arg in $ArgumentList) { Quote-CmdArg $arg }
  $psi.Arguments = "/d /c " + ($quoted -join " ")
  $psi.WorkingDirectory = $root
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  $psi.EnvironmentVariables["CI"] = "1"
  $psi.EnvironmentVariables["npm_config_yes"] = "true"

  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi

  try {
    [void]$proc.Start()
  } catch {
    Write-ErrLine "$Label failed to start"
    return @{ Code = 1; Stdout = ""; Stderr = $_.Exception.Message }
  }
  $outTask = $proc.StandardOutput.ReadToEndAsync()
  $errTask = $proc.StandardError.ReadToEndAsync()

  if (-not $proc.WaitForExit($TimeoutSec * 1000)) {
    & taskkill.exe /F /T /PID $proc.Id > $null 2>&1
    try { [void]$proc.WaitForExit(5000) } catch { }
    Write-ErrLine "$Label timed out"
    return @{ Code = 124; Stdout = ""; Stderr = "timeout" }
  }
  [void]$proc.WaitForExit()
  $outText = $outTask.GetAwaiter().GetResult()
  $errText = $errTask.GetAwaiter().GetResult()
  [System.IO.File]::WriteAllText((Join-Path $logs "$Label.stdout.txt"), $outText)
  [System.IO.File]::WriteAllText((Join-Path $logs "$Label.stderr.txt"), $errText)
  $code = 1
  if ($null -ne $proc.ExitCode) { $code = [int]$proc.ExitCode }
  return @{ Code = $code; Stdout = $outText; Stderr = $errText }
}

function Write-JsonBlob {
  param(
    [hashtable]$Result,
    [string]$Path
  )
  $blob = [string]$Result.Stdout
  if ($blob -notmatch "\{") { $blob = [string]$Result.Stderr }
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  [System.IO.File]::WriteAllText($Path, $blob)
}

function Get-Rate {
  param(
    [string]$Kind,
    [string]$Path
  )
  $parser = Join-Path $root "scripts\score-rate.mjs"
  $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $nodeCmd) { return 0 }
  if (-not (Test-Path -LiteralPath $parser)) { return 0 }
  if (-not (Test-Path -LiteralPath $Path)) { return 0 }
  $text = & $nodeCmd.Source $parser $Kind $Path 2>$null
  if ($LASTEXITCODE -ne 0 -or $null -eq $text) { return 0 }
  $raw = ([string]$text).Trim()
  if ($raw.Length -eq 0) { return 0 }
  $culture = [System.Globalization.CultureInfo]::InvariantCulture
  try {
    $number = [double]::Parse($raw, $culture)
  } catch {
    return 0
  }
  if ($number -lt 0 -or $number -gt 1) { return 0 }
  return $number
}

function Get-ScoreText {
  if (-not (Test-Path -LiteralPath (Join-Path $root "node_modules"))) {
    Write-ErrLine "node_modules missing; rates are 0"
    return "0"
  }

  Set-Location -LiteralPath $root

  $unitJson = Join-Path $root "logs\unit.json"
  $aiJson = Join-Path $root "logs\ai.json"
  if (Test-Path -LiteralPath $unitJson) { Remove-Item -LiteralPath $unitJson -Force }
  if (Test-Path -LiteralPath $aiJson) { Remove-Item -LiteralPath $aiJson -Force }

  [void](Invoke-Tool -ArgumentList @(
      "npx", "--yes", "vitest", "run", "tests", "--reporter=json", "--outputFile=logs/unit.json"
    ) -TimeoutSec 90 -Label "unit")
  $unitRate = Get-Rate -Kind "vitest" -Path $unitJson

  [void](Invoke-Tool -ArgumentList @(
      "npx", "--yes", "vitest", "run", "evals", "--reporter=json", "--outputFile=logs/ai.json"
    ) -TimeoutSec 90 -Label "ai")
  $aiRate = Get-Rate -Kind "vitest" -Path $aiJson

  $e2eRun = Invoke-Tool -ArgumentList @(
    "npx", "--yes", "playwright", "test", "e2e/campus-call.spec.ts",
    "--reporter=json", "--workers=1"
  ) -TimeoutSec 120 -Label "e2e"
  $e2eJson = Join-Path $root "logs\e2e.json"
  Write-JsonBlob -Result $e2eRun -Path $e2eJson
  $e2eRate = Get-Rate -Kind "playwright" -Path $e2eJson

  $lint = Invoke-Tool -ArgumentList @("npx", "--yes", "eslint", ".") -TimeoutSec 90 -Label "lint"
  $typecheck = Invoke-Tool -ArgumentList @("npx", "--yes", "tsc", "--noEmit", "--pretty", "false") -TimeoutSec 90 -Label "typecheck"
  $quality = 0
  if ($lint.Code -eq 0 -and $typecheck.Code -eq 0) { $quality = 1 }

  Write-ErrLine ("unit={0} ai={1} e2e={2} quality={3}" -f $unitRate, $aiRate, $e2eRate, $quality)
  $score = (50 * $e2eRate) + (25 * $unitRate) + (15 * $aiRate) + (10 * $quality)
  $rounded = [Math]::Round([double]$score, 4, [MidpointRounding]::AwayFromZero)
  return $rounded.ToString("0.####", [System.Globalization.CultureInfo]::InvariantCulture)
}

try {
  $scoreText = Get-ScoreText
  [Console]::Out.WriteLine($scoreText)
  exit 0
} catch {
  Write-ErrLine $_.Exception.Message
  [Console]::Out.WriteLine("0")
  exit 0
}
