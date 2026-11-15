import { LIVE_FORECASTS } from "../live-forecasts";
import {
  MEMBER_COOKIE,
  RpcError,
  isAdmin,
  json,
  localConfig,
  openMember,
  readCookie,
  readJson,
  rpc,
  sameOrigin,
} from "./server";

/** POST /api/local/resolve. Admin only (CAMPUS_CALL_ADMIN_EMAILS). */
export async function handleLocalResolve(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json({ error: "Cross-origin request refused." }, 403);

  const config = localConfig();
  if (!config) return json({ error: "Not configured." }, 503);

  const cookie = readCookie(request, MEMBER_COOKIE);
  const member = openMember(config, cookie);
  if (!isAdmin(member)) return json({ error: "Forbidden." }, 403);

  const body = await readJson(request);
  if (!body) return json({ error: "Invalid request." }, 400);

  const marketId = typeof body.marketId === "string" ? body.marketId : null;
  const forecast = marketId ? LIVE_FORECASTS.find((item) => item.id === marketId) : undefined;
  if (!forecast) return json({ error: "That market was not found." }, 404);

  const outcome = Number.isInteger(body.outcome) ? (body.outcome as number) : null;
  if (outcome === null || outcome < -1 || outcome >= forecast.outcomes.length) {
    return json({ error: "Choose a valid outcome, or -1 to void." }, 400);
  }

  try {
    const rows = await rpc<{ positions_paid: number; credits_paid: number }[]>(
      config,
      "resolve_local_market",
      { p_market_id: forecast.id, p_outcome: outcome },
    );
    return json(rows[0] ?? { positions_paid: 0, credits_paid: 0 });
  } catch (error) {
    if (error instanceof RpcError && /not found/i.test(error.detail)) {
      return json({ error: "no positions yet" }, 409);
    }
    if (error instanceof RpcError && /already resolved/i.test(error.detail)) {
      return json({ error: "already resolved" }, 409);
    }
    return json({ error: "Could not resolve that market." }, 502);
  }
}
