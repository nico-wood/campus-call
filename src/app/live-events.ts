import { generateOverUnderLadder, type EventMarketSpec, type LocalEvent } from "./events";

const CLOSE_LABEL = "Sunday, Nov. 15, 2026, 2:55 p.m. PT";
const CLOSES_AT = "2026-11-15T14:55:00-08:00";
const SCHEDULE_SOURCE = { name: "Cal Poly men's basketball schedule", url: "https://gopoly.com/sports/mens-basketball/schedule" };

const MONEYLINE: EventMarketSpec = {
  id: "mens-basketball-montana-state-winner",
  category: "Sports",
  label: "Men's basketball",
  summary: "Cal Poly at Montana State men's basketball, Sunday, Nov. 15, 3:00 p.m. PT at Worthington Arena. Resolves to the winner on the official final score, including overtime.",
  question: "Who will win: Cal Poly or Montana State?",
  outcomes: ["Cal Poly", "Montana State"],
  closeLabel: CLOSE_LABEL,
  closesAt: CLOSES_AT,
  sourceName: SCHEDULE_SOURCE.name,
  sourceUrl: SCHEDULE_SOURCE.url,
  resolutionRule:
    "Resolves to the winner on the official final score. Tip is Sunday, Nov. 15, 2026, 4:00 p.m. MT (3:00 p.m. PT) at Worthington Arena. Overtime counts. If no official final score is posted, this forecast stays unresolved.",
  prior: [0.5, 0.5],
  priorMethod: "No posted point spread or moneyline found for this game as of Nov. 14, 2026; kept at an even prior rather than invent one.",
  priorSources: [SCHEDULE_SOURCE, { name: "ESPN game preview", url: "https://www.espn.com/mens-college-basketball/preview/_/gameId/401920124" }],
  priorAt: "2026-11-14T17:20:00-08:00",
  horizon: "live",
  group: "moneyline",
  period: "full",
  eventId: "mens-basketball-montana-state",
};

const HALFTIME: EventMarketSpec = {
  id: "mens-basketball-montana-state-halftime",
  category: "Sports",
  label: "Men's basketball",
  summary: "Halftime leader when Cal Poly plays at Montana State on Sunday, Nov. 15. Resolves from the 1st half totals on the official box score. Tied when those totals are equal.",
  question: "Who will lead at halftime?",
  outcomes: ["Cal Poly", "Montana State", "Tied"],
  closeLabel: CLOSE_LABEL,
  closesAt: CLOSES_AT,
  sourceName: SCHEDULE_SOURCE.name,
  sourceUrl: SCHEDULE_SOURCE.url,
  resolutionRule:
    "Resolves from the 1st half totals on the official box score linked from the Cal Poly men's basketball schedule. Cal Poly if its 1st half total is higher, Montana State if its 1st half total is higher, and Tied if the totals are equal. If those totals are not posted, this forecast stays unresolved.",
  prior: [0.46, 0.46, 0.08],
  priorMethod: "No posted spread found (even win prior), split with a ~8% base rate for a tied scoreboard at halftime in NCAA basketball; remainder split evenly between the two teams.",
  priorSources: [SCHEDULE_SOURCE],
  priorAt: "2026-11-14T17:20:00-08:00",
  horizon: "live",
  group: "prop",
  period: "1h",
  eventId: "mens-basketball-montana-state",
};

const OVERTIME: EventMarketSpec = {
  id: "mens-basketball-montana-state-overtime",
  category: "Sports",
  label: "Men's basketball",
  summary: "Cal Poly at Montana State men's basketball, Sunday, Nov. 15. Yes if the official box score shows a period after the 2nd half. A two-period final is No.",
  question: "Will Cal Poly vs. Montana State go to overtime?",
  outcomes: ["Yes", "No"],
  closeLabel: CLOSE_LABEL,
  closesAt: CLOSES_AT,
  sourceName: SCHEDULE_SOURCE.name,
  sourceUrl: SCHEDULE_SOURCE.url,
  resolutionRule:
    "Yes if the official box score linked from the Cal Poly men's basketball schedule for Cal Poly at Montana State on Sunday, Nov. 15, 2026 has a team line-score column after the second period, or a team-summary period after the 2nd half. No if that box score has only a 1st half and a 2nd half. If no official final score is posted, this forecast stays unresolved. Do not use a recap or a broadcast graphic.",
  prior: [0.06, 0.94],
  priorMethod: "Base rate: NCAA Division I men's basketball games go to overtime roughly 5-7% of the time; no specific indicator raises or lowers that for this matchup.",
  priorSources: [SCHEDULE_SOURCE],
  priorAt: "2026-11-14T17:24:00-08:00",
  horizon: "live",
  group: "prop",
  period: "full",
  eventId: "mens-basketball-montana-state",
};

const POINTS_70: EventMarketSpec = {
  id: "mens-basketball-montana-state-points-70",
  category: "Sports",
  label: "Men's basketball",
  summary: "Cal Poly at Montana State men's basketball, Sunday, Nov. 15. Yes if Cal Poly's official points total is at least 70. Overtime points count.",
  question: "Will Cal Poly's official points total at Montana State be at least 70?",
  outcomes: ["Yes", "No"],
  closeLabel: CLOSE_LABEL,
  closesAt: CLOSES_AT,
  sourceName: SCHEDULE_SOURCE.name,
  sourceUrl: SCHEDULE_SOURCE.url,
  resolutionRule:
    "Yes if Cal Poly's points total on the official box score linked from the Cal Poly men's basketball schedule for Cal Poly at Montana State on Sunday, Nov. 15, 2026 is at least 70. Read the Total on Cal Poly's team line score, which matches the pts figure on the Cal Poly totals row. Overtime points count in that total. No if that total is below 70. If that total is not posted, this forecast stays unresolved. Do not use a recap or a broadcast graphic.",
  prior: [0.84, 0.16],
  priorMethod: "Cal Poly is averaging 79.0 points per game this season (4 games); P(points ≥ 70) = 1 − Φ((70 − 79) / 9) using a single-team scoring σ of 9.",
  priorSources: [{ name: "Fox Sports Cal Poly team stats", url: "https://www.foxsports.com/college-basketball/cal-poly-mustangs-team-stats" }],
  priorAt: "2026-11-14T17:26:00-08:00",
  horizon: "live",
  group: "team-total",
  period: "full",
  line: 70,
  eventId: "mens-basketball-montana-state",
};

