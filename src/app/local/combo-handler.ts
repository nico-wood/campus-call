import { LIVE_FORECASTS } from "../live-forecasts";
import { findEventForMarket } from "../live-events";
import { validateComboLegs, type ComboLegRef } from "../../lib/combo-pricing";
import {
  MEMBER_COOKIE,
  json,
  limited,
  localConfig,
  openMember,
  readCookie,
  readJson,
  rpc,
  sameOrigin,
} from "./server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STATUS_MESSAGE: Record<string, string> = {
  insufficient: "You don't have enough credits for that.",
  closed: "One of those markets has closed.",
  invalid: "That combo could not be placed.",
};

type ComboRow = {
  status: "ok" | "replayed" | "insufficient" | "closed" | "invalid";
  combo_id: string | null;
  price: number | null;
  potential_return: number | null;
  balance: number | null;
};

/** POST /api/local/combo. Requires the member cookie. */
export async function handleLocalCombo(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request refused." }, 403);

  const config = localConfig();
  if (!config) return json({ error: "Not configured." }, 503);

  const cookie = readCookie(request, MEMBER_COOKIE);
  const member = openMember(config, cookie);
  if (!member) return json({ error: "Sign in to build a combo." }, 401);

  const body = await readJson(request);
  if (!body) return json({ error: "Invalid request." }, 400);

  const rawLegs = Array.isArray(body.legs) ? body.legs : null;
  if (!rawLegs || rawLegs.length < 2 || rawLegs.length > 5) {
    return json({ error: "A combo needs 2 to 5 legs." }, 400);
  }

  const legs: { marketId: string; outcomeIdx: number }[] = [];
  for (const raw of rawLegs) {
    if (!raw || typeof raw !== "object") return json({ error: "Invalid leg." }, 400);
    const record = raw as Record<string, unknown>;
    const marketId = typeof record.marketId === "string" ? record.marketId : null;
    const outcomeIdx = Number.isInteger(record.outcomeIdx) ? (record.outcomeIdx as number) : null;
    if (!marketId || outcomeIdx === null) return json({ error: "Invalid leg." }, 400);
    legs.push({ marketId, outcomeIdx });
  }

  const forecasts = legs.map((leg) => LIVE_FORECASTS.find((item) => item.id === leg.marketId));
  const unknownIndex = forecasts.findIndex((forecast) => !forecast);
  if (unknownIndex !== -1) return json({ error: "That market was not found." }, 404);

  for (let i = 0; i < legs.length; i += 1) {
    const forecast = forecasts[i]!;
    if (legs[i]!.outcomeIdx < 0 || legs[i]!.outcomeIdx >= forecast.outcomes.length) {
      return json({ error: "Choose a valid outcome for every leg." }, 400);
    }
  }

  const legRefs: ComboLegRef[] = legs.map((leg, i) => ({
    marketId: leg.marketId,
    eventId: findEventForMarket(leg.marketId)?.id ?? null,
    horizon: forecasts[i]!.horizon,
  }));
  const validationError = validateComboLegs(legRefs);
  if (validationError) return json({ error: validationError }, 400);

  const amount = Number.isInteger(body.stake) ? (body.stake as number) : null;
  if (amount === null || amount < 1 || amount > 1000) {
    return json({ error: "Enter a stake from 1 to 1,000." }, 400);
  }

  const requestKey = typeof body.requestKey === "string" ? body.requestKey : null;
  if (!requestKey || !UUID_RE.test(requestKey)) {
    return json({ error: "Invalid request." }, 400);
  }

  if (limited(`combo:${member.accountId}`, 30)) {
    return json({ error: "Slow down a little and try again." }, 429);
  }

  let row: ComboRow;
  try {
    const rows = await rpc<ComboRow[]>(config, "place_local_combo", {
      p_account_id: member.accountId,
      p_legs: legs.map((leg) => ({ marketId: leg.marketId, outcomeIdx: leg.outcomeIdx })),
      p_stake: amount,
      p_request_key: requestKey,
    });
    const first = rows[0];
    if (!first) return json({ error: "Could not place that combo. Try again." }, 502);
    row = first;
  } catch {
    return json({ error: "Could not place that combo. Try again." }, 502);
  }

  if (row.status === "ok" || row.status === "replayed") {
    return json({
      status: row.status,
      comboId: row.combo_id,
      price: row.price,
      potentialReturn: row.potential_return,
      balance: row.balance,
    });
  }

  const status = row.status === "insufficient" ? 402 : row.status === "closed" ? 409 : 400;
  return json({ status: row.status, error: STATUS_MESSAGE[row.status] ?? "That combo could not be placed." }, status);
}

/** GET /api/local/combos (member cookie required). */
export async function handleLocalCombos(request: Request): Promise<Response> {
  const config = localConfig();
  if (!config) return json({ error: "Not configured." }, 503);

  const cookie = readCookie(request, MEMBER_COOKIE);
  const member = openMember(config, cookie);
  if (!member) return json({ error: "Not signed in." }, 401);

  try {
    const combos = await rpc<unknown[]>(config, "local_account_combos", { p_account_id: member.accountId });
    return json({ combos });
  } catch {
    return json({ error: "Could not load your combos." }, 502);
  }
}
