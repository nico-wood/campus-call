import { describe, expect, it } from "vitest";
import { createMarket, emptyLedger, resolveMarket, trade, type LedgerState } from "../src/lib/ledger";

function sumCash(balances: Record<string, number>): number {
  return Object.values(balances).reduce((total, value) => total + value, 0);
}

describe("ledger", () => {
  it("rejects an overspend and does not change balances", () => {
    const state = createMarket(emptyLedger({ house: 0, ada: 1 }), "m1", 100);
    const snapshot = structuredClone(state);
    expect(() =>
      trade(state, { marketId: "m1", userId: "ada", side: "yes", shares: 10 }),
    ).toThrow(/insufficient credits/i);
    expect(state).toEqual(snapshot);
  });

  it("keeps the sum of cash unchanged when a trade succeeds", () => {
    const created = createMarket(emptyLedger({ house: 0, ada: 100 }), "m1", 100);
    expect(created.balances.house).toBeCloseTo(100 * Math.log(2), 9);
    expect(created.balances.ada).toBe(100);
    const before = sumCash(created.balances);
    const after = trade(created, { marketId: "m1", userId: "ada", side: "yes", shares: 10 });
    expect(sumCash(after.balances)).toBeCloseTo(before, 9);
    expect(after.balances.ada).toBeLessThan(100);
    expect(after.balances.house).toBeGreaterThan(created.balances.house);
    expect(after.markets.m1?.q.yes).toBe(10);
    expect(after.markets.m1?.positions.ada?.yes).toBe(10);
    expect(created.balances.ada).toBe(100);
  });

  it("pays 1 credit per winning share exactly once", () => {
    let state: LedgerState = createMarket(emptyLedger({ house: 0, ada: 100 }), "m1", 100);
    state = trade(state, { marketId: "m1", userId: "ada", side: "yes", shares: 10 });
    const spent = 100 - state.balances.ada;
    const resolved = resolveMarket(state, { marketId: "m1", outcome: "yes" });
    expect(resolved.balances.ada - state.balances.ada).toBeCloseTo(10, 9);
    expect(state.balances.house - resolved.balances.house).toBeCloseTo(10, 9);
    expect(resolved.markets.m1?.resolved).toBe(true);
    expect(resolved.markets.m1?.outcome).toBe("yes");
    expect(resolved.balances.ada - (100 - spent)).toBeCloseTo(10, 9);
    expect(() => resolveMarket(resolved, { marketId: "m1", outcome: "yes" })).toThrow(/already resolved/i);
    expect(resolved.balances.ada).toBeCloseTo(state.balances.ada + 10, 9);
  });

  it("rejects a resolution the house cannot fund and does not change balances", () => {
    const forged: LedgerState = {
      balances: { house: 0, ada: 0 },
      markets: {
        m1: {
          b: 100,
          q: { yes: 5, no: 0 },
          resolved: false,
          outcome: null,
          positions: { ada: { yes: 5, no: 0 } },
        },
      },
    };
    const snapshot = structuredClone(forged);
    expect(() => resolveMarket(forged, { marketId: "m1", outcome: "yes" })).toThrow(/insufficient credits/i);
    expect(forged).toEqual(snapshot);
  });
});
