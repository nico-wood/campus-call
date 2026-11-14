export interface Quantity {
  yes: number;
  no: number;
}

export function lmsrCost(q: Quantity, b: number): number {
  void q;
  void b;
  throw new Error("not implemented");
}

export function lmsrPrices(q: Quantity, b: number): { yes: number; no: number } {
  void q;
  void b;
  throw new Error("not implemented");
}

export function tradeCost(q: Quantity, b: number, side: "yes" | "no", shares: number): number {
  void q;
  void b;
  void side;
  void shares;
  throw new Error("not implemented");
}
