import {
  emptyForecastMessage,
  exampleEventHref,
  type ExampleForecast,
  type ListState,
} from "./example-forecasts";
import { ForecastIcon } from "./forecast-icon";

export function ForecastList({
  state,
  examples,
}: {
  state: ListState;
  examples: readonly ExampleForecast[];
}) {
  const note = (
    <p className="list-note">
      Example forecasts we wrote. They are not live. A confirm does not open a position or change
      virtual credits.
    </p>
  );

  if (examples.length === 0) {
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
      {note}
      <ul className="forecast-list" aria-labelledby="forecast-list-heading">
        {examples.map((example) => (
          <li key={example.id}>
            <article className="forecast-card">
              <div className="card-meta">
                <span className="card-category"><ForecastIcon category={example.category} />{example.category}</span>
                <p className="example-label">Example</p>
              </div>
              <h2><a href={exampleEventHref(example.id, state.category, state.query)}>{example.question}</a></h2>
              <p className="forecast-close">Closes {example.closeLabel}</p>
              <section className="probability" aria-labelledby={`${example.id}-probability`}>
                <h3 id={`${example.id}-probability`} className="probability-caption">
                  Market probability
                </h3>
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
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
