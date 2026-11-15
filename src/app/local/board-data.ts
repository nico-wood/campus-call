import { LIVE_FORECASTS } from "../live-forecasts";
import { mergeBoard, type LocalBoard, type MergedMarket, type BoardStats } from "./markets";
import { localConfig, rpc, type LocalConfig } from "./server";

const EMPTY_BOARD: LocalBoard = { markets: [], stats: { participants: 0, positions: 0, volume: 0 } };

const ENSURE_INTERVAL_MS = 60_000;
let lastEnsureAt = 0;
let ensureInFlight: Promise<void> | null = null;

/**
 * Calls ensure_local_market for every catalog market so each one opens at its
 * researched prior instead of 50/50 on its first position. Idempotent on the
 * database side; cached here for 60 seconds so a busy board doesn't call it
 * on every request.
 */
function ensurePriorsSeeded(config: LocalConfig): Promise<void> {
  const now = Date.now();
  if (now - lastEnsureAt < ENSURE_INTERVAL_MS) return Promise.resolve();
  if (ensureInFlight) return ensureInFlight;
  lastEnsureAt = now;
  ensureInFlight = Promise.all(
    LIVE_FORECASTS.map((forecast) =>
      rpc(config, "ensure_local_market", {
        p_id: forecast.id,
        p_outcome_count: forecast.outcomes.length,
        p_close_at: forecast.closesAt,
        p_prior: forecast.prior,
        p_b: 1000,
      }).catch(() => undefined),
    ),
  )
    .then(() => undefined)
    .finally(() => {
      ensureInFlight = null;
    });
  return ensureInFlight;
}

/**
 * Loads the board directly from Supabase (no self-fetch). Falls back to the
 * catalog at equal prices and zero stats when the database isn't configured
 * or isn't reachable, so the page always renders something real.
 */
export async function loadMergedBoard(): Promise<{ markets: MergedMarket[]; stats: BoardStats }> {
  const config = localConfig();
  if (!config) return { markets: mergeBoard(EMPTY_BOARD, LIVE_FORECASTS), stats: EMPTY_BOARD.stats };
  try {
    await ensurePriorsSeeded(config);
    const board = await rpc<LocalBoard>(config, "local_board");
    return { markets: mergeBoard(board, LIVE_FORECASTS), stats: board.stats };
  } catch {
    return { markets: mergeBoard(EMPTY_BOARD, LIVE_FORECASTS), stats: EMPTY_BOARD.stats };
  }
}