const CAL_POLY_PPG_SOURCE = { name: "Fox Sports Cal Poly team stats", url: "https://www.foxsports.com/college-basketball/cal-poly-mustangs-team-stats" };
const MONTANA_STATE_PPG_SOURCE = { name: "ESPN Montana State team page", url: "https://www.espn.com/mens-college-basketball/team/_/id/147/montana-state-bobcats" };

// Team-total ladder for Cal Poly, in half points (so no line can push/tie),
// centered a half point above the season average to keep that convention.
const CAL_POLY_TOTAL_LADDER = generateOverUnderLadder({
  eventId: "mens-basketball-montana-state",
  idPrefix: "mens-basketball-montana-state-cp-total",
  category: "Sports",
  group: "team-total",
  period: "full",
  subject: "Cal Poly's points",
  center: 79.5,
  step: 5,
  sidesEachWay: 2,
  sigma: 9,
  closeLabel: CLOSE_LABEL,
  closesAt: CLOSES_AT,
  sourceName: CAL_POLY_PPG_SOURCE.name,
  sourceUrl: CAL_POLY_PPG_SOURCE.url,
  priorMethod: "Cal Poly is averaging 79.0 points per game this season (4 games); modeled as Normal(79.0, 9). Ladder lines use half points, a half point above that average, so no line can land on an exact tie.",
  priorSources: [CAL_POLY_PPG_SOURCE],
  priorAt: "2026-11-14T17:30:00-08:00",
  horizon: "live",
  resolutionRuleFor: (line) =>
    `Over if Cal Poly's points total on the official box score linked from the Cal Poly men's basketball schedule for Cal Poly at Montana State on Sunday, Nov. 15, 2026 is over ${line}. Under if it's under. Overtime points count. If that total is not posted, this forecast stays unresolved.`,
});

// Combined game total, modeled from both teams' season scoring averages
// (no posted total was found for this game). Half points, same convention.
const GAME_TOTAL_LADDER = generateOverUnderLadder({
  eventId: "mens-basketball-montana-state",
  idPrefix: "mens-basketball-montana-state-total",
  category: "Sports",
  group: "total",
  period: "full",
  subject: "the combined final score",
  center: 155.5,
  step: 7,
  sidesEachWay: 2,
  sigma: 11,
  closeLabel: CLOSE_LABEL,
  closesAt: CLOSES_AT,
  sourceName: "Cal Poly and Montana State team stats",
  sourceUrl: CAL_POLY_PPG_SOURCE.url,
  priorMethod: "No posted total was found for this game. Modeled as Cal Poly's 79.0 PPG + Montana State's 76.0 PPG = 155.0, Normal(155.0, 11) per the college-basketball total model. Ladder lines use half points, a half point above that model total.",
  priorSources: [CAL_POLY_PPG_SOURCE, MONTANA_STATE_PPG_SOURCE],
  priorAt: "2026-11-14T17:32:00-08:00",
  horizon: "live",
  resolutionRuleFor: (line) =>
    `Over if the combined final score (Cal Poly's points plus Montana State's points) on the official box score linked from the Cal Poly men's basketball schedule for Cal Poly at Montana State on Sunday, Nov. 15, 2026 is over ${line}. Under if it's under. Overtime points count. If that total is not posted, this forecast stays unresolved.`,
});

export function marketMeta(marketId: string): Pick<EventMarketSpec, "group" | "period" | "line" | "eventId"> | null {
  for (const event of LIVE_EVENTS) {
    const market = event.markets.find((item) => item.id === marketId);
    if (market) return { group: market.group, period: market.period, line: market.line, eventId: market.eventId };
  }
  return null;
}

export function findEventForMarket(marketId: string): LocalEvent | undefined {
  return LIVE_EVENTS.find((event) => event.markets.some((market) => market.id === marketId));
}

/** Team logo per outcome label, for a moneyline market's outcome buttons. */
export function teamLogosForMarket(marketId: string): ReadonlyMap<string, string> | null {
  const event = findEventForMarket(marketId);
  const market = event?.markets.find((item) => item.id === marketId);
  if (!event || !market || market.group !== "moneyline") return null;
  return new Map(event.teams.map((team) => [team.short, team.logo]));
}

export const LIVE_EVENTS: readonly LocalEvent[] = [
  {
    id: "mens-basketball-montana-state",
    category: "Sports",
    horizon: "live",
    title: "Cal Poly vs. Montana State",
    startsAt: CLOSES_AT,
    venue: "Worthington Arena, Bozeman, MT",
    teams: [
      { name: "Cal Poly Mustangs", short: "Cal Poly", logo: "/teams/cal-poly.svg", record: "2-2", color: "#154734" },
      { name: "Montana State Bobcats", short: "Montana State", logo: "/teams/montana-state.svg", record: "1-2", color: "#00205B" },
    ],
    sourceUrl: SCHEDULE_SOURCE.url,
    markets: [MONEYLINE, HALFTIME, OVERTIME, POINTS_70, ...CAL_POLY_TOTAL_LADDER, ...GAME_TOTAL_LADDER],
  },
];
