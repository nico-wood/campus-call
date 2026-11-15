"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Brand } from "./brand";
import { GradientBackdrop } from "./gradient-backdrop";
import { WorkspaceSettings } from "./workspace-settings";
import { UiIcon } from "./ui-icon";
import {
  CATEGORIES,
  forecastListHref,
  type Category,
} from "./example-forecasts";

function scrollCategories(list: HTMLUListElement | null, direction: -1 | 1) {
  if (!list) return;
  const styles = window.getComputedStyle(list);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  const item = list.querySelector("li");
  const step = item ? item.getBoundingClientRect().width + gap : list.clientWidth * 0.6;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  list.scrollBy({ left: direction * step * 2, behavior: reduce ? "auto" : "smooth" });
}

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
  const categoriesRef = useRef<HTMLUListElement>(null);
  const hiddenCategory = category !== "All" && category !== "unknown" ? category : null;

  useEffect(() => {
    const list = categoriesRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !current) return;
    const listBox = list.getBoundingClientRect();
    const itemBox = current.getBoundingClientRect();
    if (itemBox.left < listBox.left || itemBox.right > listBox.right) {
      list.scrollLeft += itemBox.left - listBox.left;
    }
  }, [category]);

  return (
    <div className="app">
      <GradientBackdrop />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-inner frame">
            <p className="brand"><Brand /></p>
            <form className="search" action="/" method="get" role="search">
              <UiIcon name="search" className="search-icon" width="18" height="18" />
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
              <WorkspaceSettings current={place === "settings"} />
            </nav>
          </div>
          <nav className="category-bar frame" aria-label="Forecast categories">
            <div className="category-scroller">
              <button
                type="button"
                className="category-scroll"
                aria-label="Previous categories"
                data-tooltip="Previous categories"
                data-tooltip-side="bottom"
                data-tooltip-align="start"
                onClick={() => scrollCategories(categoriesRef.current, -1)}
              >
                <UiIcon name="chevron" className="category-scroll-icon category-scroll-icon-back" width="18" height="18" />
              </button>
              <ul className="categories" ref={categoriesRef}>
                {CATEGORIES.map((item) => (
                  <li key={item}>
                    <a className="category" href={forecastListHref(item, query)} aria-current={item === category ? "true" : undefined}>{item}</a>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="category-scroll"
                aria-label="Next categories"
                data-tooltip="Next categories"
                data-tooltip-side="bottom"
                data-tooltip-align="end"
                onClick={() => scrollCategories(categoriesRef.current, 1)}
              >
                <UiIcon name="chevron" className="category-scroll-icon" width="18" height="18" />
              </button>
            </div>
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
