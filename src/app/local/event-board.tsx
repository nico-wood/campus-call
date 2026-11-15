"use client";

import { useMemo, useState } from "react";
import type { LocalEvent, MarketGroup } from "../events";
import { marketMeta } from "../live-events";
import { Countdown } from "./countdown";
import { LocalChart } from "./local-chart";
import { TradeTicket } from "./trade-ticket";
import { formatPercent, leadingOutcomeIndex, type MergedMarket } from "./markets";

const GROUP_LABELS: Record<MarketGroup, string> = {
  moneyline: "Moneyline",
  spread: "Spread",
  total: "Totals",
  "team-total": "Team Totals",
  prop: "Props",
};

const GROUP_ORDER: MarketGroup[] = ["moneyline", "spread", "total", "team-total", "prop"];

function MoneylineRow({ market, selected, onSelect }: { market: MergedMarket; selected: boolean; onSelect: () => void }) {
  const lead = leadingOutcomeIndex(market.prices);
  return (
    <button type="button" className="event-market-row" aria-pressed={selected} onClick={onSelect}>
      <span className="event-market-row-question">{market.question}</span>
      <span className="event-market-row-lead">
        {market.outcomes[lead]} <strong>{formatPercent(market.prices[lead])}</strong>
      </span>
    </button>
  );
}

function LadderGroup({
  markets,
  selectedId,
  onSelect,
}: {
  markets: MergedMarket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = [...markets].sort((a, b) => (marketMeta(a.id)?.line ?? 0) - (marketMeta(b.id)?.line ?? 0));
  return (
    <div className="event-ladder" role="group" aria-label="Line picker">
      {sorted.map((market) => {
        const line = marketMeta(market.id)?.line;
        return (
          <button
            key={market.id}
            type="button"
            className="event-ladder-line"
            aria-pressed={selectedId === market.id}
            onClick={() => onSelect(market.id)}
          >
            <span className="event-ladder-line-value">{line}</span>
            <span className="event-ladder-line-split">
              {market.outcomes[0]} {formatPercent(market.prices[0])} · {market.outcomes[1]} {formatPercent(market.prices[1])}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function EventBoard({ event, markets }: { event: LocalEvent; markets: MergedMarket[] }) {
  const byGroup = useMemo(() => {
    const groups = new Map<MarketGroup, MergedMarket[]>();
    for (const market of markets) {
      const meta = marketMeta(market.id);
      if (!meta) continue;
      const list = groups.get(meta.group) ?? [];
      list.push(market);
      groups.set(meta.group, list);
    }
    return groups;
  }, [markets]);

  const moneyline = byGroup.get("moneyline")?.[0] ?? markets[0];
  const [selectedId, setSelectedId] = useState<string | null>(moneyline?.id ?? null);
  const selected = markets.find((market) => market.id === selectedId) ?? moneyline;

  return (
    <div className="example-market-content market-detail">
      <div className="example-overview event-overview">
        <div className="event-matchup-header">
          {event.teams.map((team) => (
            <div className="event-matchup-team" key={team.name}>
              <img className="event-matchup-logo" src={team.logo} alt="" aria-hidden="true" />
              <div>
                <strong>{team.short}</strong>
                {team.record ? <span>{team.record}</span> : null}
              </div>
            </div>
          ))}
        </div>
        <p className="forecast-close">
          <Countdown closeAt={event.startsAt} closeLabel={moneyline?.closeLabel ?? event.startsAt} /> · {event.venue}
        </p>
        {selected ? (
          <section className="market-history" aria-label="Market probability">
            <div className="market-history-heading">
              <h2>Market probability</h2>
              <span>{selected.forecasters} forecasters · {Math.round(selected.volume).toLocaleString()} credits</span>
            </div>
            <LocalChart market={selected} />
          </section>
        ) : null}
        {GROUP_ORDER.filter((group) => byGroup.has(group)).map((group) => {
          const groupMarkets = byGroup.get(group)!;
          const isLadder = group === "total" || group === "team-total" || group === "spread";
          return (
            <section className="event-group" key={group} aria-label={GROUP_LABELS[group]}>
              <h2>{GROUP_LABELS[group]}</h2>
              {isLadder ? (
                <LadderGroup markets={groupMarkets} selectedId={selectedId} onSelect={setSelectedId} />
              ) : (
                <div className="event-market-rows">
                  {groupMarkets.map((market) => (
                    <MoneylineRow
                      key={market.id}
                      market={market}
                      selected={selectedId === market.id}
                      onSelect={() => setSelectedId(market.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        <p className="volleyball-source"><a href={event.sourceUrl}>Source</a></p>
      </div>
      <div className="example-ticket-column">
        <aside className="example-ticket">
          {selected ? <TradeTicket market={selected} initialOutcome={0} /> : null}
        </aside>
      </div>
    </div>
  );
}
