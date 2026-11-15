"use client";

import { useState } from "react";
import { ForecastIcon } from "../forecast-icon";
import { findEventForMarket, teamLogosForMarket } from "../live-events";
import { useCombo } from "./combo-context";
import { Countdown } from "./countdown";
import { Sparkline } from "./sparkline";
import { TradeTicket } from "./trade-ticket";
import { formatPercent, leadingOutcomeIndex, type MergedMarket } from "./markets";

function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
  return String(Math.round(volume));
}

export function MarketCard({ market }: { market: MergedMarket }) {
  const [prices, setPrices] = useState<readonly number[]>(market.prices);
  const [open, setOpen] = useState<number | null>(null);
  const lead = leadingOutcomeIndex(prices);
  const closed = market.status !== "open" || Date.parse(market.closeAt) <= Date.now();
  const teamLogos = teamLogosForMarket(market.id);
  const { addLeg } = useCombo();

  return (
    <li>
      <article className="forecast-card market-card">
        <div className="card-meta">
          <span className="card-category-group">
            <span className="card-category"><ForecastIcon category={market.category} />{market.label}</span>
            {market.horizon === "live" && market.status === "open" && !closed ? (
              <span className="live-dot" aria-label="Live">
                <span className="live-dot-pulse" aria-hidden="true" />
                Live
              </span>
            ) : null}
          </span>
          {market.status === "resolved" ? (
            <span className="market-status-tag">Resolved</span>
          ) : market.status === "void" ? (
            <span className="market-status-tag">Void</span>
          ) : closed ? (
            <span className="market-status-tag">Closed</span>
          ) : null}
        </div>
        <h2><a href={`/markets/${market.id}`}>{market.question}</a></h2>
        <div className="probability-snapshot">
          <div className="probability-lead">
            <span className="probability-value">{Math.round(prices[lead] * 100)}<span>%</span></span>
            <span className="probability-summary">{market.outcomes[lead]}</span>
          </div>
          <Sparkline history={market.history} outcomeIdx={lead} width={72} height={28} />
        </div>
        {market.status === "resolved" && market.resolvedOutcome !== null ? (
          <p className="written-note">Resolved: <strong>{market.outcomes[market.resolvedOutcome]}</strong></p>
        ) : market.status === "void" ? (
          <p className="written-note">Void · costs were refunded</p>
        ) : closed ? (
          <p className="written-note">Closed · awaiting result</p>
        ) : (
          <ul className="outcomes market-outcome-buttons">
            {market.outcomes.map((label, index) => (
              <li key={label} className="outcome-row">
                <button
                  type="button"
                  className="outcome"
                  aria-pressed={open === index}
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  {teamLogos?.get(label) ? (
                    <img className="outcome-team-logo" src={teamLogos.get(label)} alt="" aria-hidden="true" />
                  ) : null}
                  <span className="outcome-label">{label}</span>
                  <span className="outcome-percent">{formatPercent(prices[index])}</span>
                </button>
                <button
                  type="button"
                  className="combo-add-button"
                  aria-label={`Add ${market.question}, ${label} to combo slip`}
                  onClick={() =>
                    addLeg({
                      marketId: market.id,
                      eventId: findEventForMarket(market.id)?.id ?? null,
                      horizon: market.horizon,
                      question: market.question,
                      outcomeLabel: label,
                      outcomeIdx: index,
                      prob: prices[index]!,
                    })
                  }
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        )}
        {open !== null && !closed ? (
          <TradeTicket
            market={{ ...market, prices }}
            initialOutcome={open}
            compact
            onTraded={(result) => {
              setPrices(result.prices);
              setOpen(null);
            }}
          />
        ) : null}
        <div className="card-footer">
          <p className="forecast-close"><Countdown closeAt={market.closeAt} closeLabel={market.closeLabel} /></p>
          <span className="card-stat">{formatVolume(market.volume)} credits · {market.forecasters} forecasters</span>
        </div>
      </article>
    </li>
  );
}
