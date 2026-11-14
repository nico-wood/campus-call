import { handleWaitlistRequest } from "../../waitlist/handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleWaitlistRequest(request);
}
