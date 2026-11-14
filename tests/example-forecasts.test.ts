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
  emptyForecastMessage,
  getExample,
} from "../src/app/example-forecasts";
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

  it("lists every example with a question, a close, leading percentages, and an Example label", async () => {
    const html = await renderHome();

    expect(html).toContain("Example forecasts we wrote. They are not live.");
    expect(html.match(/>Example</g)).toHaveLength(EXAMPLES.length);
    for (const example of EXAMPLES) {
      expect(html).toContain(example.question);
      expect(html).toContain(`Closes ${example.closeLabel}`);
      expect(html).toContain("We wrote this example. It is not a live forecast.");
      expect(html).toContain("Market probability");
      for (const outcome of example.outcomes) {
        expect(html).toContain(`>${outcome.label}<`);
        expect(html).toContain(`>${outcome.percent}%<`);
      }
      expect(html).toContain(`href="/examples/${example.id}"`);
    }
    for (const label of ["Yes", "No", "Higher", "Lower", "Earlier", "Later"]) {
      expect(html).toContain(`>${label}<`);
    }
    expect(html.toLowerCase()).not.toMatch(banned);
  });

  it("filters each category, and an unknown category or a missed search is empty", async () => {
    for (const category of ["Sports", "Music", "Dining", "Hackathon"] as const) {
      const html = await renderHome({ category });
      expect(html.match(/aria-current="true"/g)).toHaveLength(1);
      expect(html).toContain(`aria-current="true">${category}`);
      for (const example of EXAMPLES) {
        if (example.category === category) expect(html).toContain(example.question);
        else expect(html).not.toContain(example.question);
      }
    }

    const dining = await renderHome({ category: "dining", q: "late dining" });
    expect(dining).toContain("Will the late dining window stay open past 10:00 p.m.?");
    expect(dining).not.toContain("Will the campus concert");
    expect(dining).toContain('value="late dining"');
    expect(dining).toContain('href="/?category=Music&amp;q=late+dining"');
    expect(dining).toContain('href="/?q=late+dining"');
    expect(dining).toContain(
      'href="/examples/dining-late-window?category=Dining&amp;q=late+dining"',
    );
    expect(dining).toContain('type="hidden"');
    expect(dining).toContain('name="category"');
    expect(dining).toContain('value="Dining"');

    const missed = await renderHome({ category: "Music", q: "workshop" });
    expect(missed).toContain("No matching forecasts");
    expect(missed).toContain(
      "No example forecast matches this search. Clear the search or choose another category.",
    );
    expect(missed).not.toContain(">Example<");
    expect(missed).not.toContain("Will the campus concert");

    const unknown = await renderHome({ category: "Weather" });
    expect(unknown).toContain(emptyForecastMessage({ category: "unknown", query: "" }));
    expect(unknown).not.toContain('aria-current="true"');
    expect(unknown).not.toContain(">Example<");
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
