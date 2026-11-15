import { handleLocalSnapshot } from "../../../local/snapshot-handler";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleLocalSnapshot(request);
}

export async function POST(request: Request) {
  return handleLocalSnapshot(request);
}
