import { handleLocalCombos } from "../../../local/combo-handler";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleLocalCombos(request);
}
