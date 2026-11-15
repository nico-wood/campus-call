import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExampleEventView } from "../src/app/example-event";
import { confirmExample, runExampleConfirm } from "../src/app/example-confirm";
import {
  EXAMPLES,
  getExample,
} from "../src/app/example-forecasts";
import { LIVE_FORECASTS } from "../src/app/live-forecasts";
import ExampleEventPage from "../src/app/examples/[id]/page";
import HomePage from "../src/app/page";
import { createMarket, emptyLedger, trade } from "../src/lib/ledger";

const here = dirname(fileURLToPath(import.meta.url));
const banned = /\b(bet|wager|odds|payout)s?\b/;

async function renderHome(params: Record<string, string> = {}) {
  return renderToStaticMarkup(await HomePage({ searchParams: params }));
}

describe("example forecasts", () => {
  it("covers yes/no, higher/lower, earlier/later, and every category", () => {
    expect(new Set(EXAMPLES.map((example) => example.kind))).toEqual(
      new Set(["yes-no", "higher-lower", "earlier-later"]),
    );
    expect(new Set(EXAMPLES.map((example) => example.category))).toEqual(
      new Set(["Sports", "Music", "Dining", "Hackathon"]),
    );
    for (const example of EXAMPLES) {
      expect(example.outcomes.reduce((sum, outcome) => sum + outcome.percent, 0)).toBe(100);
      expect(example.outcomes[0]?.percent).toBeGreaterThanOrEqual(example.outcomes[1]?.percent ?? 0);
    }
  });

  it("lists every live forecast as a market card with its outcomes and a market probability", async () => {
    const html = await renderHome({ tab: "all" });

    expect(html).not.toContain(">Example<");
    expect(html).not.toContain("Example forecasts we wrote.");
    for (const example of EXAMPLES) expect(html).not.toContain(example.question);
    for (const forecast of LIVE_FORECASTS) {
      expect(html).toContain(forecast.question.replaceAll("'", "&#x27;"));
      for (const outcome of forecast.outcomes) expect(html).toContain(`>${outcome}<`);
    }
    expect(html).toContain("%");
    expect(html).toContain("Forecasters");
    expect(html).toContain("Credits in play");
    expect(html).toContain("50% of the team");
    expect(html.toLowerCase()).not.toMatch(banned);
  });

  it("defaults to the Live tab, hiding futures markets until All or Futures is picked", async () => {
    const futuresMarkets = LIVE_FORECASTS.filter((forecast) => forecast.horizon === "futures");
    expect(futuresMarkets.length).toBeGreaterThan(0);
    const liveMarkets = LIVE_FORECASTS.filter((forecast) => forecast.horizon === "live");
    expect(liveMarkets.length).toBeGreaterThan(0);

    const defaultTab = await renderHome();
    for (const forecast of futuresMarkets) expect(defaultTab).not.toContain(forecast.question);
    for (const forecast of liveMarkets) expect(defaultTab).toContain(forecast.question.replaceAll("'", "&#x27;"));
    expect(defaultTab.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(defaultTab).toMatch(/aria-selected="true"[^]*?Live<\/a>/);

    const futuresTab = await renderHome({ tab: "futures" });
    for (const forecast of liveMarkets) expect(futuresTab).not.toContain(forecast.question);
    for (const forecast of futuresMarkets) expect(futuresTab).toContain(forecast.question.replaceAll("'", "&#x27;"));
    expect(futuresTab).toMatch(/aria-selected="true"[^]*?Futures<\/a>/);

    const allTab = await renderHome({ tab: "all" });
    for (const forecast of LIVE_FORECASTS) expect(allTab).toContain(forecast.question.replaceAll("'", "&#x27;"));
    expect(allTab).toMatch(/aria-selected="true"[^]*?All<\/a>/);
  });

  it("filters each live category, and an unknown category or a missed search is empty", async () => {
    const sports = await renderHome({ category: "Sports" });
    expect(sports.match(/aria-current="true"/g)).toHaveLength(1);
    expect(sports).toContain('aria-current="true">Sports');
    expect(sports).toContain("Who will win: Cal Poly or Montana State?");
    expect(sports).toContain("Who will lead at halftime?");
    expect(sports).not.toContain("San Luis Obispo Airport");

    const weather = await renderHome({ category: "weather", q: "airport" });
    expect(weather).toContain('aria-current="true">Weather');
    expect(weather).toContain("San Luis Obispo Airport");
    expect(weather).not.toContain("Montana State");
    expect(weather).toContain('value="airport"');
    expect(weather).toContain('type="hidden"');
    expect(weather).toContain('name="category"');
    expect(weather).toContain('value="Weather"');
    expect(weather).toContain('href="/?category=Sports&amp;q=airport"');
    expect(weather).toContain('href="/?q=airport"');

    const transit = await renderHome({ category: "Transit" });
    expect(transit).toContain('aria-current="true">Transit');
    expect(transit).toContain("At 5:00 p.m. Sunday, will SLO Transit still list a Route 4A detour?");
    expect(transit).not.toContain("Montana State");
    expect(transit).not.toContain("Las Migas");

    const campus = await renderHome({ category: "Campus" });
    expect(campus).toContain('aria-current="true">Campus');
    expect(campus).toContain("Arab Music Ensemble Fall Concert");
    expect(campus).toContain("Las Migas");
    expect(campus).not.toContain("Route 4A detour");

    const clubs = await renderHome({ category: "Club sports" });
    expect(clubs).toContain('aria-current="true">Club sports');
    expect(clubs).toContain("No matching markets");

    const missed = await renderHome({ category: "Weather", q: "workshop" });
    expect(missed).toContain("No matching markets");
    expect(missed).not.toContain("San Luis Obispo Airport");

    const unknown = await renderHome({ category: "Hackathon" });
    expect(unknown).not.toContain('aria-current="true"');
    expect(unknown).toContain("No matching markets");
    expect(unknown.toLowerCase()).not.toMatch(banned);
  });

  it("opens an example event whose confirm is visible and does not post", async () => {
    const example = getExample("sports-exhibition-winner");
    expect(example).toBeDefined();
    const html = renderToStaticMarkup(
      createElement(ExampleEventView, {
        example: example!,
        category: "Sports",
        query: "exhibition",
      }),
    );

    expect(html).toContain(">Example<");
    expect(html).toContain(example!.question);
    expect(html).toContain(`Closes ${example!.closeLabel}`);
    expect(html).toContain(">62%<");
    expect(html).toContain(">38%<");
    expect(html).toContain("Market probability");
    expect(html).toContain(">Confirm<");
    expect(html).toContain('type="button"');
    expect(html).toContain("does not open a position, change virtual credits, or add points");
    expect(html).toContain('href="/?category=Sports&amp;q=exhibition"');
    expect(html).not.toContain('method="post"');
    expect(html).not.toContain("formaction");
    expect(html.toLowerCase()).not.toMatch(banned);

    const page = renderToStaticMarkup(
      await ExampleEventPage({
        params: Promise.resolve({ id: "music-concert-start" }),
        searchParams: Promise.resolve({ category: "Music", q: "concert" }),
      }),
    );
    expect(page).toContain("Will the campus concert start earlier or later than 8:00 p.m.?");
    expect(page).toContain('value="concert"');
    expect(page).toContain(">Confirm<");
    expect(page).toContain('type="button"');
  });

  it("fails if an example confirm writes, debits, or sends a request", () => {
    const sources = [
      "example-confirm.ts",
      "example-confirm-button.tsx",
      "example-event.tsx",
      "example-forecasts.ts",
      "forecast-list.tsx",
      "page.tsx",
      "shell.tsx",
      "examples/[id]/page.tsx",
      "volleyball-match.tsx",
      "live-position.tsx",
      "live-forecasts.ts",
    ]
      .map((file) => readFileSync(join(here, "../src/app", file), "utf8"))
      .join("\n");
    expect(sources).not.toMatch(/\btrade\s*\(/);
    expect(sources).not.toMatch(/\bresolveMarket\s*\(/);
    expect(sources).not.toMatch(/\bfetch\s*\(/);
    expect(sources).not.toMatch(/\bXMLHttpRequest\b/);
    expect(sources).not.toMatch(/\.insert\s*\(/);
    expect(sources).not.toContain('method="post"');
    expect(sources).not.toContain("formAction");
    expect(sources).toContain("runExampleConfirm");

    const start = createMarket(emptyLedger({ person: 1000 }), "example-only", 100);
    const before = structuredClone(start);
    let requests = 0;
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      requests += 1;
      return new Response(null, { status: 204 });
    }) as typeof fetch;

    try {
      expect(confirmExample(start)).toEqual({
        ledger: start,
        wrote: false,
        debited: 0,
        requested: false,
      });
      expect(runExampleConfirm(start)).toBe(start);
      expect(start).toEqual(before);
      expect(start.balances.person).toBe(1000);
      expect(start.markets["example-only"]?.positions).toEqual({});
      expect(requests).toBe(0);
    } finally {
      globalThis.fetch = original;
    }

    const debited = trade(structuredClone(start), {
      marketId: "example-only",
      userId: "person",
      side: "yes",
      shares: 1,
    });
    expect(debited.balances.person).toBeLessThan(1000);
    expect(start.balances.person).toBe(1000);
  });
});
