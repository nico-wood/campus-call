import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminBoard } from "../local/admin-board";
import { loadMergedBoard } from "../local/board-data";
import { LocalShell } from "../local/local-shell";
import { MEMBER_COOKIE, isAdmin, localConfig, openMember } from "../local/server";

export const metadata: Metadata = {
  title: "Admin · Campus Call",
  description: "Resolve or void local markets.",
};

export default async function AdminPage() {
  const config = localConfig();
  const store = await cookies();
  const raw = store.get(MEMBER_COOKIE)?.value ?? null;
  const member = config ? openMember(config, raw) : null;

  if (!isAdmin(member)) {
    return (
      <LocalShell place="admin">
        <section className="empty" aria-labelledby="admin-heading">
          <h1 id="admin-heading">Not available</h1>
          <p>This page is for admins only.</p>
        </section>
      </LocalShell>
    );
  }

  const { markets } = await loadMergedBoard();
  return (
    <LocalShell place="admin">
      <div className="page-intro">
        <p className="eyebrow">Admin</p>
        <h1 className="list-heading">Resolve local markets</h1>
      </div>
      <AdminBoard initialMarkets={markets} />
    </LocalShell>
  );
}
