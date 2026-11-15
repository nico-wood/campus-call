import type { PriceTick } from "./markets";

export function Sparkline({
  history,
  outcomeIdx = 0,
  width = 64,
  height = 24,
}: {
  history: readonly PriceTick[];
  outcomeIdx?: number;
  width?: number;
  height?: number;
}) {
  const values = history.length > 0 ? history.map((tick) => tick.p[outcomeIdx] ?? 0) : [0.5, 0.5];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = values.length > 1 ? (index / (values.length - 1)) * width : width / 2;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
