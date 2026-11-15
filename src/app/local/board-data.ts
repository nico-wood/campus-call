import { LIVE_FORECASTS } from "../live-forecasts";
import { mergeBoard, type LocalBoard, type MergedMarket, type BoardStats } from "./markets";
import { localConfig, rpc } from "./server";

const EMPTY_BOARD: LocalBoard = { markets: [], stats: { participants: 0, positions: 0, volume: 0 } };

/**
 * Loads the board directly from Supabase (no self-fetch). Falls back to the
 * catalog at equal prices and zero stats when the database isn't configured
 * or isn't reachable, so the page always renders something real.
 */
export async function loadMergedBoard(): Promise<{ markets: MergedMarket[]; stats: BoardStats }> {
  const config = localConfig();
  if (!config) return { markets: mergeBoard(EMPTY_BOARD, LIVE_FORECASTS), stats: EMPTY_BOARD.stats };
  try {
    const board = await rpc<LocalBoard>(config, "local_board");
    return { markets: mergeBoard(board, LIVE_FORECASTS), stats: board.stats };
  } catch {
    return { markets: mergeBoard(EMPTY_BOARD, LIVE_FORECASTS), stats: EMPTY_BOARD.stats };
  }
}
