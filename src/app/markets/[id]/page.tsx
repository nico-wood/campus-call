import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForecastIcon } from "../../forecast-icon";
import { InfoTip } from "../../info-tip";
import { LIVE_FORECASTS } from "../../live-forecasts";
import { loadMergedBoard } from "../../local/board-data";
import { Countdown } from "../../local/countdown";
import { LocalChart } from "../../local/local-chart";
import { LocalShell } from "../../local/local-shell";
import { leadingOutcomeIndex } from "../../local/markets";
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
          <p className="market-summary">{market.summary}</p>
          <section className="market-history" aria-label="Market probability">
            <div className="market-history-heading">
              <h2>
                Market probability
                <InfoTip label="What market probability means" side="bottom">
                  Market probability is the going price of each outcome, set by what
                  forecasters back with virtual credits. More credits on an outcome push
                  its probability up. It is the crowd&rsquo;s current view, not an
                  official prediction.
                </InfoTip>
              </h2>
              <span>{market.forecasters} forecasters · {Math.round(market.volume).toLocaleString()} credits</span>
            </div>
            <LocalChart market={market} />
          </section>
          {market.prior.length === market.outcomes.length ? (
            <details className="prior-disclosure">
              <summary>
                Starting estimate: {Math.round(market.prior[leadingOutcomeIndex(market.prior)] * 100)}%{" "}
                {market.outcomes[leadingOutcomeIndex(market.prior)]} · how we got this
              </summary>
              <p>{market.priorMethod}</p>
              <ul className="prior-sources">
                {market.priorSources.map((source) => (
                  <li key={source.url}><a href={source.url}>{source.name}</a></li>
                ))}
              </ul>
            </details>
          ) : null}
          <p className="written-note">{market.resolutionRule}</p>
          <p className="volleyball-source"><a href={market.sourceUrl}>{market.sourceName}</a></p>
          {market.horizon === "futures" ? (
            <section className="prize-banner" aria-label="Prize snapshot rule">
              <p className="prize-banner-snapshot">
                The prize leaderboard is a snapshot at Mon 16 Nov 2026, 11:59 p.m. PT. It counts your credit balance
                (including credits returned from resolved Live markets) plus the current sell-back value of any open
                positions. Futures positions don&rsquo;t return credits until they resolve, but they still count at
                sell-back value in the snapshot.
              </p>
            </section>
          ) : null}
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
