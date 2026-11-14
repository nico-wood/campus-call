import { tradeCost, type Quantity } from "./lmsr";

export const HOUSE_ACCOUNT = "house";

export type Side = "yes" | "no";

export interface MarketBook {
  b: number;
  q: Quantity;
  resolved: boolean;
  outcome: Side | null;
  positions: Record<string, Quantity>;
}

export interface LedgerState {
  balances: Record<string, number>;
  markets: Record<string, MarketBook>;
}

export interface TradeRequest {
  marketId: string;
  userId: string;
  side: Side;
  shares: number;
}

export interface ResolveRequest {
  marketId: string;
  outcome: Side;
}

function cloneState(state: LedgerState): LedgerState {
  return structuredClone(state);
}

/** Pure. Does not mutate `balances`. */
export function emptyLedger(balances: Record<string, number> = { house: 0 }): LedgerState {
  return { balances: structuredClone(balances), markets: {} };
}

/** Mints b*ln(2) virtual credits into the house. Does not mutate `state`. */
export function createMarket(state: LedgerState, marketId: string, b: number): LedgerState {
  const next = cloneState(state);
  next.balances[HOUSE_ACCOUNT] = (next.balances[HOUSE_ACCOUNT] ?? 0) + b * Math.log(2);
  next.markets[marketId] = {
    b,
    q: { yes: 0, no: 0 },
    resolved: false,
    outcome: null,
    positions: {},
  };
  return next;
}

/** Moves the cost-function delta from the user to the house. Throws before any write if the user would go negative. */
export function trade(state: LedgerState, request: TradeRequest): LedgerState {
  const market = state.markets[request.marketId];
  if (!market) {
    throw new Error("unknown market");
  }
  const cost = tradeCost(market.q, market.b, request.side, request.shares);
  const balance = state.balances[request.userId] ?? 0;
  if (!(balance >= cost)) {
    throw new Error("insufficient credits");
  }

  const next = cloneState(state);
  const book = next.markets[request.marketId];
  if (!book) {
    throw new Error("unknown market");
  }
  next.balances[request.userId] = balance - cost;
  next.balances[HOUSE_ACCOUNT] = (next.balances[HOUSE_ACCOUNT] ?? 0) + cost;
  book.q[request.side] += request.shares;
  const position = book.positions[request.userId] ?? { yes: 0, no: 0 };
  position[request.side] += request.shares;
  book.positions[request.userId] = position;
  return next;
}

/** Moves 1 virtual credit from the house per winning share. A second call throws. */
export function resolveMarket(state: LedgerState, request: ResolveRequest): LedgerState {
  const market = state.markets[request.marketId];
  if (!market) {
    throw new Error("unknown market");
  }
  if (market.resolved) {
    throw new Error("already resolved");
  }

  let credits = 0;
  for (const position of Object.values(market.positions)) {
    credits += position[request.outcome] ?? 0;
  }
  const house = state.balances[HOUSE_ACCOUNT] ?? 0;
  if (house < credits) {
    throw new Error("insufficient credits");
  }

  const next = cloneState(state);
  const book = next.markets[request.marketId];
  if (!book) {
    throw new Error("unknown market");
  }
  for (const [userId, position] of Object.entries(book.positions)) {
    const won = position[request.outcome] ?? 0;
    if (won === 0) continue;
    next.balances[userId] = (next.balances[userId] ?? 0) + won;
    next.balances[HOUSE_ACCOUNT] = (next.balances[HOUSE_ACCOUNT] ?? 0) - won;
  }
  book.resolved = true;
  book.outcome = request.outcome;
  return next;
}
