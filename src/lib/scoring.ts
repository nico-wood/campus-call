export function pointsFromBrier(brier: number): number {
  return Math.round(100 * (1 - brier));
}
