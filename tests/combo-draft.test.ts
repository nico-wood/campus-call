import { describe, expect, it } from "vitest";
import { restoreComboDraft } from "../src/app/local/combo-draft";
import { LIVE_FORECASTS } from "../src/app/live-forecasts";

const now = Date.parse("2026-11-14T12:00:00-08:00");
const draft = (marketId: string, extra = {}) => ({ marketId, outcomeIdx: 0, prob: 0.5, ...extra });
const winner = "mens-basketball-montana-state-winner";

describe("combo navigation draft", () => {
  it("restores selections and derives trusted labels and rules from the catalog", () => {
    const [leg] = restoreComboDraft(JSON.stringify([draft(winner, {
      question: "untrusted", eventId: null, horizon: "futures", outcomeLabel: "untrusted",
    })]), now);
    const forecast = LIVE_FORECASTS.find((market) => market.id === winner)!;
    expect(leg.question).toBe(forecast.question);
    expect(leg.outcomeLabel).toBe(forecast.outcomes[0]);
    expect(leg.eventId).toBe("mens-basketball-montana-state");
    expect(leg.horizon).toBe("live");
  });

  it("discards missing, malformed, and closed selections", () => {
    expect(restoreComboDraft("not json", now)).toEqual([]);
    expect(restoreComboDraft(JSON.stringify([draft("missing"), draft(winner, { outcomeIdx: -1 }),
      draft(winner, { prob: 0 })]), now)).toEqual([]);
    expect(restoreComboDraft(JSON.stringify([draft(winner)]), Date.parse("2027-01-01"))).toEqual([]);
  });

  it("does not restore duplicate or correlated selections that disable confirmation", () => {
    expect(restoreComboDraft(JSON.stringify([draft(winner), draft(winner),
      draft("mens-basketball-montana-state-halftime")]), now)).toHaveLength(1);
  });

  it("restores a valid cross-event combo through serialized storage", () => {
    const legs = restoreComboDraft(JSON.stringify([draft(winner), draft("sunday-high-ksbp")]), now);
    expect(legs.map((leg) => leg.marketId)).toEqual([winner, "sunday-high-ksbp"]);
    expect(restoreComboDraft(JSON.stringify(legs), now)).toEqual(legs);
  });
});
