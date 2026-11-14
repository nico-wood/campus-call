import { handleParticipantAuth } from "../../../participant-auth-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleParticipantAuth(request);
}
