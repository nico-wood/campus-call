import type { Metadata } from "next";
import { LeaderboardView } from "../local/leaderboard-view";
import { loadLeaderboard } from "../local/leaderboard-data";
import { LocalShell } from "../local/local-shell";

export const metadata: Metadata = {
  title: "Leaderboard · Campus Call",
  description: "Top forecasters by balance plus the value of their open positions.",
};

export default async function LeaderboardPage() {
  const rows = await loadLeaderboard(50);
  return (
    <LocalShell place="leaderboard">
      <LeaderboardView initialRows={rows} />
    </LocalShell>
  );
}
