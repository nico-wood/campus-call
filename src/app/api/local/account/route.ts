import { handleLocalAccount } from "../../../local/account-handler";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleLocalAccount(request);
}

export async function DELETE(request: Request) {
  return handleLocalAccount(request);
}
