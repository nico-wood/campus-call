import { handleLocalLeaderboard } from "../../../local/leaderboard-handler";

export const runtime = "nodejs";

export async function GET() {
  return handleLocalLeaderboard();
}
