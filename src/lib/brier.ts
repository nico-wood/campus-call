export function brierScore(probabilityYes: number, outcomeYes: 0 | 1): number {
  return (probabilityYes - outcomeYes) ** 2;
}
