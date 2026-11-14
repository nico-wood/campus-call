import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { confirmExample } from "../src/app/example-confirm";
import { EXAMPLES } from "../src/app/example-forecasts";
import ExampleEventPage from "../src/app/examples/[id]/page";
import { confirmHackathonTicket } from "../src/app/hackathon-ticket-action";
import { HACKATHON_TICKETS } from "../src/app/hackathon-tickets";
import { openHackathonDoor, readStagedEntry } from "../src/app/hackathon-entry";
import HackathonPage from "../src/app/hackathon/page";
import HomePage from "../src/app/page";
import { memoryDeviceStore, startDeviceDemo } from "../src/app/participant-session";
import {
  confirmForecastPosition,
  createFetchTicketConfirmClient,
  type ConfirmForecastPositionInput,
  type TicketConfirmCall,
  type TicketConfirmClient,
  type TicketConfirmClientResult,
} from "../src/app/ticket-confirm";
import { issueVerifiedServerSession, type VerifiedServerSession } from "../src/app/verified-session";
import { emptyLedger } from "../src/lib/ledger";

const here = dirname(fileURLToPath(import.meta.url));
const banned = /\b(bet|wager|odds|payout)s?\b/i;
const accountId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const confirmationId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const requestKey = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const secondKey = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const thirdKey = "ffffffff-ffff-4fff-8fff-ffffffffffff";

function stagedQr() {
  return readStagedEntry({ entry: "qr", event: "hackathon" });
}

function liveSession() {
  const session = issueVerifiedServerSession({ name: "Ada Lovelace", email: "ada@example.com" });
  if (!session) throw new Error("expected a verified session");
  return session;
}

function baseInput(client: TicketConfirmClient): ConfirmForecastPositionInput {
  return {
    verifiedServerSession: liveSession(),
    entry: stagedQr(),
    accountId,
    requestKey,
    client,
    clock: () => new Date("2026-11-14T18:00:00.000Z"),
  };
}

function recorded(amount: number, balance: number): TicketConfirmClientResult {
  return {
    confirmation_id: confirmationId,
    committed: true,
    wrote: true,
    debited: amount,
    replayed: false,
    balance,
  };
}

function declined(balance: number): TicketConfirmClientResult {
  return {
    confirmation_id: null,
    committed: false,
    wrote: false,
    debited: 0,
    replayed: false,
    balance,
  };
}

