import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForecastIcon } from "../../forecast-icon";
import { LIVE_FORECASTS } from "../../live-forecasts";
import { loadMergedBoard } from "../../local/board-data";
import { Countdown } from "../../local/countdown";
import { LocalChart } from "../../local/local-chart";
import { LocalShell } from "../../local/local-shell";
import { TradeTicket } from "../../local/trade-ticket";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const forecast = LIVE_FORECASTS.find((item) => item.id === id);
  return {
    title: forecast ? `${forecast.question} · Campus Call` : "Market · Campus Call",
    description: forecast?.summary,
  };
}

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const forecast = LIVE_FORECASTS.find((item) => item.id === id);
  if (!forecast) return notFound();

  const { markets } = await loadMergedBoard();
  const market = markets.find((item) => item.id === id)!;

  return (
    <LocalShell place="market">
      <a className="back-link" href="/">Back to markets</a>
      <div className="example-market-content market-detail">
        <div className="example-overview">
          <div className="event-heading-meta">
            <span className="card-category"><ForecastIcon category={market.category} />{market.label}</span>
            <span className="forecast-close"><Countdown closeAt={market.closeAt} closeLabel={market.closeLabel} /></span>
          </div>
          <h1 className="event-question">{market.question}</h1>
          <section className="market-history" aria-label="Market probability">
            <div className="market-history-heading">
              <h2>Market probability</h2>
              <span>{market.forecasters} forecasters · {Math.round(market.volume).toLocaleString()} credits</span>
            </div>
            <LocalChart market={market} />
          </section>
          <p className="written-note">{market.resolutionRule}</p>
          <p className="volleyball-source"><a href={market.sourceUrl}>{market.sourceName}</a></p>
          {market.history.length > 0 ? (
            <section className="market-history" aria-label="Recent activity">
              <div className="market-history-heading"><h2>Recent activity</h2></div>
              <ul className="activity-list">
                {[...market.history].slice(-10).reverse().map((tick, index) => (
                  <li key={index}>
                    <span>{new Date(tick.t).toLocaleTimeString()}</span>
                    <span>{market.outcomes.map((label, i) => `${label} ${Math.round((tick.p[i] ?? 0) * 100)}%`).join(" · ")}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="example-ticket-column">
          <aside className="example-ticket">
            <TradeTicket market={market} initialOutcome={0} />
          </aside>
        </div>
      </div>
    </LocalShell>
  );
}
