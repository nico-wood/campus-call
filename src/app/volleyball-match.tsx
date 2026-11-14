const SOURCE_URL = "https://gopoly.com/sports/womens-volleyball/schedule";

const MARKETS = [
  {
    id: "winner",
    question: "Who will win: Cal Poly or Sacramento State?",
    outcomes: ["Cal Poly", "Sacramento State"],
    resolution: "Resolves to the winner on the official final score.",
  },
  {
    id: "sweep",
    question: "Will Cal Poly sweep Sacramento State 3–0?",
    outcomes: ["Yes", "No"],
    resolution: "Yes only if the official final score is Cal Poly 3, Sacramento State 0.",
  },
  {
    id: "sets",
    question: "Will the match go to at least four sets?",
    outcomes: ["Yes", "No"],
    resolution: "Yes if the official final score has four or five sets.",
  },
  {
    id: "set-one",
    question: "Who will win Set 1?",
    outcomes: ["Cal Poly", "Sacramento State"],
    resolution: "Resolves to the team with the higher Set 1 score on the official box score.",
  },
] as const;

const SEARCH_TEXT = "cal poly sacramento state volleyball mott athletics center sweep set women's";

export function volleyballSearchText(): string {
  return `${SEARCH_TEXT} ${MARKETS.map((market) => market.question).join(" ")}`.toLowerCase();
}

export function VolleyballMatch() {
  return (
    <section className="volleyball-match" aria-labelledby="volleyball-match-title">
      <div className="volleyball-heading">
        <p className="eyebrow">Women's volleyball · Saturday</p>
        <h2 id="volleyball-match-title">Cal Poly vs Sacramento State</h2>
        <p>Cal Poly (18–7, 14–1 Big West) hosts Sacramento State (14–12, 9–6 Big West) at Mott Athletics Center.</p>
        <p>Cal Poly won the first meeting 3–0 at Sacramento State on October 1. The match is Saturday, Nov. 14, 2026, at 4:00 p.m. PT.</p>
        <p className="written-note">Market probability is not published for this match yet.</p>
      </div>
      <ul className="volleyball-markets">
        {MARKETS.map((market) => (
          <li key={market.id}>
            <article className="volleyball-card">
              <h3>{market.question}</h3>
              <p className="volleyball-outcomes">{market.outcomes.join(" · ")}</p>
              <p>{market.resolution}</p>
              <p className="forecast-close">Closes Saturday, Nov. 14, 2026, 3:55 p.m. PT</p>
            </article>
          </li>
        ))}
      </ul>
      <p className="volleyball-source">
        Resolution source: <a href={SOURCE_URL}>Cal Poly women's volleyball schedule</a>
      </p>
    </section>
  );
}
