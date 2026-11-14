export const LIVE_CATEGORIES = ["All", "Sports", "Club sports", "Transit", "Campus", "Weather", "Hackathon"] as const;

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
    id: "arab-ensemble-fall-concert",
    category: "Campus",
    label: "Arab Music Ensemble",
    summary: "Yes if the Cal Poly events listing still shows this concert on Saturday, Nov. 14, 2026 at 7:30 p.m. A start time that is not on that listing is not the result.",
    question: "Will the Arab Music Ensemble Fall Concert stay listed for 7:30 p.m. tonight?",
    outcomes: ["Yes", "No"],
    closeLabel: "Saturday, Nov. 14, 2026, 6:55 p.m. PT",
    closesAt: "2026-11-14T18:55:00-08:00",
    sourceName: "Cal Poly events listing",
    sourceUrl: "https://events.calpoly.edu/event-listing",
    resolutionRule:
      "Yes if a saved copy of the Cal Poly events listing, taken at 7:00 p.m. PT on Saturday, Nov. 14, 2026 or the first saved copy after that time and before 7:30 p.m., still lists Cal Poly Arab Music Ensemble Fall Concert on Saturday, November 14, 2026 at 7:30pm. No if that copy omits the concert, marks it cancelled, or lists a different clock time. If no copy is saved, this forecast stays unresolved. Do not use attendance or an unpublished start time.",
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
    id: "route-4a-sunday-detour",
    category: "Transit",
    label: "Route 4A",
    summary: "Yes if the official SLO Transit alert feed still names a Route 4A detour or stop closure that covers 5:00 p.m. Sunday. The posted window runs through Dec. 31.",
    question: "At 5:00 p.m. Sunday, will SLO Transit still list a Route 4A detour?",
    outcomes: ["Yes", "No"],
    closeLabel: "Sunday, Nov. 15, 2026, 4:55 p.m. PT",
    closesAt: "2026-11-15T16:55:00-08:00",
    sourceName: "SLO Transit service alerts",
    sourceUrl: "https://slocity.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/alert",
    resolutionRule:
      "Yes if a saved copy of the SLO Transit GTFS-realtime alerts feed at https://slocity.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/alert, taken at 5:00 p.m. PT on Sunday, Nov. 15, 2026 or the first saved copy after that time, contains an alert that names Route 4A and a detour or stop closure whose stated dates include that moment. No if that copy has no such alert. If no copy is saved, this forecast stays unresolved. Do not use a third-party timetable or an unpublished arrival time. The current alert cites https://www.slocity.org/government/department-directory/public-works/slo-transit/rider-alerts-news and names Routes 4A, 4B, and the Highland Tripper from Mon, 10/12/26 through Thur, 12/31/26.",
  },
  {
    id: "las-migas-spanos",
    category: "Campus",
    label: "Cal Poly Arts",
    summary: "Yes if the official Cal Poly Arts page still shows Sunday, Nov. 15, 2026, 7:30 p.m., at the Alex and Faye Spanos Theatre, and does not say the performance is cancelled or postponed.",
    question: "Will Cal Poly Arts still list Las Migas for 7:30 p.m. Sunday at the Spanos Theatre?",
    outcomes: ["Yes", "No"],
    closeLabel: "Sunday, Nov. 15, 2026, 6:55 p.m. PT",
    closesAt: "2026-11-15T18:55:00-08:00",
    sourceName: "Cal Poly Arts",
    sourceUrl: "https://www.calpolyarts.org/20262027-season/las-migas",
    resolutionRule:
      "Yes if a saved copy of https://www.calpolyarts.org/20262027-season/las-migas, taken at 7:00 p.m. PT on Sunday, Nov. 15, 2026 or the first saved copy after that time and before 7:30 p.m., still shows Sunday, November 15, 2026, 7:30 PM, at the Alex and Faye Spanos Theatre, and does not say the performance is cancelled or postponed. No if that copy says cancelled or postponed, or shows a different date, clock time, or venue. If no copy is saved, this forecast stays unresolved. Do not use ticket counts or attendance.",
  },
];
