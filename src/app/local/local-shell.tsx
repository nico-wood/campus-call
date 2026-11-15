import type { ReactNode } from "react";
import { Brand } from "../brand";
import { UiIcon } from "../ui-icon";
import { LocalMemberProvider } from "./member-context";
import { MemberWidget } from "./member-widget";

export function LocalShell({
  query = "",
  category = null,
  place,
  categoryBar,
  children,
}: {
  query?: string;
  category?: string | null;
  place?: "home" | "market" | "join" | "portfolio" | "leaderboard" | "admin";
  categoryBar?: ReactNode;
  children: ReactNode;
}) {
  const hiddenCategory = category && category !== "All" && category !== "unknown" ? category : null;
  return (
    <LocalMemberProvider>
      <div className="app">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="workspace">
          <header className="topbar">
            <div className="topbar-inner frame">
              <p className="brand"><Brand /></p>
              <form className="search" action="/" method="get" role="search">
                <UiIcon name="search" className="search-icon" width="18" height="18" />
                <label className="visually-hidden" htmlFor="forecast-search">Search forecasts</label>
                <input
                  id="forecast-search"
                  className="search-input"
                  type="search"
                  name="q"
                  placeholder="Search forecasts"
                  autoComplete="off"
                  defaultValue={query}
                />
                {hiddenCategory ? <input type="hidden" name="category" value={hiddenCategory} /> : null}
              </form>
              <nav className="workspace-nav" aria-label="Workspace">
                <a href="/leaderboard" aria-current={place === "leaderboard" ? "page" : undefined}>Leaderboard</a>
                <a href="/portfolio" aria-current={place === "portfolio" ? "page" : undefined}>Portfolio</a>
                <MemberWidget />
              </nav>
            </div>
            {categoryBar}
          </header>
          <main id="main-content" className="main frame" tabIndex={-1}>{children}</main>
          <footer className="workspace-footer frame">
            <p><span>Virtual credits only.</span> They have no cash value. <a href="/leaderboard">See the prize rules</a></p>
          </footer>
        </div>
      </div>
    </LocalMemberProvider>
  );
}
