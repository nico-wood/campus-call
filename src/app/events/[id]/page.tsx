import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadMergedBoard } from "../../local/board-data";
import { EventBoard } from "../../local/event-board";
import { LocalShell } from "../../local/local-shell";
import { LIVE_EVENTS } from "../../live-events";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = LIVE_EVENTS.find((item) => item.id === id);
  return { title: event ? `${event.title} · Campus Call` : "Event · Campus Call" };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = LIVE_EVENTS.find((item) => item.id === id);
  if (!event) return notFound();

  const { markets } = await loadMergedBoard();
  const marketIds = new Set(event.markets.map((market) => market.id));
  const eventMarkets = markets.filter((market) => marketIds.has(market.id));

  return (
    <LocalShell place="market">
      <a className="back-link" href="/">Back to markets</a>
      <EventBoard event={event} markets={eventMarkets} />
    </LocalShell>
  );
}
