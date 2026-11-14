import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EXAMPLES } from "../src/app/example-forecasts";
import { LIVE_FORECASTS } from "../src/app/live-forecasts";
import {
  HACKATHON_EVENT,
  HACKATHON_QR_HREF,
  hackathonDoorHref,
  openHackathonDoor,
  readStagedEntry,
} from "../src/app/hackathon-entry";
import HackathonPage from "../src/app/hackathon/page";
import ExampleEventPage from "../src/app/examples/[id]/page";
import HomePage from "../src/app/page";
import { createMarket, emptyLedger, trade } from "../src/lib/ledger";

const here = dirname(fileURLToPath(import.meta.url));
const banned = /\b(bet|wager|odds|payout)s?\b/i;
const doorOrigin = "https://campus-call.local";

function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
}

function paramsFrom(href: string): Record<string, string> {
  return Object.fromEntries(new URL(href, doorOrigin).searchParams);
}

function expectContext(href: string): void {
  const url = new URL(href, doorOrigin);
  expect(url.pathname).toBe("/hackathon");
  expect(url.searchParams.get("entry")).toBe("qr");
  expect(url.searchParams.get("event")).toBe("hackathon");
}

function expectHackathonOnly(html: string, enrollment: "qr" | "closed"): void {
  expect(html).toContain(HACKATHON_EVENT.question);
  expect(html).toContain(`Closes ${HACKATHON_EVENT.closeLabel}`);
  expect(html).toContain("Entry is not open yet.");
  expect(html).toContain("This is the hackathon event. It does not grant virtual credits.");
  expect(html).toContain(">Hackathon forecast<");
  expect(html.match(/class="event-question"/g)).toHaveLength(1);
  expect(html).not.toContain(">Forecasts<");
  expect(html).not.toContain("Example forecasts we wrote");
  expect(html).not.toContain("forecast-card");
  expect(html).not.toContain("forecast-list");
  expect(html).not.toContain(">Example<");
  expect(html).not.toContain('placeholder="Search forecasts"');
  expect(html).not.toContain('aria-label="Categories"');
  expect(html).not.toContain(">Portfolio<");
  expect(html).not.toContain(">Sports<");
  expect(html).not.toContain(">Music<");
  expect(html).not.toContain(">Dining<");
  expect(html).not.toContain(">Confirm<");
  expect(html).not.toContain("1000");
  expect(html).not.toContain("1,000");
  expect(html).not.toContain("OpenAI");
  expect(html).not.toContain("Startup Launch");
  expect(html).not.toContain("Best Use of AI");
  expect(html).not.toContain('method="post"');
  expect(html).not.toContain("localStorage");
  for (const example of EXAMPLES) {
    expect(html).not.toContain(example.question);
  }
  for (const forecast of LIVE_FORECASTS) {
    expect(html).not.toContain(forecast.question);
  }
  expect(html).not.toMatch(banned);
  if (enrollment === "closed") {
    expect(html).not.toContain("<form");
    expect(html).not.toContain("qr-enrollment");
    expect(html).not.toContain(">Start demo<");
    expect(html).not.toContain(">Demo<");
    expect(html).not.toContain("This stays on this device.");
    expect(html).not.toContain("verified ownership");
    return;
  }
  expect(html).toContain('id="qr-enrollment"');
  expect(html).toContain("<form");
  expect(html).toContain(">Demo<");
  expect(html).toContain(">Start demo<");
  expect(html).not.toContain("Demo on this device");
  expect(html).toContain("This stays on this device.");
  expect(html).toContain("It is not a verified account.");
  expect(html).toContain("It does not grant virtual credits.");
  expect(html).toContain("Entering an email is not verified ownership.");
  expect(html.match(/id="qr-enrollment"/g)).toHaveLength(1);
}

