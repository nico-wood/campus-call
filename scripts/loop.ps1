#Requires -Version 5.1
<#
.SYNOPSIS
  Project-agnostic unattended agent loop.

.DESCRIPTION
  Reads TASKS.md, picks the next unchecked "- [ ]" item, runs a headless coding
  agent on that item only, runs tests if a test script exists, commits on
  success if a git repository already exists, and retries up to 3 times.
  Failed tasks are marked skipped and the loop continues. It does not run
  git init, create remotes, or link hosting accounts.

  Headless flags (from current official docs / --help):
    claude  -p PROMPT --permission-mode bypassPermissions
    codex   exec --sandbox workspace-write [--skip-git-repo-check] -
    grok    --prompt-file PATH --permission-mode bypassPermissions --always-approve

.PARAMETER Agent
  claude, codex, or grok. Default: claude.

.PARAMETER MaxRetries
  Retries per task after the first attempt. Default: 3 total attempts.

.PARAMETER TimeoutMinutes
  Per-attempt timeout. Default: 45.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\loop.ps1 -Agent claude
#>
[CmdletBinding()]
param(
    [ValidateSet('claude', 'codex', 'grok')]
    [string]$Agent = 'claude',

    [string]$Root,

    [string]$TasksPath,

    [ValidateRange(1, 10)]
    [int]$MaxRetries = 3,

    [ValidateRange(5, 240)]
    [int]$TimeoutMinutes = 45
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ProjectRoot {
    param([string]$Explicit)
    if ($Explicit) {
        return (Resolve-Path -LiteralPath $Explicit).Path
    }
    $scriptDir = Split-Path -Parent $PSCommandPath
    return (Resolve-Path -LiteralPath (Join-Path $scriptDir '..')).Path
}

function Write-Log {
    param(
        [string]$Message,
        [string]$LogFile
    )
    $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

function Append-Progress {
    param(
        [string]$Path,
        [string]$Message
    )
    $block = @(
        '',
        ('## {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')),
        $Message
    ) -join [Environment]::NewLine
    if (-not (Test-Path -LiteralPath $Path)) {
        Set-Content -LiteralPath $Path -Value "# Progress`n" -Encoding UTF8
    }
    Add-Content -LiteralPath $Path -Value $block -Encoding UTF8
}

function Get-NextOpenTask {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "TASKS.md not found at $Path"
    }
    $lines = [System.IO.File]::ReadAllLines($Path)
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match '^\s*- \[ \] (.+)$') {
            return [pscustomobject]@{
                Index = $i
                Title = $Matches[1].Trim()
                Lines = $lines
            }
        }
    }
    return $null
}

function Set-TaskLine {
    param(
        [string]$Path,
        [object[]]$Lines,
        [int]$Index,
        [string]$NewLine
    )
    $Lines[$Index] = $NewLine
    [System.IO.File]::WriteAllLines($Path, $Lines)
}

function Test-HasNpmTestScript {
    param([string]$ProjectRoot)
    $pkg = Join-Path $ProjectRoot 'package.json'
    if (-not (Test-Path -LiteralPath $pkg)) { return $false }
    try {
        $json = Get-Content -LiteralPath $pkg -Raw -Encoding UTF8 | ConvertFrom-Json
        return [bool]($json.scripts -and $json.scripts.test)
    } catch {
        return $false
    }
}

