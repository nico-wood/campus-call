import type { Quantity } from "./lmsr";

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

/** Pure. Does not mutate `balances`. */
export function emptyLedger(balances: Record<string, number> = { house: 0 }): LedgerState {
  void balances;
  throw new Error("not implemented");
}

/** Mints b*ln(2) virtual credits into the house. Does not mutate `state`. */
export function createMarket(state: LedgerState, marketId: string, b: number): LedgerState {
  void state;
  void marketId;
  void b;
  throw new Error("not implemented");
}

/** Moves the cost-function delta from the user to the house. Throws before any write if the user would go negative. */
export function trade(state: LedgerState, request: TradeRequest): LedgerState {
  void state;
  void request;
  throw new Error("not implemented");
}

/** Pays 1 virtual credit from the house per winning share. A second call throws. */
export function resolveMarket(state: LedgerState, request: ResolveRequest): LedgerState {
  void state;
  void request;
  throw new Error("not implemented");
}
