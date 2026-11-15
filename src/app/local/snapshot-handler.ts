import {
  MEMBER_COOKIE,
  isAdmin,
  json,
  localConfig,
  openMember,
  readCookie,
  rpc,
  sameOrigin,
} from "./server";

type SnapshotRow = { rank: number; displayName: string; balance: number; openValue: number; total: number; positions: number };
type Snapshot = { id: string; rows: SnapshotRow[]; createdAt: string };

/** POST /api/local/snapshot freezes the top-50 leaderboard. GET reads the latest one. Admin only. */
export async function handleLocalSnapshot(request: Request): Promise<Response> {
  const config = localConfig();
  if (!config) return json({ error: "Not configured." }, 503);

  const cookie = readCookie(request, MEMBER_COOKIE);
  const member = openMember(config, cookie);
  if (!isAdmin(member)) return json({ error: "Forbidden." }, 403);

  if (request.method === "GET") {
    try {
      const snapshot = await rpc<Snapshot | null>(config, "latest_prize_snapshot");
      return json({ snapshot });
    } catch {
      return json({ error: "Could not load the latest snapshot." }, 502);
    }
  }

  if (!sameOrigin(request)) return json({ error: "Cross-origin request refused." }, 403);

  try {
    const snapshot = await rpc<Snapshot>(config, "freeze_prize_snapshot");
    return json({ snapshot });
  } catch {
    return json({ error: "Could not freeze a snapshot." }, 502);
  }
}
