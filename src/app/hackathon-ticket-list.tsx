"use client";

import { useState, type FormEvent } from "react";
import type { StagedEntry } from "./hackathon-entry";
import { confirmHackathonTicket } from "./hackathon-ticket-action";
import { HACKATHON_TICKETS, type HackathonTicket } from "./hackathon-tickets";

function TicketForm({ ticket, entry }: { ticket: HackathonTicket; entry: StagedEntry | null }) {
  const titleId = `${ticket.id}-ticket-title`;
  const [notice, setNotice] = useState("No confirmation yet.");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    try {
      const result = await confirmHackathonTicket(new FormData(form));
      setNotice(result.wrote ? "The position was recorded." : result.message);
    } catch {
      setNotice("Forecast confirmation is unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <li data-ticket={ticket.id}>
      <div className="outcome">
        <h3 id={titleId} className="outcome-label">
          {ticket.label}
        </h3>
        <span className="door-aside">{ticket.fields === "places" ? "Three places" : "One team"}</span>
      </div>
      <form className="enrollment" aria-labelledby={titleId} noValidate onSubmit={onSubmit}>
        <p className="door-status" role="status">
          {notice}
        </p>
        <input type="hidden" name="ticket" value={ticket.id} />
        {entry ? (
          <>
            <input type="hidden" name="entry" value={entry.entry} />
            <input type="hidden" name="event" value={entry.eventId} />
          </>
        ) : null}
        {ticket.fields === "places" ? (
          <>
            <div className="enrollment-field">
              <label className="enrollment-label" htmlFor={`${ticket.id}-place-first`}>
                First place
              </label>
              <input id={`${ticket.id}-place-first`} className="enrollment-input" name="placeFirst" type="text" />
            </div>
            <div className="enrollment-field">
              <label className="enrollment-label" htmlFor={`${ticket.id}-place-second`}>
                Second place
              </label>
              <input id={`${ticket.id}-place-second`} className="enrollment-input" name="placeSecond" type="text" />
            </div>
            <div className="enrollment-field">
              <label className="enrollment-label" htmlFor={`${ticket.id}-place-third`}>
                Third place
              </label>
              <input id={`${ticket.id}-place-third`} className="enrollment-input" name="placeThird" type="text" />
            </div>
          </>
        ) : (
          <div className="enrollment-field">
            <label className="enrollment-label" htmlFor={`${ticket.id}-team`}>
              Team
            </label>
            <input id={`${ticket.id}-team`} className="enrollment-input" name="teamName" type="text" />
          </div>
        )}
        <div className="enrollment-field">
          <label className="enrollment-label" htmlFor={`${ticket.id}-amount`}>
            Virtual credits
          </label>
          <input
            id={`${ticket.id}-amount`}
            className="enrollment-input"
            name="amount"
            type="text"
            inputMode="numeric"
          />
        </div>
        <button type="submit" className="confirm" disabled={pending}>
          Confirm position
        </button>
      </form>
    </li>
  );
}

export function HackathonTicketList({ entry }: { entry: StagedEntry | null }) {
  return (
    <main className="main frame door-main">
      <section className="event" aria-label="Forecast positions">
        <h2 className="probability-caption">Forecast positions</h2>
        <p className="written-note">
          Each ticket confirms on its own. Virtual credits come from one shared balance. This does not grant virtual
          credits.
        </p>
        <ul className="outcomes">
          {HACKATHON_TICKETS.map((ticket) => (
            <TicketForm key={ticket.id} ticket={ticket} entry={entry} />
          ))}
        </ul>
      </section>
    </main>
  );
}
