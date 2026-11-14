import type { Metadata } from "next";
import { Shell } from "../shell";

export const metadata: Metadata = {
  title: "Settings · Campus Call",
  description: "Account status for Campus Call. A demo is not a verified account.",
};

export default function SettingsPage() {
  return (
    <Shell category="All" query="" place="settings">
      <div className="page-intro">
        <p className="eyebrow">Your workspace</p>
        <h1 className="list-heading">Settings</h1>
        <p className="intro-description">Your account and demo status, in one place.</p>
      </div>
      <section className="settings-panel" aria-labelledby="settings-account">
        <h2 id="settings-account">Account</h2>
        <span className="example-label">Not signed in</span>
        <p>Not signed in. Entering an email is not verified ownership.</p>
        <p>A demo stays on this device. It does not grant virtual credits.</p>
      </section>
    </Shell>
  );
}
