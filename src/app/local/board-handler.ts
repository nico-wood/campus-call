import { loadMergedBoard } from "./board-data";
import { json } from "./server";

/** GET /api/local/board. Public. Merges local_board() with the server catalog. */
export async function handleLocalBoard(): Promise<Response> {
  const { markets, stats } = await loadMergedBoard();
  return json(
    { markets, stats },
    200,
    { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" },
  );
}
