export interface Quantity {
  yes: number;
  no: number;
}

/** Stable ln(exp(a) + exp(b)). Large share quantities must not overflow. */
function logSumExp(a: number, b: number): number {
  const max = Math.max(a, b);
  return max + Math.log(Math.exp(a - max) + Math.exp(b - max));
}

export function lmsrCost(q: Quantity, b: number): number {
  return b * logSumExp(q.yes / b, q.no / b);
}

export function lmsrPrices(q: Quantity, b: number): { yes: number; no: number } {
  const yesTerm = q.yes / b;
  const noTerm = q.no / b;
  const max = Math.max(yesTerm, noTerm);
  const yesExp = Math.exp(yesTerm - max);
  const noExp = Math.exp(noTerm - max);
  let yes = yesExp / (yesExp + noExp);
  // Underflow can collapse a side to 0. Market probability stays inside (0, 1).
  if (yes <= 0) yes = Number.EPSILON;
  else if (yes >= 1) yes = 1 - Number.EPSILON;
  return { yes, no: 1 - yes };
}

export function tradeCost(q: Quantity, b: number, side: "yes" | "no", shares: number): number {
  const next: Quantity =
    side === "yes" ? { yes: q.yes + shares, no: q.no } : { yes: q.yes, no: q.no + shares };
  return lmsrCost(next, b) - lmsrCost(q, b);
}
