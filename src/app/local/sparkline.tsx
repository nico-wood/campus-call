import { useId } from "react";
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
  const fillId = useId();
  const values = history.length > 0 ? history.map((tick) => tick.p[outcomeIdx] ?? 0) : [0.5, 0.5];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const coordinates = values
    .map((value, index) => {
      const x = values.length > 1 ? 2 + (index / (values.length - 1)) * (width - 4) : width / 2;
      const y = range ? height - 2 - ((value - min) / range) * (height - 4) : height / 2;
      return { x, y };
    });
  const points = coordinates.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const first = coordinates[0]!;
  const last = coordinates[coordinates.length - 1]!;
  const trend = values[values.length - 1]! - values[0]!;
  const area = `M${points.replaceAll(" ", " L")} L${last.x},${height - 2} L${first.x},${height - 2} Z`;

  return (
    <svg className={`sparkline ${trend < 0 ? "sparkline-down" : "sparkline-up"}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs><linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity="0.22" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${fillId})`} />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2" fill="currentColor" />
    </svg>
  );
}
