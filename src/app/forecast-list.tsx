import {
  emptyForecastMessage,
  exampleEventHref,
  type ExampleForecast,
  type ListState,
} from "./example-forecasts";

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
      <div className="page-intro">
        <p className="eyebrow">The campus forecast board</p>
        <h1 id="forecast-list-heading" className="list-heading">What happens next?</h1>
        <p className="intro-description">A different way to follow campus.</p>
      </div>
      {note}
      <ul className="forecast-list" aria-labelledby="forecast-list-heading">
        {examples.map((example) => (
          <li key={example.id}>
            <article className="forecast-card">
              <div className="card-meta">
                <span className="card-category">{example.category}</span>
                <p className="example-label">Example</p>
              </div>
              <h2>{example.question}</h2>
              <p className="forecast-close">Closes {example.closeLabel}</p>
              <p className="written-note">We wrote this example. It is not a live forecast.</p>
              <section className="probability" aria-labelledby={`${example.id}-probability`}>
                <h3 id={`${example.id}-probability`} className="probability-caption">
                  Market probability
                </h3>
                <ul className="outcomes">
                  {example.outcomes.map((outcome) => (
                    <li key={outcome.id}>
                      <a
                        className="outcome"
                        href={exampleEventHref(example.id, state.category, state.query)}
                      >
                        <span className="outcome-label">{outcome.label}</span>
                        <span className="outcome-percent">{outcome.percent}%</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
