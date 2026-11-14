// Visible on purpose. Filtering, search results, and portfolio navigation are later work.
const CATEGORIES = ["All", "Sports", "Music", "Dining", "Hackathon"] as const;

export default function HomePage() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner frame">
          <h1 className="brand">
            <a href="/">Campus Call</a>
          </h1>
          <div className="search">
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
            />
          </div>
          <button type="button" className="portfolio">
            Portfolio
          </button>
        </div>
      </header>
      <nav className="category-bar" aria-label="Categories">
        <div className="frame">
          <ul className="categories">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <button
                  type="button"
                  className="category"
                  aria-current={category === "All" ? "true" : undefined}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="main frame">
        <section className="empty" aria-labelledby="forecast-list-heading">
          <h2 id="forecast-list-heading">Forecasts</h2>
          <p>No forecasts are listed yet.</p>
        </section>
      </main>
    </div>
  );
}
