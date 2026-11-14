import { handleHackathonBundle } from "../../../hackathon-bundle-service";

export const runtime = "nodejs";
export async function GET(request: Request) { return handleHackathonBundle(request); }
export async function POST(request: Request) { return handleHackathonBundle(request); }