function Invoke-LoggedCommand {
    param(
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory,
        [string]$StdinPath,
        [string]$OutPath,
        [string]$ErrPath,
        [int]$TimeoutMs,
        [string]$LogFile
    )

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $FilePath
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.RedirectStandardInput = [bool]$StdinPath
    $psi.CreateNoWindow = $true
    if ($ArgumentList) {
        # ProcessStartInfo.Arguments is the PS 5.1-safe way to pass args.
        $psi.Arguments = ($ArgumentList | ForEach-Object {
            if ($_ -match '[\s"]') { '"{0}"' -f ($_ -replace '"', '\"') } else { $_ }
        }) -join ' '
    }

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $stdout = New-Object System.Text.StringBuilder
    $stderr = New-Object System.Text.StringBuilder
    $outHandler = [System.EventHandler[System.Diagnostics.DataReceivedEventArgs]] {
        param($sender, $e)
        if ($null -ne $e.Data) { [void]$stdout.AppendLine($e.Data) }
    }
    $errHandler = [System.EventHandler[System.Diagnostics.DataReceivedEventArgs]] {
        param($sender, $e)
        if ($null -ne $e.Data) { [void]$stderr.AppendLine($e.Data) }
    }
    $proc.add_OutputDataReceived($outHandler)
    $proc.add_ErrorDataReceived($errHandler)

    [void]$proc.Start()
    $proc.BeginOutputReadLine()
    $proc.BeginErrorReadLine()
    if ($StdinPath) {
        $text = [System.IO.File]::ReadAllText($StdinPath)
        $proc.StandardInput.Write($text)
        $proc.StandardInput.Close()
    }

    if (-not $proc.WaitForExit($TimeoutMs)) {
        try { $proc.Kill() } catch { }
        [void]$proc.WaitForExit()
        $out = $stdout.ToString()
        $err = $stderr.ToString()
        [System.IO.File]::WriteAllText($OutPath, $out)
        [System.IO.File]::WriteAllText($ErrPath, $err)
        Write-Log "Timed out after $($TimeoutMs / 1000)s: $FilePath" $LogFile
        return 124
    }

    $out = $stdout.ToString()
    $err = $stderr.ToString()
    [System.IO.File]::WriteAllText($OutPath, $out)
    [System.IO.File]::WriteAllText($ErrPath, $err)
    return $proc.ExitCode
}

function Resolve-AgentCommand {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    throw "The '$Name' command was not found on PATH. Install it or open a new terminal and try again."
}

function Invoke-AgentAttempt {
    param(
        [string]$AgentName,
        [string]$PromptPath,
        [string]$ProjectRoot,
        [string]$AttemptDir,
        [int]$TimeoutMs,
        [string]$LogFile
    )

    $outPath = Join-Path $AttemptDir 'stdout.log'
    $errPath = Join-Path $AttemptDir 'stderr.log'
    $hasGit = Test-Path -LiteralPath (Join-Path $ProjectRoot '.git')

    switch ($AgentName) {
        'claude' {
            $exe = Resolve-AgentCommand 'claude'
            # Official headless: claude -p "..." --permission-mode bypassPermissions
            # Prompt is passed as the -p argument via a short pointer plus stdin
            # so Windows command-line length limits are not hit.
            $args = @(
                '-p', 'Follow the instructions provided on stdin exactly.',
                '--permission-mode', 'bypassPermissions'
            )
            return Invoke-LoggedCommand -FilePath $exe -ArgumentList $args -WorkingDirectory $ProjectRoot -StdinPath $PromptPath -OutPath $outPath -ErrPath $errPath -TimeoutMs $TimeoutMs -LogFile $LogFile
        }
        'codex' {
            $exe = Resolve-AgentCommand 'codex'
            # Official: codex exec --sandbox workspace-write "prompt"
            # Prompt on stdin with "-" sentinel. skip-git-repo-check only when no repo.
            $args = @('exec', '--sandbox', 'workspace-write')
            if (-not $hasGit) { $args += '--skip-git-repo-check' }
            $args += '-'
            return Invoke-LoggedCommand -FilePath $exe -ArgumentList $args -WorkingDirectory $ProjectRoot -StdinPath $PromptPath -OutPath $outPath -ErrPath $errPath -TimeoutMs $TimeoutMs -LogFile $LogFile
        }
        'grok' {
            $exe = Resolve-AgentCommand 'grok'
            # Installed CLI --help: --prompt-file PATH, -p/--single, --permission-mode, --always-approve
            $args = @(
                '--prompt-file', $PromptPath,
                '--permission-mode', 'bypassPermissions',
                '--always-approve'
            )
            return Invoke-LoggedCommand -FilePath $exe -ArgumentList $args -WorkingDirectory $ProjectRoot -StdinPath $null -OutPath $outPath -ErrPath $errPath -TimeoutMs $TimeoutMs -LogFile $LogFile
        }
        default { throw "Unsupported agent: $AgentName" }
    }
}

