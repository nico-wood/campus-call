import type { Metadata } from "next";
import { Shell } from "../shell";

export const metadata: Metadata = {
  title: "Settings · Campus Call",
  description: "Account status for Campus Call. A demo is not a verified account.",
};

export default function SettingsPage() {
  return (
    <Shell category="All" query="" place="settings">
      <h2 className="list-heading">Settings</h2>
      <section className="empty" aria-labelledby="settings-account">
        <h2 id="settings-account">Account</h2>
        <p>Not signed in. Entering an email is not verified ownership.</p>
        <p>A demo stays on this device. It does not grant virtual credits.</p>
      </section>
    </Shell>
  );
}
