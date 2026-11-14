import type { ReactNode } from "react";
import {
  CATEGORIES,
  forecastListHref,
  type Category,
} from "./example-forecasts";

export function Shell({
  category,
  query,
  place = "forecasts",
  children,
}: {
  category: Category | "unknown";
  query: string;
  place?: "forecasts" | "portfolio" | "settings" | "access";
  children: ReactNode;
}) {
  const hiddenCategory = category !== "All" && category !== "unknown" ? category : null;

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-inner frame">
            <p className="brand"><a href="/">Campus Call</a></p>
            <form className="search" action="/" method="get" role="search">
              <label className="visually-hidden" htmlFor="forecast-search">
                Search forecasts
              </label>
              <input
                id="forecast-search"
                className="search-input"
                type="search"
                name="q"
                placeholder="Search forecasts"
                autoComplete="off"
                defaultValue={query}
              />
              {hiddenCategory ? (
                <input type="hidden" name="category" value={hiddenCategory} />
              ) : null}
            </form>
            <nav className="workspace-nav" aria-label="Workspace">
              <a href="/portfolio" aria-current={place === "portfolio" ? "page" : undefined}>Portfolio</a>
              <a href="/settings" aria-current={place === "settings" ? "page" : undefined}>Settings</a>
            </nav>
          </div>
          <nav className="category-bar frame" aria-label="Forecast categories">
            <ul className="categories">
              {CATEGORIES.map((item) => (
                <li key={item}>
                  <a className="category" href={forecastListHref(item, query)} aria-current={item === category ? "true" : undefined}>{item}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main-content" className="main frame" tabIndex={-1}>{children}</main>
        <footer className="workspace-footer frame">
          <p><span>Not signed in</span> · A demo stays on this device. It does not grant virtual credits.</p>
          <a href="/settings">Account status</a>
        </footer>
      </div>
    </div>
  );
}
