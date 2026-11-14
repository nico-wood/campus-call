import {
  emptyForecastMessage,
  type ListState,
} from "./example-forecasts";
import { ForecastIcon } from "./forecast-icon";
import { filterLiveForecasts } from "./live-forecasts";
import { LivePosition } from "./live-position";
import { VolleyballMatch, volleyballSearchText } from "./volleyball-match";

const PRIZE_TEXT = "hackathon prize forecasts main ranking challenge teams";

export function ForecastList({ state }: { state: ListState }) {
  const query = state.query.trim().toLowerCase();
  const forecasts = filterLiveForecasts(state.category, query);
  const sportsBoard = state.category === "Sports" || state.category === "All";
  const showMatch = sportsBoard && (query.length === 0 ? state.category === "Sports" : volleyballSearchText().includes(query));
  const showPrize = state.category === "Hackathon" && (query.length === 0 || PRIZE_TEXT.includes(query));
  const prize = showPrize ? (
    <a className="hackathon-prize-link" href="/hackathon?section=forecast">
      <span><strong>Hackathon prize forecasts</strong><span>Pick teams for the main ranking and individual challenge prizes.</span></span>
      <span aria-hidden="true">↗</span>
    </a>
  ) : null;
  const note = (
    <p className="list-note">
      These forecasts resolve from a public source. A confirm does not open a position or change virtual credits.
    </p>
  );

  if (forecasts.length === 0 && !showMatch && !showPrize) {
    return (
      <section className="empty" aria-labelledby="forecast-list-heading">
        <h1 id="forecast-list-heading">No matching forecasts</h1>
        <p>{emptyForecastMessage(state)}</p>
      </section>
    );
  }

  return (
    <>
      <div className="browse-heading">
        <h1 id="forecast-list-heading" className="list-heading">Campus forecasts</h1>
        {forecasts.length > 0 ? (
          <span className="browse-count">{forecasts.length} {forecasts.length === 1 ? "forecast" : "forecasts"}</span>
        ) : null}
      </div>
      {showMatch || forecasts.length > 0 ? note : null}
      {showMatch ? <VolleyballMatch /> : null}
      {prize}
      {forecasts.length > 0 ? (
        <ul className="forecast-list" aria-labelledby="forecast-list-heading">
          {forecasts.map((forecast) => (
            <li key={forecast.id}>
              <article className="forecast-card live-forecast-card">
                <div className="card-meta">
                  <span className="card-category"><ForecastIcon category={forecast.category} />{forecast.label}</span>
                </div>
                <h2>{forecast.question}</h2>
                <p>{forecast.summary}</p>
                <LivePosition id={forecast.id} outcomes={forecast.outcomes} />
                <div className="card-footer">
                  <p className="forecast-close">Closes {forecast.closeLabel}</p>
                  <a href={forecast.sourceUrl}>{forecast.sourceName}</a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
