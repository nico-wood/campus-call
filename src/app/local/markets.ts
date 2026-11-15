import type { LiveForecast } from "../live-forecasts";

/** Client-safe types and math for the open local markets. No secrets, no fetch. */

/** Default LMSR liquidity for a market with no row yet (matches the DB column default). */
export const LMSR_B = 1000;

export type MarketStatus = "open" | "resolved" | "void";

export type PriceTick = { t: string; p: readonly number[] };

export type BoardMarket = {
  id: string;
  status: MarketStatus;
  resolvedOutcome: number | null;
  closeAt: string;
  b: number;
  prices: readonly number[];
  volume: number;
  forecasters: number;
  history: readonly PriceTick[];
  createdAt: string;
};

export type BoardStats = { participants: number; positions: number; volume: number };

export type LocalBoard = { markets: readonly BoardMarket[]; stats: BoardStats };

/** A catalog forecast merged with its on-chain board state (or defaults, if no row yet). */
export type MergedMarket = LiveForecast & {
  status: MarketStatus;
  resolvedOutcome: number | null;
  closeAt: string;
  b: number;
  prices: readonly number[];
  volume: number;
  forecasters: number;
  history: readonly PriceTick[];
  hasRow: boolean;
};

function equalPrices(count: number): number[] {
  return Array.from({ length: count }, () => 1 / count);
}

export function mergeBoard(board: LocalBoard, catalog: readonly LiveForecast[]): MergedMarket[] {
  const byId = new Map(board.markets.map((market) => [market.id, market]));
  return catalog.map((forecast) => {
    const row = byId.get(forecast.id);
    if (!row) {
      return {
        ...forecast,
        status: "open",
        resolvedOutcome: null,
        closeAt: forecast.closesAt,
        b: LMSR_B,
        prices: equalPrices(forecast.outcomes.length),
        volume: 0,
        forecasters: 0,
        history: [],
        hasRow: false,
      };
    }
    return { ...forecast, ...row, b: row.b || LMSR_B, hasRow: true };
  });
}

export type AccountPosition = {
  id: string;
  marketId: string;
  outcome: number;
  shares: number;
  cost: number;
  createdAt: string;
  status: MarketStatus;
  resolvedOutcome: number | null;
  priceNow: number;
  valueNow: number;
  returned: number;
};

export type LocalAccount = { name: string; balance: number; granted: boolean; positions: readonly AccountPosition[] };

export type LeaderboardRow = {
  rank: number;
  displayName: string;
  balance: number;
  openValue: number;
  total: number;
  positions: number;
};

export type QuotePreview = {
  shares: number;
  avgPrice: number;
  newPrices: readonly number[];
  payoutIfWin: number;
};

/**
 * Preview-only LMSR quote. Recovers q from prices as q_i = b ln(p_i) (valid up
 * to a shared additive constant, chosen here so the recovered weights already
 * sum to 1, i.e. S = 1 and e_i = prices[i]). The server recomputes this from
 * its own stored q and is the only source of truth for what actually gets
 * written; this function never writes anything.
 */
export function quoteLocalPosition(
  prices: readonly number[],
  outcomeIdx: number,
  amount: number,
  b: number = LMSR_B,
): QuotePreview | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (outcomeIdx < 0 || outcomeIdx >= prices.length) return null;
  const ei = prices[outcomeIdx];
  if (!Number.isFinite(ei) || ei <= 0) return null;

  const shares = b * Math.log(1 + (Math.exp(amount / b) - 1) / ei);
  if (!Number.isFinite(shares) || shares <= 0) return null;

  const weights = prices.map((p, i) => (i === outcomeIdx ? p * Math.exp(shares / b) : p));
  const sum = weights.reduce((total, w) => total + w, 0);
  const newPrices = weights.map((w) => w / sum);

  return {
    shares,
    avgPrice: amount / shares,
    newPrices,
    payoutIfWin: Math.floor(shares),
  };
}

export function formatPercent(price: number): string {
  return `${Math.round(price * 100)}%`;
}

export function leadingOutcomeIndex(prices: readonly number[]): number {
  let best = 0;
  for (let i = 1; i < prices.length; i += 1) {
    if (prices[i] > prices[best]) best = i;
  }
  return best;
}
