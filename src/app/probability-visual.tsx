import type { CSSProperties } from "react";
import type { ExampleForecast } from "./example-forecasts";

/** A snapshot of the supplied example probabilities; no simulated history. */
export function ProbabilityVisual({ example, compact = false }: { example: ExampleForecast; compact?: boolean }) {
  const [first, second] = example.outcomes;
  if (compact) {
    // Adapted from Isaiah's 21st.dev Prediction Market Card progress bar.
    // https://21st.dev/@isaiahbjork/components/prediction-market-card
    const progressValue = (first.percent / (first.percent + second.percent)) * 100;
    return (
      <div className="probability-split" style={{ "--probability": `${progressValue}%` } as CSSProperties} aria-hidden="true">
        <div className="split-first" />
        <div className="split-separator" />
      </div>
    );
  }
  return (
    <div className="probability-snapshot">
      <div className="probability-lead">
        <span className="probability-value">{first.percent}<span>%</span></span>
        <span className="probability-summary">{first.label}<span className="probability-divider"> / </span>{second.label} {second.percent}%</span>
      </div>
      <svg className="probability-ring" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <circle className="ring-base" cx="44" cy="44" r="34" strokeWidth="8" />
        <circle className="ring-value" cx="44" cy="44" r="34" strokeWidth="8" pathLength="100" strokeDasharray={`${first.percent} ${100 - first.percent}`} transform="rotate(-90 44 44)" />
        <circle className="ring-center" cx="44" cy="44" r="3" />
      </svg>
    </div>
  );
}
