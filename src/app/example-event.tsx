import type { CSSProperties } from "react";
import { ExampleConfirmButton } from "./example-confirm-button";
import {
  EXAMPLES,
  exampleEventHref,
  forecastListHref,
  type Category,
  type ExampleForecast,
} from "./example-forecasts";
import { Shell } from "./shell";

export function ExampleEventView({
  example,
  category,
  query,
}: {
  example: ExampleForecast;
  category: Category;
  query: string;
}) {
  const probabilityId = `${example.id}-event-probability`;
  const currentIndex = EXAMPLES.findIndex(item => item.id === example.id);
  const relatedExamples = [...EXAMPLES.slice(currentIndex + 1), ...EXAMPLES.slice(0, currentIndex)].slice(0, 3);

  return (
    <Shell category={category} query={query}>
      <article className="event example-layout">
        <p className="event-back">
          <a className="back-link" href={forecastListHref(category, query)}>
            Forecasts
          </a>
        </p>
        <div className="example-overview">
          <h1 className="event-question">{example.question}</h1>
          <p className="example-label">Example</p>
          <p className="forecast-close">Closes {example.closeLabel}</p>
          <p className="written-note">We wrote this example. It is not a live forecast.</p>
          <section className="probability" aria-labelledby={probabilityId}>
            <h2 id={probabilityId} className="probability-caption">
              Market probability
            </h2>
            <ul className="outcomes">
              {example.outcomes.map((outcome) => (
                <li key={outcome.id} className="outcome">
                  <span className="outcome-label">{outcome.label}</span>
                  <span className="outcome-percent">{outcome.percent}%</span>
                  <span className="probability-track" style={{ "--probability": `${outcome.percent}%` } as CSSProperties} aria-hidden="true" />
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside id="example-ticket" className="example-ticket" tabIndex={-1} aria-labelledby="example-ticket-title">
          <p className="eyebrow">Example ticket</p>
          <h2 id="example-ticket-title">Preview a position</h2>
          <p className="written-note">Explore how a forecast is presented. This example stays a preview.</p>
          <ExampleConfirmButton />
        </aside>
        <nav className="example-related" aria-labelledby="related-examples-title">
          <h2 id="related-examples-title">Explore more examples</h2>
          <div className="related-list">
            {relatedExamples.map(item => (
              <a href={exampleEventHref(item.id, category, query)} key={item.id}>
                <span className="card-category">{item.category}</span>
                <span>{item.question}</span>
                <span className="related-action">View example <span aria-hidden="true">→</span></span>
              </a>
            ))}
          </div>
        </nav>
      </article>
    </Shell>
  );
}
