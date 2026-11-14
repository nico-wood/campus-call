import type { Metadata } from "next";
import { Shell } from "../shell";
import { WaitlistForm } from "./waitlist-form";

export const metadata: Metadata = {
  title: "Join the waitlist · Campus Call",
  description: "Join the Campus Call waitlist for account-access updates. Registration is currently closed.",
};

export default function WaitlistPage() {
  return (
    <Shell category="All" query="" place="access">
      <section className="access-page" aria-labelledby="waitlist-title">
        <p className="access-status">Early access</p>
        <h1 id="waitlist-title" className="list-heading">Join the waitlist.</h1>
        <p className="access-description">Leave your name and email to receive account-access updates.</p>
        <WaitlistForm />
        <a className="back-link" href="/">Back to forecasts</a>
      </section>
    </Shell>
  );
}
