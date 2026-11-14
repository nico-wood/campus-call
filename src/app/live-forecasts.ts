export const LIVE_CATEGORIES = ["All", "Sports", "Weather", "Hackathon"] as const;

export type LiveForecast = {
  id: string;
  category: Exclude<(typeof LIVE_CATEGORIES)[number], "All">;
  label: string;
  question: string;
  summary: string;
  outcomes: readonly string[];
  closeLabel: string;
  closesAt: string;
  sourceName: string;
  sourceUrl: string;
  resolutionRule: string;
};

export function filterLiveForecasts(category: string, query: string): readonly LiveForecast[] {
  if (category === "unknown") return [];
  const needle = query.trim().toLowerCase();
  return LIVE_FORECASTS.filter((forecast) => {
    if (category !== "All" && forecast.category !== category) return false;
    if (!needle) return true;
    const haystack = [
      forecast.label,
      forecast.question,
      forecast.summary,
      forecast.category,
      forecast.closeLabel,
      forecast.sourceName,
      forecast.resolutionRule,
      ...forecast.outcomes,
    ].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
}

export const LIVE_FORECASTS: readonly LiveForecast[] = [
  {
    id: "mens-basketball-montana-state-winner",
    category: "Sports",
    label: "Men's basketball",
    summary: "Resolves to the winner on the official final score, including overtime.",
    question: "Who will win: Cal Poly or Montana State?",
    outcomes: ["Cal Poly", "Montana State"],
    closeLabel: "Sunday, Nov. 15, 2026, 2:55 p.m. PT",
    closesAt: "2026-11-15T14:55:00-08:00",
    sourceName: "Cal Poly men's basketball schedule",
    sourceUrl: "https://gopoly.com/sports/mens-basketball/schedule",
    resolutionRule:
      "Resolves to the winner on the official final score. Tip is Sunday, Nov. 15, 2026, 4:00 p.m. MT (3:00 p.m. PT) at Worthington Arena. Overtime counts. If no official final score is posted, this forecast stays unresolved.",
  },
  {
    id: "mens-basketball-montana-state-halftime",
    category: "Sports",
    label: "Men's basketball",
    summary: "Resolves from the 1st half totals on the official box score. Tied when those totals are equal.",
    question: "Who will lead at halftime?",
    outcomes: ["Cal Poly", "Montana State", "Tied"],
    closeLabel: "Sunday, Nov. 15, 2026, 2:55 p.m. PT",
    closesAt: "2026-11-15T14:55:00-08:00",
    sourceName: "Cal Poly men's basketball schedule",
    sourceUrl: "https://gopoly.com/sports/mens-basketball/schedule",
    resolutionRule:
      "Resolves from the 1st half totals on the official box score linked from the Cal Poly men's basketball schedule. Cal Poly if its 1st half total is higher, Montana State if its 1st half total is higher, and Tied if the totals are equal. If those totals are not posted, this forecast stays unresolved.",
  },
  {
    id: "sunday-high-ksbp",
    category: "Weather",
    label: "Weather",
    summary: "Yes if Sunday's highest observed temperature at station KSBP is at least 70°F. A forecast is not the result.",
    question: "Will Sunday's observed high at San Luis Obispo Airport reach 70°F?",
    outcomes: ["Yes", "No"],
    closeLabel: "Saturday, Nov. 14, 2026, 11:59 p.m. PT",
    closesAt: "2026-11-14T23:59:00-08:00",
    sourceName: "National Weather Service station KSBP",
    sourceUrl: "https://api.weather.gov/stations/KSBP/observations",
    resolutionRule:
      "Yes if the highest temperature value in KSBP observations timestamped from 2026-11-15T00:00:00-08:00 inclusive to 2026-11-16T00:00:00-08:00 exclusive, converted by (Celsius × 9/5) + 32, is at least 70. Ignore observations with no temperature value. Do not use the forecast text. If that day has no temperature observation, this forecast stays unresolved.",
  },
];
