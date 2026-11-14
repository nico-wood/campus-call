import {
  emptyForecastMessage,
  exampleEventHref,
  type ExampleForecast,
  type ListState,
} from "./example-forecasts";
import { ForecastIcon } from "./forecast-icon";
import { ProbabilityVisual } from "./probability-visual";
import { VolleyballMatch, volleyballSearchText } from "./volleyball-match";

export function ForecastList({
  state,
  examples,
}: {
  state: ListState;
  examples: readonly ExampleForecast[];
}) {
  const query = state.query.trim().toLowerCase();
  const showMatch = state.category === "Sports" && (query.length === 0 || volleyballSearchText().includes(query));
  const match = showMatch ? <VolleyballMatch /> : null;
  const note = (
    <p className="list-note">
      Example forecasts we wrote. They are not live. A confirm does not open a position or change
      virtual credits.
    </p>
  );

  if (examples.length === 0) {
    if (match) return match;
    return (
      <>
        {note}
        <section className="empty" aria-labelledby="forecast-list-heading">
          <h1 id="forecast-list-heading">No matching forecasts</h1>
          <p>{emptyForecastMessage(state)}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="browse-heading">
        <h1 id="forecast-list-heading" className="list-heading">Campus forecasts</h1>
        <span className="browse-count">{examples.length} {examples.length === 1 ? "example" : "examples"}</span>
      </div>
      {match}
      {note}
      {state.category === "Hackathon" ? <a className="hackathon-prize-link" href="/hackathon?section=forecast"><span><strong>Hackathon prize forecasts</strong><span>Pick teams for the main ranking and individual challenge prizes.</span></span><span aria-hidden="true">↗</span></a> : null}
      <ul className="forecast-list" aria-labelledby="forecast-list-heading">
        {examples.map((example) => (
          <li key={example.id}>
            <article className="forecast-card">
              <div className="card-meta">
                <span className="card-category"><ForecastIcon category={example.category} />{example.category}</span>
                <p className="example-label">Example</p>
              </div>
              <h2><a href={exampleEventHref(example.id, state.category, state.query)}>{example.question}</a></h2>
              <section className="probability" aria-labelledby={`${example.id}-probability`}>
                <h3 id={`${example.id}-probability`} className="probability-caption">
                  Market probability
                </h3>
                <ProbabilityVisual example={example} compact />
                <ul className="outcomes">
                  {example.outcomes.map((outcome) => (
                    <li key={outcome.id}>
                      <a
                        className="outcome"
                        href={`${exampleEventHref(example.id, state.category, state.query)}#example-ticket`}
                      >
                        <span className="outcome-label">{outcome.label}</span>
                        <span className="outcome-percent">{outcome.percent}%</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <p className="written-note">We wrote this example. It is not a live forecast.</p>
              <div className="card-footer">
                <p className="forecast-close">Closes {example.closeLabel}</p>
                <a className="card-open" href={exampleEventHref(example.id, state.category, state.query)} aria-label={`View example: ${example.question}`}><span aria-hidden="true">↗</span></a>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
