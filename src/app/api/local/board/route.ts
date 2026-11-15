import { handleLocalBoard } from "../../../local/board-handler";

export const runtime = "nodejs";

export async function GET() {
  return handleLocalBoard();
}
