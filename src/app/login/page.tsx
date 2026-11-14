import type { Metadata } from "next";
import { Shell } from "../shell";

export const metadata: Metadata = {
  title: "Account access · Campus Call",
  description: "Campus Call account registration is currently closed. Join the waitlist for access updates.",
};

export default function LoginPage() {
  return (
    <Shell category="All" query="" place="access">
      <section className="access-page" aria-labelledby="access-title">
        <p className="access-status">Early access</p>
        <h1 id="access-title" className="list-heading">Registration is currently closed.</h1>
        <p className="access-description">Join the Campus Call waitlist to receive updates when account registration opens.</p>
        <a className="confirm access-primary" href="/waitlist">Join the waitlist <span aria-hidden="true">→</span></a>
        <p className="access-fine-print">You can continue exploring example forecasts without an account.</p>
        <a className="back-link" href="/">Back to forecasts</a>
      </section>
    </Shell>
  );
}
