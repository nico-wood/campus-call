import type { LocalAccount } from "./markets";
import {
  MEMBER_COOKIE,
  json,
  localConfig,
  openMember,
  readCookie,
  rpc,
  sameOrigin,
} from "./server";

/** GET /api/local/account (member cookie required). DELETE signs out. */
export async function handleLocalAccount(request: Request): Promise<Response> {
  const config = localConfig();
  if (!config) return json({ error: "Not configured." }, 503);

  if (request.method === "DELETE") {
    if (!sameOrigin(request)) return json({ error: "Cross-origin request refused." }, 403);
    return json({ ok: true }, 200, {
      "Set-Cookie": `${MEMBER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    });
  }

  const cookie = readCookie(request, MEMBER_COOKIE);
  const member = openMember(config, cookie);
  if (!member) return json({ error: "Not signed in." }, 401);

  try {
    const account = await rpc<LocalAccount>(config, "local_account", { p_account_id: member.accountId });
    return json(account);
  } catch {
    return json({ error: "Could not load your account." }, 502);
  }
}
