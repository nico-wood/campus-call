import { ExampleConfirmButton } from "./example-confirm-button";
import {
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

  return (
    <Shell category={category} query={query}>
      <article className="event">
        <p className="event-back">
          <a className="back-link" href={forecastListHref(category, query)}>
            Forecasts
          </a>
        </p>
        <h1 className="event-question">{example.question}</h1>
        <p className="example-label">Example</p>
        <p className="forecast-close">Closes {example.closeLabel}</p>
        <p className="written-note">We wrote this example. It is not a live forecast.</p>
        <section className="probability" aria-labelledby={probabilityId}>
          <h3 id={probabilityId} className="probability-caption">
            Market probability
          </h3>
          <ul className="outcomes">
            {example.outcomes.map((outcome) => (
              <li key={outcome.id} className="outcome">
                <span className="outcome-label">{outcome.label}</span>
                <span className="outcome-percent">{outcome.percent}%</span>
              </li>
            ))}
          </ul>
        </section>
        <ExampleConfirmButton />
      </article>
    </Shell>
  );
}
