"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { MergedMarket } from "./markets";

const PALETTE = ["#2E8F63", "#5B8DEF", "#C97BDE", "#4FC1C9", "#E8896B", "#A3B566"];
const RANGES = [
  { key: "1h", label: "1H", ms: 60 * 60 * 1000 },
  { key: "6h", label: "6H", ms: 6 * 60 * 60 * 1000 },
  { key: "all", label: "All", ms: null as number | null },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

export function LocalChart({ market }: { market: MergedMarket }) {
  const [range, setRange] = useState<RangeKey>("all");
  const [active, setActive] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
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

  const points = useMemo(() => {
    const now = Date.now();
    const cutoff = RANGES.find((item) => item.key === range)?.ms ?? null;
    const hasPrior = market.prior.length === market.outcomes.length;
    const priorPoint = hasPrior ? { t: market.createdAt, p: market.prior } : null;
    const base = priorPoint ? [priorPoint, ...market.history] : market.history.length > 0 ? market.history : [];
    const filtered = cutoff === null ? base : base.filter((tick) => now - Date.parse(tick.t) <= cutoff);
    const series = (filtered.length > 0 ? filtered : base).map((tick) => ({ t: tick.t, p: tick.p }));
    const last = series[series.length - 1];
    if (!last || last.p.join(",") !== market.prices.join(",")) {
      series.push({ t: new Date().toISOString(), p: market.prices });
    }
    return series;
  }, [market.history, market.prices, market.prior, market.outcomes.length, market.createdAt, range]);

  // Right-side budget is split between the end-of-line outcome labels and
  // the axis percentage labels so neither overlaps nor pushes content past
  // the figure's own box (which would show up as page horizontal overflow).
  const axisPad = 34;
  const outcomeLabelPad = 64;
  const rightMargin = axisPad + outcomeLabelPad;
  const plotWidth = width - 8 - rightMargin;
  const plotHeight = 260;
  const x = (i: number) => 8 + (points.length > 1 ? (i * plotWidth) / (points.length - 1) : plotWidth / 2);
  const y = (value: number) => 20 + (1 - value) * (plotHeight - 40);

  const index = Math.min(active ?? points.length - 1, points.length - 1);
  const activePoint = points[index];

  function scrub(event: ReactPointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || points.length < 2) return;
    const localX = ((event.clientX - bounds.left) / bounds.width) * width;
    const next = Math.max(0, Math.min(points.length - 1, Math.round(((localX - 8) / plotWidth) * (points.length - 1))));
    setActive(next);
    setCursorX(Math.max(8, Math.min(width - rightMargin, localX)));
  }

  return (
    <figure ref={figure} className="forecast-chart local-chart">
      <div className="chart-toolbar">
        <div className="chart-legend">
          {market.outcomes.map((label, i) => (
            <span key={label}>
              <i style={{ background: PALETTE[i % PALETTE.length] }} />
              {label} <strong>{Math.round((activePoint?.p[i] ?? market.prices[i]) * 100)}%</strong>
            </span>
          ))}
        </div>
        <div className="chart-ranges" aria-label="Chart range">
          {RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={range === item.key}
              onClick={() => {
                setRange(item.key);
                setActive(null);
                setCursorX(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <svg
        className="history-chart"
        viewBox={`0 0 ${width} ${plotHeight}`}
        role="img"
        aria-label={`Market probability history for ${market.question}`}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          scrub(event);
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse" && !dragging.current) return;
          scrub(event);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          if (dragging.current) return;
          setActive(null);
          setCursorX(null);
        }}
      >
        <rect className="chart-hit" x="0" y="0" width={width} height={plotHeight} fill="transparent" />
        <defs>
          {market.outcomes.map((label, i) => (
            <linearGradient key={label} id={`chart-fill-${market.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity="0.22" />
              <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={value}>
            <line className="chart-gridline" x1="8" x2={width - axisPad - 6} y1={y(value / 100)} y2={y(value / 100)} />
            <text className="chart-axis" x={width - axisPad + 2} y={y(value / 100) + 4}>{value}%</text>
          </g>
        ))}
        {market.outcomes.map((label, i) => {
          const baseline = y(0);
          const linePath = points.map((point, pi) => `${pi ? "L" : "M"}${x(pi)},${y(point.p[i] ?? 0)}`).join(" ");
          const areaPath = points.length > 1
            ? `${linePath} L${x(points.length - 1)},${baseline} L${x(0)},${baseline} Z`
            : "";
          return (
            <g key={label}>
              {areaPath ? (
                <path className="chart-area" d={areaPath} fill={`url(#chart-fill-${market.id}-${i})`} stroke="none" />
              ) : null}
              <path className="chart-line" style={{ stroke: PALETTE[i % PALETTE.length] }} d={linePath} />
            </g>
          );
        })}
        {cursorX !== null ? <line className="chart-crosshair" x1={cursorX} x2={cursorX} y1="10" y2={plotHeight - 20} /> : null}
        {points.length > 1
          ? market.outcomes.map((label, i) => (
              <circle
                key={`start-${label}`}
                className="chart-start-marker"
                cx={x(0)}
                cy={y(points[0]!.p[i] ?? 0)}
                r="3.5"
              />
            ))
          : null}
        {market.outcomes.map((label, i) => (
          <circle
            key={label}
            className="chart-point"
            style={{ fill: PALETTE[i % PALETTE.length] }}
            cx={x(index)}
            cy={y(activePoint?.p[i] ?? 0)}
            r="4"
          />
        ))}
        {(() => {
          // Stack end-of-line labels top-to-bottom with a minimum gap so two
          // outcomes that land at (near) the same probability don't render
          // their text on top of each other.
          const lastTick = points[points.length - 1];
          const minGap = 12;
          const positions = market.outcomes
            .map((label, i) => ({
              i,
              label,
              value: lastTick?.p[i] ?? market.prices[i],
              y: y(lastTick?.p[i] ?? market.prices[i]),
            }))
            .sort((a, b) => a.y - b.y);
          for (let k = 1; k < positions.length; k += 1) {
            if (positions[k]!.y - positions[k - 1]!.y < minGap) {
              positions[k]!.y = positions[k - 1]!.y + minGap;
            }
          }
          return positions.map((entry) => (
            <text
              key={`label-${entry.label}`}
              className="chart-outcome-label"
              style={{ fill: PALETTE[entry.i % PALETTE.length] }}
              x={x(points.length - 1) + 6}
              y={entry.y + 4}
            >
              {entry.label} {Math.round(entry.value * 100)}%
            </text>
          ));
        })()}
      </svg>
      {points.length > 1 ? (
        <input
          className="chart-scrubber"
          type="range"
          min="0"
          max={points.length - 1}
          value={index}
          aria-label="Explore market probability history"
          onChange={(event) => {
            setActive(Number(event.target.value));
            setCursorX(null);
          }}
        />
      ) : null}
      <figcaption>{activePoint ? new Date(activePoint.t).toLocaleString() : "Live"}</figcaption>
    </figure>
  );
}