describe("hackathon QR door", () => {
  it("opens only the hackathon event from the direct URL, including on another render", async () => {
    expect(HACKATHON_QR_HREF).toBe("/hackathon?entry=qr&event=hackathon");
    const params = { entry: "qr", event: "hackathon" };
    const first = renderToStaticMarkup(await HackathonPage({ searchParams: params }));
    const refreshed = renderToStaticMarkup(
      await HackathonPage({ searchParams: Promise.resolve(params) }),
    );

    expectHackathonOnly(first, "qr");
    expect(refreshed).toBe(first);
    expect(hrefs(first).length).toBeGreaterThan(0);
    for (const href of hrefs(first)) expectContext(href);
    expect(hrefs(first).some((href) => href.includes("section=forecast"))).toBe(true);
  });

  it("fails if staged entry context disappears from an in-door link or a refresh", async () => {
    const opened = renderToStaticMarkup(
      await HackathonPage({
        searchParams: { entry: "qr", event: "hackathon", category: "Sports", q: "concert" },
      }),
    );
    expectHackathonOnly(opened, "qr");
    expect(opened).not.toContain("concert");
    expect(opened).not.toContain("category=");

    const forecastHref = hrefs(opened).find((href) => href.includes("section=forecast"));
    expect(forecastHref).toBe("/hackathon?entry=qr&event=hackathon&section=forecast");
    expectContext(forecastHref!);

    const inside = renderToStaticMarkup(
      await HackathonPage({ searchParams: paramsFrom(forecastHref!) }),
    );
    expectHackathonOnly(inside, "qr");
    expect(inside).toContain("Market probability is not in yet. No position is open.");
    expect(inside).toContain('href="/hackathon?entry=qr&amp;event=hackathon"');
    for (const href of hrefs(inside)) {
      expectContext(href);
      expect(new URL(href, doorOrigin).searchParams.has("section")).toBe(false);
    }

    const backHref = hrefs(inside)[0];
    expect(backHref).toBe("/hackathon?entry=qr&event=hackathon");
    const returned = renderToStaticMarkup(
      await HackathonPage({ searchParams: paramsFrom(backHref!) }),
    );
    const refreshed = renderToStaticMarkup(
      await HackathonPage({ searchParams: Promise.resolve(paramsFrom(backHref!)) }),
    );
    expect(refreshed).toBe(returned);
    expectHackathonOnly(returned, "qr");
    for (const href of hrefs(returned)) expectContext(href);
    expect(hrefs(returned).some((href) => href.includes("section=forecast"))).toBe(true);
  });

  it("stays on this event when the entry context is absent or not the staged pair", async () => {
    const bare = renderToStaticMarkup(await HackathonPage());
    const again = renderToStaticMarkup(await HackathonPage({ searchParams: {} }));
    expect(again).toBe(bare);
    expectHackathonOnly(bare, "closed");
    for (const href of hrefs(bare)) {
      const url = new URL(href, doorOrigin);
      expect(url.pathname).toBe("/hackathon");
      expect(url.searchParams.has("entry")).toBe(false);
      expect(url.searchParams.has("event")).toBe(false);
    }

    const foreign = renderToStaticMarkup(
      await HackathonPage({
        searchParams: { entry: '"><img src=x>', event: "other", section: "examples" },
      }),
    );
    expectHackathonOnly(foreign, "closed");
    expect(foreign).not.toContain("<img");
    expect(foreign).not.toContain("src=x");
    expect(foreign).not.toContain("other");
    expect(foreign).not.toContain("examples");
    expect(readStagedEntry({ entry: "QR", event: "hackathon" })).toBeNull();
    expect(hackathonDoorHref(null, "forecast")).toBe("/hackathon?section=forecast");
  });

  it("does not grant credits or write a ledger, and home still lists example cards", async () => {
    const sources = ["hackathon-entry.ts", "hackathon-event.tsx", "hackathon/page.tsx"]
      .map((file) => readFileSync(join(here, "../src/app", file), "utf8"))
      .join("\n");
    expect(sources).toContain("assertHackathonDoorClosed");
    expect(sources).toContain("loadHackathonDoor");
    expect(sources).not.toMatch(/\btrade\s*\(/);
    expect(sources).not.toMatch(/\bresolveMarket\s*\(/);
    expect(sources).not.toMatch(/\bfetch\s*\(/);
    expect(sources).not.toMatch(/\bXMLHttpRequest\b/);
    expect(sources).not.toMatch(/\.insert\s*\(/);
    expect(sources).not.toContain('method="post"');
    expect(sources).not.toContain("localStorage");
    expect(sources).not.toContain("sessionStorage");
    expect(sources).not.toContain("document.cookie");
    expect(sources).not.toContain("verified-session");
    expect(sources).not.toContain("issueVerifiedServerSession");
    expect(sources).not.toContain("resolveLiveMode");
    expect(sources).not.toMatch(/supabase/i);
    expect(sources).not.toMatch(/from\s+["']\.\/shell["']/);
    expect(sources).not.toMatch(/from\s+["']\.\/page["']/);
    expect(sources).not.toMatch(/from\s+["']\.\/forecast-list["']/);
    expect(sources).not.toMatch(/from\s+["']\.\/example-/);
    expect(sources).not.toMatch(banned);

    const ledger = emptyLedger({ visitor: 0 });
    const before = structuredClone(ledger);
    expect(openHackathonDoor(ledger)).toEqual({ ledger, granted: 0, wrote: false });
    expect(openHackathonDoor(ledger).ledger).toBe(ledger);
    expect(ledger).toEqual(before);
    expect(ledger.balances.visitor).toBe(0);

    const market = createMarket(emptyLedger({ visitor: 1000 }), "not-the-door", 100);
    const debited = trade(market, {
      marketId: "not-the-door",
      userId: "visitor",
      side: "yes",
      shares: 1,
    });
    expect(debited.balances.visitor).toBeLessThan(1000);
    expect(ledger.balances.visitor).toBe(0);
    expect(ledger.markets).toEqual({});

    const home = renderToStaticMarkup(await HomePage());
    expect(home).toContain(LIVE_FORECASTS[0]?.question);
    expect(home).toContain("forecast-card");
    expect(home).not.toContain(EXAMPLES[0]?.question);
  });

  it("shows the demo form only for the staged QR pair and does not copy unknown queries", async () => {
    const closedCases = [
      {},
      { entry: "qr" },
      { event: "hackathon" },
      { entry: "qr", event: "other" },
      { entry: "QR", event: "hackathon" },
      { live: "1", mode: "demo", verified: "true" },
    ];
    for (const params of closedCases) {
      const html = renderToStaticMarkup(await HackathonPage({ searchParams: params }));
      expectHackathonOnly(html, "closed");
      for (const href of hrefs(html)) {
        const url = new URL(href, doorOrigin);
        expect(url.searchParams.has("entry")).toBe(false);
        expect(url.searchParams.has("event")).toBe(false);
        expect(url.searchParams.has("live")).toBe(false);
        expect(url.searchParams.has("mode")).toBe(false);
        expect(url.searchParams.has("verified")).toBe(false);
      }
    }

    const attacked = renderToStaticMarkup(
      await HackathonPage({
        searchParams: {
          entry: "qr",
          event: "hackathon",
          live: "1",
          mode: "live",
          demo: "1",
          verified: "true",
          name: "Stolen",
          email: "stolen@example.com",
        },
      }),
    );
    expectHackathonOnly(attacked, "qr");
    expect(attacked).not.toContain("Stolen");
    expect(attacked).not.toContain("stolen@example.com");
    expect(attacked).not.toContain("live=1");
    expect(attacked).not.toContain("mode=live");
    expect(attacked).not.toContain("verified=");
    for (const href of hrefs(attacked)) {
      expectContext(href);
      const url = new URL(href, doorOrigin);
      for (const key of url.searchParams.keys()) {
        expect(["entry", "event", "section"]).toContain(key);
      }
      if (url.searchParams.has("section")) expect(url.searchParams.get("section")).toBe("forecast");
    }
  });

  it("does not render the demo form on home or an example route", async () => {
    const home = renderToStaticMarkup(
      await HomePage({
        searchParams: { entry: "qr", event: "hackathon", live: "1", mode: "live" },
      }),
    );
    const example = renderToStaticMarkup(
      await ExampleEventPage({
        params: Promise.resolve({ id: EXAMPLES[0]!.id }),
        searchParams: { entry: "qr", event: "hackathon", live: "1", email: "ada@example.com" },
      }),
    );
    for (const html of [home, example]) {
      expect(html).not.toContain("qr-enrollment");
      expect(html).not.toContain(">Start demo<");
      expect(html).not.toContain(">Demo<");
      expect(html).not.toContain("This stays on this device.");
      expect(html).not.toContain("verified ownership");
      expect(html).not.toContain("id=\"qr-demo-name\"");
    }
    expect(home).toContain("Who will win: Cal Poly or Montana State?");
    expect(home).not.toContain(">Example<");
    expect(example).toContain(">Example<");
    expect(example).toContain(">Confirm<");

    const outside = ["page.tsx", "shell.tsx", "forecast-list.tsx", "example-event.tsx", "examples/[id]/page.tsx"]
      .map((file) => readFileSync(join(here, "../src/app", file), "utf8"))
      .join("\n");
    expect(outside).not.toContain("qr-enrollment");
    expect(outside).not.toContain("startDeviceDemo");
    expect(outside).not.toContain("verified-session");
    expect(outside).not.toContain("issueVerifiedServerSession");
    expect(outside).not.toMatch(/\btrade\s*\(/);
  });
});
