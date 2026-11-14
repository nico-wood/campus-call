import {
  HACKATHON_EVENT,
  hackathonDoorHref,
  type DoorSection,
  type StagedEntry,
} from "./hackathon-entry";

export function HackathonEventView({
  entry,
  section,
}: {
  entry: StagedEntry | null;
  section: DoorSection;
}) {
  const eventHref = hackathonDoorHref(entry, "event");
  const forecastHref = hackathonDoorHref(entry, "forecast");
  const titleId = "hackathon-event-title";
  const probabilityId = "hackathon-market-probability";

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner frame">
          <h1 className="brand">
            <a href={eventHref}>Campus Call</a>
          </h1>
          <p className="door-kicker">Hackathon forecast</p>
        </div>
      </header>
      <main className="main frame door-main">
        <article className="event" aria-labelledby={titleId}>
          {section === "forecast" ? (
            <p className="event-back">
              <a className="back-link" href={eventHref}>
                Hackathon event
              </a>
            </p>
          ) : null}
          <h2 id={titleId} className="event-question">
            {HACKATHON_EVENT.question}
          </h2>
          <p className="door-status">{HACKATHON_EVENT.entryNote}</p>
          <p className="forecast-close">Closes {HACKATHON_EVENT.closeLabel}</p>
          <p className="written-note">
            This is the hackathon event. It does not grant virtual credits.
          </p>
          {section === "forecast" ? (
            <section className="probability" aria-labelledby={probabilityId}>
              <h3 id={probabilityId} className="probability-caption">
                Market probability
              </h3>
              <p className="written-note">Market probability is not in yet. No position is open.</p>
            </section>
          ) : (
            <nav className="probability" aria-label="Market probability">
              <ul className="outcomes">
                <li>
                  <a className="outcome" href={forecastHref}>
                    <span className="outcome-label">Market probability</span>
                    <span className="door-aside">Not in yet</span>
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </article>
      </main>
    </div>
  );
}
