import { handleLocalCombo } from "../../../local/combo-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleLocalCombo(request);
}
