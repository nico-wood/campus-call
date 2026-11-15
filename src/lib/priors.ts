/**
 * Deterministic prior calculators for Campus Call markets. Every catalog
 * market must open at a researched probability, not 50/50 — these functions
 * turn a public data point (a forecast high, a point spread, a posted total)
 * into that starting probability. Pure math, no network calls.
 */

/** Abramowitz & Stegun 7.1.26 approximation, accurate to ~1.5e-7. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/** Standard normal CDF: P(Z <= z) for Z ~ N(0, 1). */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function clampProbability(p: number, floor = 0.02, ceiling = 0.98): number {
  if (!Number.isFinite(p)) return 0.5;
  return Math.min(ceiling, Math.max(floor, p));
}

/**
 * Weather threshold: P(high >= threshold), modeling the actual high as
 * Normal(forecastHigh, sigma). Degrees Fahrenheit. sigma defaults to 3°F,
 * the spec's figure for a next-day NWS point forecast.
 */
export function weatherThresholdPrior(forecastHigh: number, threshold: number, sigma = 3): number {
  return clampProbability(1 - normalCdf((threshold - forecastHigh) / sigma));
}

/** Rain yes/no: use the NWS probabilityOfPrecipitation percent directly. */
export function rainPrior(probabilityOfPrecipitationPercent: number): number {
  return clampProbability(probabilityOfPrecipitationPercent / 100);
}

export type SpreadSport = "basketball" | "football" | "volleyball";

const SPREAD_SIGMA: Record<SpreadSport, number> = {
  basketball: 11,
  football: 13.5,
  volleyball: 4.5,
};

/**
 * Sports winner from a point spread: P(favorite wins) = Phi(spread / sigma).
 * `spread` is positive points the favorite is expected to win by (i.e. the
 * favorite's own spread such as -6.5 passed in as 6.5). For volleyball,
 * `spread` is the expected set differential.
 */
export function spreadWinnerPrior(spread: number, sport: SpreadSport): number {
  return clampProbability(normalCdf(spread / SPREAD_SIGMA[sport]));
}

/**
 * Moneyline -> implied probability with the vig removed (multiplicative
 * de-vig): converts each American moneyline to its raw implied probability,
 * then rescales both so they sum to 1.
 */
export function moneylineImpliedProbability(
  favoriteMoneyline: number,
  underdogMoneyline: number,
): { favorite: number; underdog: number } {
  const rawFavorite = favoriteMoneyline < 0
    ? -favoriteMoneyline / (-favoriteMoneyline + 100)
    : 100 / (favoriteMoneyline + 100);
  const rawUnderdog = underdogMoneyline < 0
    ? -underdogMoneyline / (-underdogMoneyline + 100)
    : 100 / (underdogMoneyline + 100);
  const total = rawFavorite + rawUnderdog;
  return {
    favorite: clampProbability(rawFavorite / total),
    underdog: clampProbability(rawUnderdog / total),
  };
}

/**
 * Over/under from a posted total: P(actual > line), modeling the actual
 * combined score as Normal(total, sigma). sigma defaults to 11, the spec's
 * figure for college basketball.
 */
export function overUnderPrior(total: number, line: number, sigma = 11): number {
  return clampProbability(1 - normalCdf((line - total) / sigma));
}

/**
 * Binary "a listing still shows X at time T": defaults to 0.9 (these rarely
 * change once posted) unless the source shows real cancellation/change risk,
 * in which case use a lower prior reflecting that risk.
 */
export function stillListedPrior(hasKnownRisk: boolean, riskAdjustedPrior = 0.75): number {
  return hasKnownRisk ? clampProbability(riskAdjustedPrior) : 0.9;
}
