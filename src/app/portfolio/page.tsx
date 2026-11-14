import type { Metadata } from "next";
import { Shell } from "../shell";

export const metadata: Metadata = {
  title: "Portfolio · Campus Call",
  description: "Your positions. Example forecasts do not open a position.",
};

export default function PortfolioPage() {
  return (
    <Shell category="All" query="" place="portfolio">
      <div className="page-intro">
        <p className="eyebrow">Your portfolio</p>
        <h1 className="list-heading">Your positions</h1>
      </div>
      <p className="list-note">
        No positions yet. Example forecasts do not open a position or change virtual credits.
      </p>
      <section className="empty" aria-labelledby="positions-heading">
        <h2 id="positions-heading">Nothing open</h2>
        <p>When a forecast can be confirmed, the position will show here.</p>
      </section>
    </Shell>
  );
}