describe("hackathon ticket confirm", () => {
  it("lists the four tickets and no fifth ticket", () => {
    expect(HACKATHON_TICKETS.map((ticket) => ticket.id)).toEqual([
      "main",
      "openai",
      "startup-launch",
      "best-use-of-ai",
    ]);
    expect(HACKATHON_TICKETS.map((ticket) => ticket.fields)).toEqual(["places", "team", "team", "team"]);
    expect(HACKATHON_TICKETS.map((ticket) => `${ticket.id} ${ticket.label}`).join("\n")).not.toMatch(/chick/i);
  });

  it("renders the four tickets only on the forecast section", async () => {
    const forecast = renderToStaticMarkup(
      await HackathonPage({ searchParams: { entry: "qr", event: "hackathon", section: "forecast" } }),
    );
    const event = renderToStaticMarkup(
      await HackathonPage({ searchParams: { entry: "qr", event: "hackathon" } }),
    );
    for (const ticket of HACKATHON_TICKETS) {
      expect(forecast).toContain(`data-ticket="${ticket.id}"`);
      expect(forecast).toContain(`>${ticket.label}<`);
    }
    expect(forecast).toContain('name="amount"');
    expect(forecast).toContain('name="placeFirst"');
    expect(forecast).toContain('name="placeSecond"');
    expect(forecast).toContain('name="placeThird"');
    expect(forecast).toContain('name="teamName"');
    expect(forecast.match(/name="placeFirst"/g)).toHaveLength(1);
    expect(forecast.match(/name="teamName"/g)).toHaveLength(3);
    expect(forecast).toContain("No confirmation yet.");
    expect(forecast).toContain("Entry is not open yet.");
    expect(forecast).toContain("Virtual credits");
    expect(forecast).not.toContain("Confirmed");
    expect(forecast).not.toContain("chick-fil-a");
    expect(forecast).not.toContain("Chick-fil-A");
    expect(forecast).not.toContain('method="post"');
    expect(forecast).not.toMatch(banned);
    expect(event).not.toContain("data-ticket=");

    const home = renderToStaticMarkup(await HomePage());
    const example = renderToStaticMarkup(
      await ExampleEventPage({ params: Promise.resolve({ id: EXAMPLES[0]!.id }) }),
    );
    expect(home).not.toContain("data-ticket=");
    expect(example).not.toContain("data-ticket=");
  });

  it("keeps each confirm independent, including a main position with no team", async () => {
    const calls: TicketConfirmCall[] = [];
    const client: TicketConfirmClient = {
      async confirmForecastPosition(call) {
        calls.push(call);
        return recorded(call.amount, (call.balance ?? 0) - call.amount);
      },
    };
    const session = liveSession();
    const entry = stagedQr();
    const main = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "main",
      amount: 100,
      placeFirst: "North",
      placeSecond: "South",
      placeThird: "West",
      balance: 1000,
    });
    const challenge = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "openai",
      amount: 40,
      requestKey: secondKey,
      teamName: "North",
      balance: main.balance,
    });
    expect(main.wrote).toBe(true);
    expect(main.debited).toBe(100);
    expect(challenge.wrote).toBe(true);
    expect(challenge.debited).toBe(40);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.ticket).toBe("main");
    expect(calls[0]?.teamName).toBeNull();
    expect(calls[0]?.placeFirst).toBe("North");
    expect(calls[1]?.ticket).toBe("openai");
    expect(calls[1]?.placeFirst).toBeNull();
    expect(calls[1]?.teamName).toBe("North");
    expect(calls[0]?.serverTime).toBe("2026-11-14T18:00:00.000Z");
  });

  it("passes the reported balance through and writes nothing on an overspend", async () => {
    const seen: Array<number | null> = [];
    let reported = 1000;
    const client: TicketConfirmClient = {
      async confirmForecastPosition(call) {
        seen.push(call.balance);
        const balance = call.balance ?? reported;
        if (call.amount > balance) return declined(balance);
        reported = balance - call.amount;
        return recorded(call.amount, reported);
      },
    };
    const session = liveSession();
    const entry = stagedQr();
    const first = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "openai",
      amount: 600,
      teamName: "North",
      balance: 1000,
    });
    const second = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "startup-launch",
      amount: 500,
      requestKey: secondKey,
      teamName: "North",
      balance: first.balance,
    });
    expect(first.wrote).toBe(true);
    expect(first.debited).toBe(600);
    expect(first.balance).toBe(400);
    expect(second).toMatchObject({ wrote: false, debited: 0, confirmation_id: null, committed: false });
    expect(second.balance).toBe(400);
    expect(seen).toEqual([1000, 400]);
    expect(reported).toBe(400);
  });

  it("allows the same team name on more than one ticket", async () => {
    const names: string[] = [];
    const client: TicketConfirmClient = {
      async confirmForecastPosition(call) {
        names.push(`${call.ticket}:${call.teamName}`);
        return recorded(call.amount, 0);
      },
    };
    const session = liveSession();
    const entry = stagedQr();
    const tickets = ["openai", "startup-launch", "best-use-of-ai"] as const;
    const keys = [requestKey, secondKey, thirdKey];
    for (let index = 0; index < tickets.length; index += 1) {
      const result = await confirmForecastPosition({
        ...baseInput(client),
        verifiedServerSession: session,
        entry,
        ticket: tickets[index],
        amount: 10,
        requestKey: keys[index],
        teamName: "Same Team",
      });
      expect(result.wrote).toBe(true);
    }
    expect(names).toEqual([
      "openai:Same Team",
      "startup-launch:Same Team",
      "best-use-of-ai:Same Team",
    ]);
  });

  it("does not confirm from demo, a copied session, a query, a header, or the door", async () => {
    const calls: string[] = [];
    const client: TicketConfirmClient = {
      async confirmForecastPosition() {
        calls.push("called");
        return recorded(1, 0);
      },
    };
    const store = memoryDeviceStore();
    const started = startDeviceDemo(store, { name: "Ada Lovelace", email: "ada@example.com" });
    expect(started.ok).toBe(true);
    const demo = await confirmForecastPosition({
      verifiedServerSession: started.ok ? started.demo : null,
      deviceDemo: started.ok ? started.demo : null,
      entry: stagedQr(),
      accountId,
      ticket: "openai",
      amount: 10,
      requestKey,
      teamName: "North",
      client,
    });
    const session = liveSession();
    const copied = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: { ...session },
      ticket: "openai",
      amount: 10,
      teamName: "North",
    });
    const cloned = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: JSON.parse(JSON.stringify(session)) as VerifiedServerSession,
      ticket: "openai",
      amount: 10,
      teamName: "North",
    });
    let callbackCalls = 0;
    const queried = await confirmForecastPosition({
      testCallback: () => {
        callbackCalls += 1;
        return session;
      },
      queryFlag: { live: "1", mode: "live", verified: "true", entry: "qr", event: "hackathon" },
      requestHeader: { "x-verified-session": "true" },
      clientBoolean: true,
      entry: stagedQr(),
      accountId,
      ticket: "openai",
      amount: 10,
      requestKey,
      teamName: "North",
      client,
    });
    expect(demo).toMatchObject({ wrote: false, debited: 0, reason: "not-live" });
    expect(copied).toEqual(demo);
    expect(cloned).toEqual(demo);
    expect(queried).toEqual(demo);
    expect(callbackCalls).toBe(0);
    expect(calls).toEqual([]);

    const ledger = emptyLedger({ visitor: 0 });
    expect(openHackathonDoor(ledger)).toEqual({ ledger, granted: 0, wrote: false });
    expect(confirmExample(ledger)).toEqual({ ledger, wrote: false, debited: 0, requested: false });
  });

  it("writes nothing for an invalid amount, a bad ticket, or the wrong fields", async () => {
    const calls: string[] = [];
    const client: TicketConfirmClient = {
      async confirmForecastPosition() {
        calls.push("called");
        return recorded(1, 0);
      },
    };
    const session = liveSession();
    const entry = stagedQr();
    const amounts = [0, -5, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "0", "1.5", "", "ten", "01"];
    for (const amount of amounts) {
      const result = await confirmForecastPosition({
        ...baseInput(client),
        verifiedServerSession: session,
        entry,
        ticket: "openai",
        amount,
        teamName: "North",
      });
      expect(result).toMatchObject({ wrote: false, debited: 0, reason: "invalid" });
    }
    const wrongTicket = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "chick-fil-a",
      amount: 10,
      teamName: "North",
    });
    const mainWithTeam = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "main",
      amount: 10,
      placeFirst: "North",
      placeSecond: "South",
      placeThird: "West",
      teamName: "North",
    });
    const teamWithPlace = await confirmForecastPosition({
      ...baseInput(client),
      verifiedServerSession: session,
      entry,
      ticket: "best-use-of-ai",
      amount: 10,
      teamName: "North",
      placeFirst: "North",
    });
    expect(wrongTicket).toMatchObject({ wrote: false, debited: 0, reason: "invalid" });
    expect(mainWithTeam.reason).toBe("invalid");
    expect(teamWithPlace.reason).toBe("invalid");
    expect(calls).toEqual([]);
  });

  it("does not use fetch when the server variables are missing", async () => {
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error("fetch was called");
    };
    try {
      const result = await confirmForecastPosition({
        verifiedServerSession: liveSession(),
        entry: stagedQr(),
        accountId,
        ticket: "openai",
        amount: 10,
        requestKey,
        teamName: "North",
      });
      expect(result).toMatchObject({
        wrote: false,
        debited: 0,
        reason: "unavailable",
        message: "Forecast confirmation is unavailable.",
      });
      expect(calls).toBe(0);
    } finally {
      globalThis.fetch = original;
      if (previousUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    }
  });

  it("calls the confirm RPC with the server clock and not a browser time", async () => {
    const secret = "test-service-role";
    const calls: Array<{ url: string; body: Record<string, unknown>; authorization: string | null }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const headers = new Headers(init?.headers);
      calls.push({
        url: String(input),
        body: typeof init?.body === "string" ? (JSON.parse(init.body) as Record<string, unknown>) : {},
        authorization: headers.get("authorization"),
      });
      return new Response(
        JSON.stringify([
          {
            confirmation_id: confirmationId,
            committed: true,
            wrote: true,
            debited: "25",
            replayed: false,
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.SUPABASE_SERVICE_ROLE_KEY = secret;
    const original = globalThis.fetch;
    globalThis.fetch = fetchImpl;
    try {
      const result = await confirmForecastPosition({
        verifiedServerSession: liveSession(),
        entry: stagedQr(),
        accountId,
        ticket: "main",
        amount: 25,
        requestKey,
        placeFirst: "Alpha",
        placeSecond: "Beta",
        placeThird: "Gamma",
        serverTime: "2000-01-01T00:00:00.000Z",
        clock: () => new Date("2026-11-14T18:00:00.000Z"),
      });
      expect(result).toMatchObject({
        confirmation_id: confirmationId,
        committed: true,
        wrote: true,
        debited: 25,
        replayed: false,
      });
      expect(calls).toHaveLength(1);
      expect(new URL(calls[0]!.url).pathname).toBe("/rest/v1/rpc/confirm_forecast_position");
      expect(calls[0]?.authorization).toBe(`Bearer ${secret}`);
      expect(calls[0]?.body).toEqual({
        p_account_id: accountId,
        p_ticket: "main",
        p_amount: 25,
        p_request_key: requestKey,
        p_place_first: "Alpha",
        p_place_second: "Beta",
        p_place_third: "Gamma",
        p_team_name: null,
        p_server_time: "2026-11-14T18:00:00.000Z",
      });
      expect(calls[0]?.body).not.toHaveProperty("balance");
    } finally {
      globalThis.fetch = original;
      if (previousUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    }
  });

  it("keeps a false result and a service-role key out of the visible error", async () => {
    const secret = "test-service-role-secret";
    const falseClient: TicketConfirmClient = {
      async confirmForecastPosition() {
        return declined(80);
      },
    };
    const declinedResult = await confirmForecastPosition({
      ...baseInput(falseClient),
      ticket: "openai",
      amount: 90,
      teamName: "North",
      balance: 80,
    });
    expect(declinedResult).toMatchObject({
      wrote: false,
      debited: 0,
      reason: "declined",
      message: "The position was not written.",
      balance: 80,
    });

    const throwing: TicketConfirmClient = {
      async confirmForecastPosition() {
        throw new Error(`rejected ${secret}`);
      },
    };
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = secret;
    try {
      const failed = await confirmForecastPosition({
        ...baseInput(throwing),
        ticket: "openai",
        amount: 10,
        teamName: "North",
      });
      expect(failed.wrote).toBe(false);
      expect(failed.debited).toBe(0);
      expect(failed.reason).toBe("failed");
      expect(failed.message).toBe("The position could not be written.");
      expect(failed.message).not.toContain(secret);
    } finally {
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    }

    const redirecting = createFetchTicketConfirmClient({
      supabaseUrl: "http://127.0.0.1:54321",
      serviceRoleKey: secret,
      fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://example.invalid/away" } }),
    });
    const redirected = await confirmForecastPosition({
      ...baseInput(redirecting),
      ticket: "startup-launch",
      amount: 10,
      teamName: "North",
    });
    expect(redirected).toMatchObject({
      wrote: false,
      debited: 0,
      reason: "failed",
      message: "The confirmation service redirected the call.",
    });
  });

  it("does not let the forecast form confirm or call fetch", async () => {
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error("fetch was called");
    };
    try {
      const form = new FormData();
      form.set("ticket", "openai");
      form.set("amount", "10");
      form.set("teamName", "North");
      form.set("entry", "qr");
      form.set("event", "hackathon");
      form.set("serverTime", "2000-01-01T00:00:00.000Z");
      const result = await confirmHackathonTicket(form);
      expect(result).toEqual({
        wrote: false,
        debited: 0,
        message: "A verified session is required. Nothing was written.",
      });
      expect(calls).toBe(0);
    } finally {
      globalThis.fetch = original;
      if (previousUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    }
  });

  it("keeps the hackathon client source off ticket confirm and the live session", () => {
    const files = ["hackathon-event.tsx", "hackathon/page.tsx", "hackathon-ticket-list.tsx", "hackathon-entry.ts"];
    const sources = files.map((file) => readFileSync(join(here, "../src/app", file), "utf8"));
    for (const source of sources) {
      expect(source).not.toContain("ticket-confirm");
      expect(source).not.toContain("verified-session");
      expect(source).not.toContain("participant-grant");
    }
    const joined = sources.join("\n");
    expect(joined).not.toMatch(banned);
    const tickets = readFileSync(join(here, "../src/app/hackathon-tickets.ts"), "utf8");
    const list = sources[2] ?? "";
    expect(tickets).not.toMatch(banned);
    expect(list).not.toMatch(banned);
    expect(list).not.toContain("chick-fil-a");
    expect(tickets).not.toContain("Chick-fil-A");
  });
});
