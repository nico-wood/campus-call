import { handleLocalResolve } from "../../../local/resolve-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleLocalResolve(request);
}
