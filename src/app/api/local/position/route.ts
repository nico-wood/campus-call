import { handleLocalPosition } from "../../../local/position-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleLocalPosition(request);
}
