import { overUnderPrior } from "../lib/priors";
import type { LiveForecast, PriorSource } from "./live-forecasts";

/** Polymarket-style events: a matchup groups a moneyline, ladders, and props under one page. */

export type EventTeam = { name: string; short: string; logo: string; record?: string; color: string };

export type MarketGroup = "moneyline" | "spread" | "total" | "team-total" | "prop";
export type MarketPeriod = "full" | "1h" | "2h";

export type EventMarketSpec = LiveForecast & {
  group: MarketGroup;
  period: MarketPeriod;
  line?: number;
  eventId: string;
};

export type LocalEvent = {
  id: string;
  category: LiveForecast["category"];
  horizon: "live" | "futures";
  title: string;
  startsAt: string;
  venue: string;
  teams: readonly EventTeam[];
  sourceUrl: string;
  markets: readonly EventMarketSpec[];
};

/** All markets from every event, ready to merge into the flat LIVE_FORECASTS catalog. */
export function marketsFromEvents(events: readonly LocalEvent[]): LiveForecast[] {
  return events.flatMap((event) => event.markets);
}

/**
 * A ladder of binary Over/Under markets around a center line (e.g. a total
 * or a team total), generated from one spec: center, step, and how many
 * lines on each side. Priors come from the normal over/under model (P1).
 */
export function generateOverUnderLadder(opts: {
  eventId: string;
  idPrefix: string;
  category: LiveForecast["category"];
  group: "total" | "team-total";
  period: MarketPeriod;
  subject: string;
  center: number;
  step: number;
  sidesEachWay: number;
  sigma: number;
  closeLabel: string;
  closesAt: string;
  sourceName: string;
  sourceUrl: string;
  priorMethod: string;
  priorSources: readonly PriorSource[];
  priorAt: string;
  resolutionRuleFor: (line: number) => string;
}): EventMarketSpec[] {
  const specs: EventMarketSpec[] = [];
  for (let i = -opts.sidesEachWay; i <= opts.sidesEachWay; i += 1) {
    const line = Math.round((opts.center + i * opts.step) * 2) / 2;
    const over = overUnderPrior(opts.center, line, opts.sigma);
    specs.push({
      id: `${opts.idPrefix}-${String(line).replace(".", "-").replace("-", "")}`,
      category: opts.category,
      label: opts.subject,
      question: `Will ${opts.subject} total be over ${line}?`,
      summary: `Yes if ${opts.subject}'s total is over ${line}. No if it's under. (A push can't occur on a half-point line.)`,
      outcomes: ["Over", "Under"],
      closeLabel: opts.closeLabel,
      closesAt: opts.closesAt,
      sourceName: opts.sourceName,
      sourceUrl: opts.sourceUrl,
      resolutionRule: opts.resolutionRuleFor(line),
      prior: [over, 1 - over],
      priorMethod: opts.priorMethod,
      priorSources: opts.priorSources,
      priorAt: opts.priorAt,
      group: opts.group,
      period: opts.period,
      line,
      eventId: opts.eventId,
    });
  }
  return specs;
}
