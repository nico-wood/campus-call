import type { Metadata } from "next";
import { ActivityTicker } from "./local/activity-ticker";
import { loadMergedBoard } from "./local/board-data";
import { BoardView } from "./local/board-view";
import { CategoryIndicator } from "./local/category-indicator";
import { LOCAL_CATEGORIES } from "./local/categories";
import { LocalShell } from "./local/local-shell";

export const metadata: Metadata = {
  title: "Campus Call",
  description: "Open local markets on live Cal Poly and San Luis Obispo events this weekend.",
};

type SearchParamsInput = Record<string, string | string[] | undefined>;
type LocalCategory = (typeof LOCAL_CATEGORIES)[number] | "unknown";

function readCategory(raw: string | string[] | undefined): LocalCategory {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) return "All";
  const match = LOCAL_CATEGORIES.find((item) => item.toLowerCase() === value.toLowerCase());
  return match ?? "unknown";
}

function readQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").slice(0, 100);
}

type Tab = "live" | "futures" | "all";

function readTab(raw: string | string[] | undefined): Tab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "futures" || value === "all" ? value : "live";
}

function categoryHref(category: string, query: string, tab: Tab): string {
  const params = new URLSearchParams();
  if (tab !== "live") params.set("tab", tab);
  if (category !== "All") params.set("category", category);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

function tabHref(tab: Tab, category: string, query: string): string {
  const params = new URLSearchParams();
  if (tab !== "live") params.set("tab", tab);
  if (category !== "All") params.set("category", category);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput;
} = {}) {
  const resolved = (await searchParams) ?? {};
  const category = readCategory(resolved.category);
  const query = readQuery(resolved.q);
  const tab = readTab(resolved.tab);
  const { markets, stats } = await loadMergedBoard();

  const categoryBar = (
    <nav className="category-bar frame" aria-label="Market categories">
      <div className="horizon-tabs" role="tablist" aria-label="Market horizon">
        {(["live", "futures", "all"] as const).map((item) => (
          <a
            key={item}
            className="horizon-tab"
            role="tab"
            href={tabHref(item, category, query)}
            aria-selected={item === tab}
          >
            {item === "live" ? <span className="horizon-tab-dot" aria-hidden="true" /> : null}
            {item === "live" ? "Live" : item === "futures" ? "Futures" : "All"}
          </a>
        ))}
      </div>
      <ul className="categories">
        {LOCAL_CATEGORIES.map((item) => (
          <li key={item}>
            <a
              className="category"
              href={categoryHref(item, query, tab)}
              aria-current={item === category ? "true" : undefined}
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
      <CategoryIndicator />
    </nav>
  );

  return (
    <LocalShell query={query} category={category} place="home" categoryBar={categoryBar}>
      <ActivityTicker markets={markets} />
      <section className="prize-banner" aria-label="Prize pool">
        <p>
          If Campus Call places at the Cal Poly AI Hackathon, <span className="prize-pool-stat">50% of the
          team&rsquo;s prize</span> goes to the top 10 on the leaderboard, split geometrically. If the team wins
          nothing, the pool is $0. Virtual credits have no cash value. Prizes may be taxable.
        </p>
        <p className="prize-banner-snapshot">
          The prize leaderboard is a snapshot at Mon 16 Nov 2026, 11:59 p.m. PT. It counts your credit balance
          (including credits returned from resolved Live markets) plus the current sell-back value of any open
          positions. Futures positions don&rsquo;t return credits until they resolve, but they still count at
          sell-back value in the snapshot.
        </p>
      </section>
      <BoardView initialMarkets={markets} initialStats={stats} category={category} query={query} tab={tab} />
    </LocalShell>
  );
}
