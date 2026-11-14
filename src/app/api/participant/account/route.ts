import { handleParticipantAccount } from "../../../participant-account";

export const runtime = "nodejs";
export async function GET(request: Request) { return handleParticipantAccount(request); }
export async function DELETE(request: Request) { return handleParticipantAccount(request); }