function Invoke-NpmTestIfPresent {
    param(
        [string]$ProjectRoot,
        [string]$AttemptDir,
        [int]$TimeoutMs,
        [string]$LogFile
    )
    if (-not (Test-HasNpmTestScript -ProjectRoot $ProjectRoot)) {
        Write-Log 'No npm test script found; skipping tests.' $LogFile
        return 0
    }
    $npm = (Get-Command npm -ErrorAction SilentlyContinue)
    if (-not $npm) {
        Write-Log 'npm not found; treating as test failure.' $LogFile
        return 1
    }
    $outPath = Join-Path $AttemptDir 'npm-test.stdout.log'
    $errPath = Join-Path $AttemptDir 'npm-test.stderr.log'
    Write-Log 'Running npm test.' $LogFile
    return Invoke-LoggedCommand -FilePath $npm.Source -ArgumentList @('test') -WorkingDirectory $ProjectRoot -StdinPath $null -OutPath $outPath -ErrPath $errPath -TimeoutMs $TimeoutMs -LogFile $LogFile
}

function Invoke-MilestoneCommit {
    param(
        [string]$ProjectRoot,
        [string]$Title,
        [string]$LogFile,
        [string]$ProgressPath
    )
    $gitDir = Join-Path $ProjectRoot '.git'
    if (-not (Test-Path -LiteralPath $gitDir)) {
        $msg = 'No git repository present. Skipped commit (this script will not run git init).'
        Write-Log $msg $LogFile
        Append-Progress -Path $ProgressPath -Message $msg
        return
    }
    Push-Location -LiteralPath $ProjectRoot
    try {
        git add -A
        git reset HEAD -- .env .env.* 2>$null | Out-Null
        $stagedSecrets = git diff --cached --name-only | Where-Object { $_ -match '(^|/)\.env(\.|$)' -or $_ -match '\.(pem|key)$' }
        if ($stagedSecrets) {
            git reset HEAD -- $stagedSecrets | Out-Null
            Write-Log ("Unstaged possible secrets: " + ($stagedSecrets -join ', ')) $LogFile
        }
        $status = git status --porcelain
        if (-not $status) {
            Write-Log 'Nothing to commit.' $LogFile
            return
        }
        $message = "Complete: $Title"
        git commit -m $message
        if ($LASTEXITCODE -ne 0) {
            throw "git commit failed with exit code $LASTEXITCODE"
        }
        Write-Log "Committed: $message" $LogFile
        Append-Progress -Path $ProgressPath -Message "Committed: $message"
    } finally {
        Pop-Location
    }
}

# --- main ---
$projectRoot = Get-ProjectRoot -Explicit $Root
if (-not $TasksPath) { $TasksPath = Join-Path $projectRoot 'TASKS.md' }
$TasksPath = (Resolve-Path -LiteralPath $TasksPath).Path

