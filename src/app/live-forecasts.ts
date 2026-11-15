import { marketsFromEvents } from "./events";
import { LIVE_EVENTS } from "./live-events";

export const LIVE_CATEGORIES = ["All", "Sports", "Club sports", "Transit", "Campus", "Weather", "Academics", "Hackathon"] as const;

export type PriorSource = { name: string; url: string };

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
  /** Starting probability per outcome. Must sum to 1. */
  prior: readonly number[];
  /** One short line describing how the prior was computed. */
  priorMethod: string;
  priorSources: readonly PriorSource[];
  /** ISO timestamp of when the prior was last computed/checked. */
  priorAt: string;
  /** Live closes and resolves within the prize window; futures resolve later. */
  horizon: "live" | "futures";
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

/** Standalone markets not tied to a team matchup event. */
const STANDALONE_FORECASTS: readonly LiveForecast[] = [
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
    prior: [0.9, 0.1],
    priorMethod: "Default prior for a \"still listed\" event question with no indication of cancellation risk.",
    priorSources: [{ name: "Cal Poly events listing", url: "https://events.calpoly.edu/event-listing" }],
    priorAt: "2026-11-14T17:10:00-08:00",
    horizon: "live",
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
    prior: [0.37, 0.63],
    priorMethod: "NWS forecast high 69°F for Sunday, σ 3°F (Φ model): P(high ≥ 70°F) = 1 − Φ((70 − 69) / 3).",
    priorSources: [{ name: "NWS gridpoint forecast (LOX 78,112)", url: "https://api.weather.gov/gridpoints/LOX/78,112/forecast" }],
    priorAt: "2026-11-14T17:12:00-08:00",
    horizon: "live",
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
    prior: [0.9, 0.1],
    priorMethod: "Default prior for a \"still listed\" question; the active alert's posted window (through Dec. 31, 2026) already covers this moment with no sign of early removal.",
    priorSources: [{ name: "SLO Transit service alerts", url: "https://slocity.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/alert" }],
    priorAt: "2026-11-14T17:22:00-08:00",
    horizon: "live",
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
    prior: [0.9, 0.1],
    priorMethod: "Default prior for a \"still listed\" event question with no indication of cancellation risk.",
    priorSources: [{ name: "Cal Poly Arts", url: "https://www.calpolyarts.org/20262027-season/las-migas" }],
    priorAt: "2026-11-14T17:23:00-08:00",
    horizon: "live",
  },
  {
    id: "cal-poly-grad-rate-90",
    category: "Academics",
    label: "Academics",
    summary: "Yes if Cal Poly's next officially published 6-year graduation rate for an entering freshman cohort is at least 90%.",
    question: "Will Cal Poly's next published 6-year graduation rate be at least 90%?",
    outcomes: ["Yes", "No"],
    closeLabel: "Resolves on Cal Poly's next published rate (typically published annually)",
    closesAt: "2027-12-31T23:59:00-08:00",
    sourceName: "Cal Poly institutional accreditation: Student Success",
    sourceUrl: "https://wasc.calpoly.edu/student-achievement-measures/student-success",
    resolutionRule:
      "Yes if the next 6-year graduation rate Cal Poly publishes on its institutional accreditation \"Student Success\" page (or successor institutional-research page) for a first-time, full-time freshman cohort is at least 90%. No if it's below 90%. Resolves against the first such rate published after today that is newer than the rate most recently published as of Nov. 14, 2026 (92%, Fall 2017 cohort). If no newer rate is published by the close date, this forecast stays unresolved.",
    prior: [0.84, 0.16],
    priorMethod: "Cal Poly's most recently published 6-year graduation rate is 92% (Fall 2017 cohort); these rates move only a few points year to year. Modeled as Normal(92, 2); P(next rate ≥ 90) = 1 − Φ((90 − 92) / 2).",
    priorSources: [{ name: "Cal Poly institutional accreditation: Student Success", url: "https://wasc.calpoly.edu/student-achievement-measures/student-success" }],
    priorAt: "2026-11-14T17:40:00-08:00",
    horizon: "futures",
  },
  {
    id: "cal-poly-fall-2027-enrollment-24000",
    category: "Academics",
    label: "Academics",
    summary: "Yes if Cal Poly's official Fall 2027 total enrollment headcount is at least 24,000.",
    question: "Will Cal Poly's Fall 2027 total enrollment be at least 24,000?",
    outcomes: ["Yes", "No"],
    closeLabel: "Resolves after Fall 2027 census enrollment is published",
    closesAt: "2027-11-15T23:59:00-08:00",
    sourceName: "Cal Poly news: enrollment report",
    sourceUrl: "https://inside.calpoly.edu/cal-poly-sees-highest-enrollment-in-university-history-see-the-data",
    resolutionRule:
      "Yes if Cal Poly's official Fall 2027 total enrollment headcount, as published by Cal Poly or the CSU Chancellor's Office, is at least 24,000. No if it's below 24,000. If no Fall 2027 enrollment figure is published by the close date, this forecast stays unresolved.",
    prior: [0.59, 0.41],
    priorMethod: "Fall 2025 enrollment was 23,245, up 1.8% from 22,842 in Fall 2024. Projecting that growth rate two more years gives a modeled Fall 2027 figure of about 24,089. P(≥ 24,000) = 1 − Φ((24,000 − 24,089) / 400), sigma chosen as a 2-year-ahead uncertainty band.",
    priorSources: [{ name: "Cal Poly news: enrollment report", url: "https://inside.calpoly.edu/cal-poly-sees-highest-enrollment-in-university-history-see-the-data" }],
    priorAt: "2026-11-14T17:42:00-08:00",
    horizon: "futures",
  },
  {
    id: "cal-poly-us-news-best-in-west-streak",
    category: "Academics",
    label: "Academics",
    summary: "Yes if U.S. News ranks Cal Poly #1 'Best in the West' (Regional Universities West) again in its next Best Colleges rankings.",
    question: "Will U.S. News rank Cal Poly #1 'Best in the West' again next year?",
    outcomes: ["Yes", "No"],
    closeLabel: "Resolves when U.S. News publishes its next Best Colleges rankings",
    closesAt: "2027-10-31T23:59:00-08:00",
    sourceName: "Cal Poly news: U.S. News rankings",
    sourceUrl: "https://ucm.calpoly.edu/news/cal-poly-continues-streak-best-west-2026-us-news-and-world-report-rankings",
    resolutionRule:
      "Yes if U.S. News & World Report's next annual Best Colleges rankings (published after today) ranks Cal Poly #1 among public Regional Universities West (or the successor category covering the same peer group). No if Cal Poly is ranked below #1 in that category. If U.S. News does not publish a next edition by the close date, this forecast stays unresolved.",
    prior: [0.95, 0.05],
    priorMethod: "Cal Poly has held the #1 'Best in the West' public-university rank for 33 consecutive years as of the 2026 rankings; a base rate derived from that streak's own persistence (roughly 1 miss in ~20 years historically) is used rather than an even prior.",
    priorSources: [{ name: "Cal Poly news: U.S. News rankings", url: "https://ucm.calpoly.edu/news/cal-poly-continues-streak-best-west-2026-us-news-and-world-report-rankings" }],
    priorAt: "2026-11-14T17:44:00-08:00",
    horizon: "futures",
  },
];

/** The full catalog: standalone markets plus every market generated from an event (see live-events.ts). */
export const LIVE_FORECASTS: readonly LiveForecast[] = [...STANDALONE_FORECASTS, ...marketsFromEvents(LIVE_EVENTS)];
