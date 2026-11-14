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
  place?: "forecasts" | "portfolio" | "settings";
  children: ReactNode;
}) {
  const hiddenCategory = category !== "All" && category !== "unknown" ? category : null;

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar">
        <p className="sidebar-brand">
          <a href="/">Campus Call</a>
        </p>
        <nav className="side-nav" aria-label="Workspace">
          <a className="side-link" href="/" aria-current={place === "forecasts" ? "page" : undefined}>
            Forecasts
          </a>
          <a
            className="side-link"
            href="/portfolio"
            aria-current={place === "portfolio" ? "page" : undefined}
          >
            Portfolio
          </a>
          <a
            className="side-link"
            href="/settings"
            aria-current={place === "settings" ? "page" : undefined}
          >
            Settings
          </a>
        </nav>
        <section className="side-section" aria-labelledby="forecast-categories">
          <h2 id="forecast-categories" className="side-label">
            Forecast categories
          </h2>
          <ul className="categories">
            {CATEGORIES.map((item) => (
              <li key={item}>
                <a
                  className="category"
                  href={forecastListHref(item, query)}
                  aria-current={item === category ? "true" : undefined}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="account" aria-labelledby="account-heading">
          <h2 id="account-heading" className="side-label">
            Account
          </h2>
          <p>Not signed in</p>
          <p>A demo stays on this device. It does not grant virtual credits.</p>
        </section>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-inner frame">
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
          </div>
        </header>
        <main id="main-content" className="main frame" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