$logsDir = Join-Path $projectRoot 'logs'
if (-not (Test-Path -LiteralPath $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logFile = Join-Path $logsDir "loop-$stamp.log"
$progressPath = Join-Path $projectRoot 'PROGRESS.md'
$timeoutMs = $TimeoutMinutes * 60 * 1000

Write-Log "Loop starting. Agent=$Agent Root=$projectRoot Tasks=$TasksPath MaxRetries=$MaxRetries TimeoutMinutes=$TimeoutMinutes" $logFile
Write-Log 'Keep the machine awake (Windows: Settings > System > Power, sleep = Never while plugged in).' $logFile
Append-Progress -Path $progressPath -Message "Loop started with agent '$Agent'."

$completed = 0
$skipped = 0

while ($true) {
    $task = Get-NextOpenTask -Path $TasksPath
    if (-not $task) {
        Write-Log 'No remaining unchecked tasks. Stopping.' $logFile
        break
    }

    $title = $task.Title
    Write-Log "Starting task: $title" $logFile
    Append-Progress -Path $progressPath -Message "Starting task: $title"

    $success = $false
    $lastError = ''
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        Write-Log "Attempt $attempt of $MaxRetries for: $title" $logFile
        $attemptDir = Join-Path $logsDir ("task-{0}-attempt-{1}" -f ($task.Index + 1), $attempt)
        New-Item -ItemType Directory -Path $attemptDir -Force | Out-Null

        $prompt = @"
You are working unattended in this project folder.

Complete ONLY this task from TASKS.md:
$title

Rules:
- Follow AGENTS.md (and CLAUDE.md if you are Claude Code).
- Stay inside this project folder. Make a small, reviewable change.
- Do not run git init, git push, or create hosting projects.
- Do not commit secrets or .env files. The loop will commit if a repository already exists.
- If a test command exists, leave the project in a state where tests should pass.
- When finished, append a short note to PROGRESS.md describing what changed and how to verify it.
- If the task is already done, say so and make no unnecessary changes.
"@
        $promptPath = Join-Path $attemptDir 'prompt.txt'
        [System.IO.File]::WriteAllText($promptPath, $prompt)

        try {
            $agentExit = Invoke-AgentAttempt -AgentName $Agent -PromptPath $promptPath -ProjectRoot $projectRoot -AttemptDir $attemptDir -TimeoutMs $timeoutMs -LogFile $logFile
        } catch {
            $agentExit = 1
            $lastError = $_.Exception.Message
            Write-Log "Agent failed to start: $lastError" $logFile
        }

        if ($agentExit -ne 0) {
            $lastError = "Agent exited with code $agentExit"
            Write-Log $lastError $logFile
            Append-Progress -Path $progressPath -Message "Attempt $attempt failed for '$title': $lastError"
            continue
        }

        $testExit = Invoke-NpmTestIfPresent -ProjectRoot $projectRoot -AttemptDir $attemptDir -TimeoutMs $timeoutMs -LogFile $logFile
        if ($testExit -ne 0) {
            $lastError = "npm test exited with code $testExit"
            Write-Log $lastError $logFile
            Append-Progress -Path $progressPath -Message "Attempt $attempt failed for '$title': $lastError"
            continue
        }

        $success = $true
        break
    }

    # Re-read TASKS.md in case the agent edited it.
    $latest = Get-NextOpenTask -Path $TasksPath
    if ($success) {
        Invoke-MilestoneCommit -ProjectRoot $projectRoot -Title $title -LogFile $logFile -ProgressPath $progressPath
        if ($latest -and $latest.Title -eq $title) {
            Set-TaskLine -Path $TasksPath -Lines $latest.Lines -Index $latest.Index -NewLine ("- [x] {0}" -f $title)
        }
        $completed++
        Write-Log "Completed task: $title" $logFile
        Append-Progress -Path $progressPath -Message "Completed task: $title"
    } else {
        if ($latest -and $latest.Title -eq $title) {
            Set-TaskLine -Path $TasksPath -Lines $latest.Lines -Index $latest.Index -NewLine ("- [x] SKIPPED (max retries): {0}" -f $title)
        }
        $skipped++
        Write-Log "Skipped after $MaxRetries attempts: $title ($lastError)" $logFile
        Append-Progress -Path $progressPath -Message "Skipped after $MaxRetries attempts: $title. Last error: $lastError"
    }
}

Write-Log "Loop finished. Completed=$completed Skipped=$skipped" $logFile
Append-Progress -Path $progressPath -Message "Loop finished. Completed=$completed Skipped=$skipped"
exit 0
