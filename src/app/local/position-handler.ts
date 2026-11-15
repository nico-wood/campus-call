import { LIVE_FORECASTS } from "../live-forecasts";
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
  closed: "This market has closed.",
  invalid: "That position could not be placed.",
};

type PositionRow = {
  status: "ok" | "replayed" | "insufficient" | "closed" | "invalid";
  position_id: string | null;
  shares: number;
  prices: number[] | null;
  balance: number | null;
};

/** POST /api/local/position. Requires the member cookie. */
export async function handleLocalPosition(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request refused." }, 403);

  const config = localConfig();
  if (!config) return json({ error: "Not configured." }, 503);

  const cookie = readCookie(request, MEMBER_COOKIE);
  const member = openMember(config, cookie);
  if (!member) return json({ error: "Sign in to take a position." }, 401);

  const body = await readJson(request);
  if (!body) return json({ error: "Invalid request." }, 400);

  const marketId = typeof body.marketId === "string" ? body.marketId : null;
  const forecast = marketId ? LIVE_FORECASTS.find((item) => item.id === marketId) : undefined;
  if (!forecast) return json({ error: "That market was not found." }, 404);

  const outcome = Number.isInteger(body.outcome) ? (body.outcome as number) : null;
  const amount = Number.isInteger(body.amount) ? (body.amount as number) : null;
  const requestKey = typeof body.requestKey === "string" ? body.requestKey : null;

  if (outcome === null || outcome < 0 || outcome >= forecast.outcomes.length) {
    return json({ error: "Choose a valid outcome." }, 400);
  }
  if (amount === null || amount < 1 || amount > 10000) {
    return json({ error: "Enter an amount from 1 to 10,000." }, 400);
  }
  if (!requestKey || !UUID_RE.test(requestKey)) {
    return json({ error: "Invalid request." }, 400);
  }

  if (limited(`position:${member.accountId}`, 30)) {
    return json({ error: "Slow down a little and try again." }, 429);
  }

  let row: PositionRow;
  try {
    const rows = await rpc<PositionRow[]>(config, "place_local_position", {
      p_account_id: member.accountId,
      p_market_id: forecast.id,
      p_outcome_count: forecast.outcomes.length,
      p_close_at: forecast.closesAt,
      p_outcome: outcome,
      p_amount: amount,
      p_request_key: requestKey,
    });
    const first = rows[0];
    if (!first) return json({ error: "Could not place that position. Try again." }, 502);
    row = first;
  } catch {
    return json({ error: "Could not place that position. Try again." }, 502);
  }

  if (row.status === "ok" || row.status === "replayed") {
    return json({
      status: row.status,
      positionId: row.position_id,
      shares: row.shares,
      prices: row.prices,
      balance: row.balance,
    });
  }

  const status = row.status === "insufficient" ? 402 : row.status === "closed" ? 409 : 400;
  return json({ status: row.status, error: STATUS_MESSAGE[row.status] ?? "That position could not be placed." }, status);
}
