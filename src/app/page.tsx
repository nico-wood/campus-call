import type { Metadata } from "next";
import { loadMergedBoard } from "./local/board-data";
import { BoardView } from "./local/board-view";
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

function categoryHref(category: string, query: string): string {
  const params = new URLSearchParams();
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
  const { markets, stats } = await loadMergedBoard();

  const categoryBar = (
    <nav className="category-bar frame" aria-label="Market categories">
      <ul className="categories">
        {LOCAL_CATEGORIES.map((item) => (
          <li key={item}>
            <a
              className="category"
              href={categoryHref(item, query)}
              aria-current={item === category ? "true" : undefined}
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <LocalShell query={query} category={category} place="home" categoryBar={categoryBar}>
      <section className="prize-banner" aria-label="Prize pool">
        <p>
          If Campus Call places at the Cal Poly AI Hackathon, 50% of the team&rsquo;s prize goes to the top 10 on
          the leaderboard, split geometrically. If the team wins nothing, the pool is $0. Virtual credits have no
          cash value. Prizes may be taxable.
        </p>
      </section>
      <BoardView initialMarkets={markets} initialStats={stats} category={category} query={query} />
    </LocalShell>
  );
}
