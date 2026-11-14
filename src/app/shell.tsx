import type { ReactNode } from "react";
import {
  CATEGORIES,
  forecastListHref,
  type Category,
} from "./example-forecasts";

export function Shell({
  category,
  query,
  children,
}: {
  category: Category | "unknown";
  query: string;
  children: ReactNode;
}) {
  const hiddenCategory = category !== "All" && category !== "unknown" ? category : null;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner frame">
          <h1 className="brand">
            <a href="/">Campus Call</a>
          </h1>
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
          <button type="button" className="portfolio">
            Portfolio
          </button>
        </div>
      </header>
      <nav className="category-bar" aria-label="Categories">
        <div className="frame">
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
        </div>
      </nav>
      <main className="main frame">{children}</main>
    </div>
  );
}
