import { ExampleMarket } from "./example-market";
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
        <ExampleMarket example={example} />
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
