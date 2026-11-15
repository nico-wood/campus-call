import type { Metadata } from "next";
import { LocalShell } from "../local/local-shell";
import { PortfolioView } from "../local/portfolio-view";

export const metadata: Metadata = {
  title: "Portfolio · Campus Call",
  description: "Your balance, open position value, and positions.",
};

export default function PortfolioPage() {
  return (
    <LocalShell place="portfolio">
      <PortfolioView />
    </LocalShell>
  );
}
