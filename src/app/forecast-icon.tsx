import type { ForecastCategory } from "./example-forecasts";

export function ForecastIcon({ category }: { category: ForecastCategory }) {
  return (
    <span className="forecast-icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {category === "Sports" ? <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4v16M6.5 6.5c7 2 9 7 11 11M17.5 6.5c-7 2-9 7-11 11" /></> : null}
        {category === "Music" ? <><path d="M9 17V5l10-2v12M9 8l10-2" /><ellipse cx="6" cy="18" rx="3" ry="2" /><ellipse cx="16" cy="16" rx="3" ry="2" /></> : null}
        {category === "Dining" ? <><path d="M5 3v6c0 3 6 3 6 0V3M8 3v18M18 3c-3 2-4 5-4 9h5M19 3v18" /></> : null}
        {category === "Hackathon" ? <><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" /></> : null}
        {category === "Weather" ? <><circle cx="12" cy="12" r="3.5" /><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : null}
      </svg>
    </span>
  );
}
