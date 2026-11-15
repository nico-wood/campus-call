import type { LeaderboardRow } from "./markets";
import { localConfig, rpc } from "./server";

type RawRow = {
  rank: number;
  display_name: string;
  balance: number;
  open_value: number;
  total: number;
  positions: number;
};

export async function loadLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  const config = localConfig();
  if (!config) return [];
  try {
    const rows = await rpc<RawRow[]>(config, "local_leaderboard", { p_limit: limit });
    return rows.map((row) => ({
      rank: row.rank,
      displayName: row.display_name,
      balance: row.balance,
      openValue: row.open_value,
      total: row.total,
      positions: row.positions,
    }));
  } catch {
    return [];
  }
}
