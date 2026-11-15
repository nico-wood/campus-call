import { handleSignup } from "../../local/signup-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleSignup(request);
}
