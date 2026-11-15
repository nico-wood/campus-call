import { loadLeaderboard } from "./leaderboard-data";
import { json } from "./server";

/** GET /api/local/leaderboard. Public. */
export async function handleLocalLeaderboard(): Promise<Response> {
  const rows = await loadLeaderboard(50);
  return json({ rows }, 200, { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" });
}
