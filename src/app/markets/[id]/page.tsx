import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LIVE_FORECASTS } from "../../live-forecasts";
import { loadMergedBoard } from "../../local/board-data";
import { LocalShell } from "../../local/local-shell";
import { MarketDetailBody } from "../../local/market-detail-body";

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
      <MarketDetailBody market={market} mode="page" />
    </LocalShell>
  );
}
