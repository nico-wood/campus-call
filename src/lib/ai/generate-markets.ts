export interface MarketDraft {
  question: string;
  outcomes: ["YES", "NO"];
  resolutionSource: string;
  closeAt: string;
  category: "campus" | "knowledge" | "academic";
}

export type GenerateMarketsResult =
  | { rejected: true; reason: string }
  | { rejected: false; markets: MarketDraft[] };

/** Phase B. Must pass evals offline. Do not call a live model from the eval path. */
export function generateMarkets(announcement: string, deadline: string | null): GenerateMarketsResult {
  void announcement;
  void deadline;
  throw new Error("not implemented");
}
