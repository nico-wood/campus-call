"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { ExampleForecast } from "./example-forecasts";

// Authored visual fixtures only. These are not observations or transaction history.
const OFFSETS = [-12, -12, -10, -14, -9, -8, -10, -4, -5, -2, -7, -3, -1, 3, 1, 5, 4, 2, 6, 3, 5, 2, 0];

export function ForecastChart({ example }: { example: ExampleForecast }) {
  const [recent, setRecent] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const figure = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(704);
  useEffect(() => {
    const element = figure.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [first, second] = example.outcomes;
  const values = OFFSETS.slice(recent ? -10 : 0).map(offset => Math.max(2, Math.min(98, first.percent + offset)));
  const index = Math.min(active ?? values.length - 1, values.length - 1);
  const plotWidth = width - 64;
  const plotHeight = 278;
  const x = (i: number) => 8 + i * plotWidth / (values.length - 1);
  const y = (value: number) => 240 - value * 2;
  const path = (inverse: boolean) => values.map((value, i) => `${i ? "L" : "M"}${x(i)},${y(inverse ? 100 - value : value)}`).join(" ");
  const crossX = cursor?.x ?? x(index);
  const crossY = cursor?.y ?? y(values[index]);

  function scrub(event: ReactPointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    const localX = (event.clientX - bounds.left) / bounds.width * width;
    const localY = (event.clientY - bounds.top) / bounds.height * plotHeight;
    const next = Math.max(0, Math.min(values.length - 1, Math.round((localX - 8) / plotWidth * (values.length - 1))));
    setActive(next);
    setCursor({
      x: Math.max(8, Math.min(width - 48, localX)),
      y: Math.max(30, Math.min(240, localY)),
    });
  }

  return (
    <figure ref={figure} className="forecast-chart">
      <div className="chart-toolbar">
        <div className="chart-legend"><span><i />{first.label} <strong>{values[index]}%</strong></span><span><i />{second.label} <strong>{100 - values[index]}%</strong></span></div>
        <div className="chart-ranges" aria-label="Chart range">
          <button type="button" aria-pressed={!recent} onClick={() => { setRecent(false); setActive(null); setCursor(null); }}>Full view</button>
          <button type="button" aria-pressed={recent} onClick={() => { setRecent(true); setActive(null); setCursor(null); }}>Recent</button>
        </div>
      </div>
      <svg className="history-chart" viewBox={`0 0 ${width} ${plotHeight}`} role="img" aria-label={`Illustrative probability history for ${first.label} and ${second.label}. Current example: ${first.percent}% and ${second.percent}%. Not live data.`}
        onPointerDown={event => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); scrub(event); }}
        onPointerMove={event => { if (event.pointerType !== "mouse" && !dragging.current) return; scrub(event); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; setActive(null); setCursor(null); }}
        onPointerLeave={() => { if (dragging.current) return; setActive(null); setCursor(null); }}>
        <rect className="chart-hit" x="0" y="0" width={width} height={plotHeight} fill="transparent" />
        {[0, 25, 50, 75, 100].map(value => <g key={value}><line className="chart-gridline" x1="8" x2={width - 48} y1={y(value)} y2={y(value)} /><text className="chart-axis" x={width - 38} y={y(value) + 4}>{value}%</text></g>)}
        <path className="chart-line chart-secondary" d={path(true)} />
        <path className="chart-line chart-primary" d={path(false)} />
        <line className="chart-crosshair" x1={crossX} x2={crossX} y1="30" y2="240" />
        <line className="chart-crosshair chart-crosshair-y" x1="8" x2={width - 48} y1={crossY} y2={crossY} />
        <circle className="chart-point chart-primary" cx={x(index)} cy={y(values[index])} r="5" />
        <circle className="chart-point chart-secondary" cx={x(index)} cy={y(100 - values[index])} r="5" />
        <text className="chart-axis" x="8" y="269">Illustrative start</text><text className="chart-axis" x={width - 56} y="269" textAnchor="end">Current example</text>
      </svg>
      <input className="chart-scrubber" type="range" min="0" max={values.length - 1} value={index} aria-label="Explore illustrative probability history" aria-valuetext={`${first.label} ${values[index]}%, ${second.label} ${100 - values[index]}%`} onChange={event => { setActive(Number(event.target.value)); setCursor(null); }} />
      <figcaption>Illustrative history · authored example, not live market data.</figcaption>
    </figure>
  );
}
