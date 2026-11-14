"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { StagedEntry } from "./hackathon-entry";
import { HACKATHON_TICKETS } from "./hackathon-tickets";
import { EMPTY_BUNDLE_PICKS, HACKATHON_TEAM_ROSTER, PREDICTION_SLOTS, TEAM_ROSTER_SOURCE, splitBundleCredits, type BundlePicks, type PredictionSlot } from "./hackathon-bundle";
import { UiIcon } from "./ui-icon";

type AccountView = { signedIn: boolean; balance: number | null; name?: string; positions?: unknown[] };
const EMPTY_ACCOUNT: AccountView = { signedIn: false, balance: null };

export function HackathonTicketList({ entry }: { entry: StagedEntry | null }) {
  const [picks, setPicks] = useState<BundlePicks>({ ...EMPTY_BUNDLE_PICKS });
  const [active, setActive] = useState<PredictionSlot>("first");
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState<AccountView>(EMPTY_ACCOUNT);
  const [accountLoading, setAccountLoading] = useState(true);
  const [notice, setNotice] = useState("No confirmation yet.");
  const [pending, setPending] = useState(false);
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const requestKey = useRef<string | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const amounts = account.balance === null ? [] : splitBundleCredits(account.balance);
  const activeSlot = PREDICTION_SLOTS.find(slot => slot.id === active)!;
  const count = PREDICTION_SLOTS.filter(slot => picks[slot.id]).length;
  const teams = HACKATHON_TEAM_ROSTER.filter(team => team.name.toLowerCase().includes(query.trim().toLowerCase()));

  async function loadAccount(signal?: AbortSignal) {
    const response = await fetch("/api/hackathon/ticket", { credentials: "same-origin", cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) throw new Error("Your balance is unavailable. Refresh before confirming.");
    if (data.signedIn === true && Number.isSafeInteger(data.balance) && data.balance >= 0) setAccount({ signedIn: true, balance: data.balance, name: data.name, positions: Array.isArray(data.positions) ? data.positions : [] });
    else setAccount(EMPTY_ACCOUNT);
  }
  useEffect(() => {
    const controller = new AbortController();
    void loadAccount(controller.signal).catch(() => { if (!controller.signal.aborted) setNotice("Your balance is unavailable. Refresh before confirming."); }).finally(() => { if (!controller.signal.aborted) setAccountLoading(false); });
    return () => controller.abort();
  }, []);

  function chooseTeam(id: string) {
    const updated = { ...picks, [active]: id };
    setPicks(updated);
    const index = PREDICTION_SLOTS.findIndex(slot => slot.id === active);
    const next = [...PREDICTION_SLOTS.slice(index + 1), ...PREDICTION_SLOTS.slice(0, index)].find(slot => !updated[slot.id]);
    if (next) setActive(next.id);
    setNotice(`${HACKATHON_TEAM_ROSTER.find(team => team.id === id)?.name} selected for ${activeSlot.label}. ${next ? `Choose ${next.label} next.` : "All six predictions are selected. Review your ticket."}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (count !== PREDICTION_SLOTS.length) { setNotice("Choose a team for each of the six predictions."); status.current?.focus(); return; }
    if (!account.signedIn) { setRequiresSignIn(true); setNotice("Sign in with a verified account to confirm. No virtual credits were deducted."); return; }
    if (!entry) { setNotice("Use the hackathon QR entry before confirming your ticket."); return; }
    if (!amounts.length) { setNotice("At least 10 virtual credits are required for this complete ticket."); return; }
    setPending(true);
    requestKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/hackathon/ticket", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ picks, requestKey: requestKey.current, entry: entry.entry, event: entry.eventId }) });
      const data = await response.json();
      if (response.status === 401) setRequiresSignIn(true);
      if (response.ok && data.wrote === true) {
        setRecorded(true);
        setAccount(current => ({ ...current, balance: Number.isSafeInteger(data.balance) ? data.balance : null }));
        setNotice(typeof data.message === "string" ? data.message : "Your complete ticket was recorded.");
      } else setNotice(typeof data.message === "string" ? data.message : typeof data.error === "string" ? data.error : "Your complete ticket could not be verified. Refresh your balance.");
    } catch { setNotice("The ticket result is unavailable. Refresh your balance before retrying; your request will keep the same reference."); }
    finally { setPending(false); }
  }

  return <section className="hackathon-positions" aria-label="Hackathon prize ticket">
    <div className="bundle-heading"><div><p className="eyebrow">One ticket · six predictions</p><h2>Your hackathon forecast</h2><p>Choose the podium and one team for each challenge. Confirm everything together.</p></div><div className="bundle-balance" aria-live="polite"><span>Virtual credits available</span><strong data-testid="ticket-credit-balance">{accountLoading ? "Loading…" : account.balance === null ? "—" : account.balance.toLocaleString("en-US")}</strong><span>{account.signedIn ? `Verified balance${account.name ? ` for ${account.name}` : ""}` : "Sign in to see your verified balance"}</span><button type="button" onClick={() => { setAccountLoading(true); void loadAccount().catch(() => setNotice("Your balance is unavailable.")).finally(() => setAccountLoading(false)); }}>Refresh balance</button></div></div>
    <form className="bundle-form" onSubmit={onSubmit} noValidate aria-label="Complete hackathon ticket">
      <input type="hidden" name="amount" value={account.balance ?? ""} />
      <input type="hidden" name="placeFirst" value={picks.first} /><input type="hidden" name="placeSecond" value={picks.second} /><input type="hidden" name="placeThird" value={picks.third} />
      <input type="hidden" name="teamName" value={picks.openai} /><input type="hidden" name="teamName" value={picks.startup} /><input type="hidden" name="teamName" value={picks.ai} />
      <div className="bundle-workspace">
        <section className="team-directory" aria-labelledby="team-directory-title">
          <div className="team-directory-heading"><div><h3 id="team-directory-title">Explore the teams</h3><p>{HACKATHON_TEAM_ROSTER.length} check-in team labels · all shown below</p></div><label className="team-directory-search"><UiIcon name="search" /><span className="visually-hidden">Search teams</span><input type="search" placeholder="Search teams" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
          <p className="roster-disclosure">{TEAM_ROSTER_SOURCE} Winning probabilities are pending research estimates.</p>
          <nav className="bundle-pick-tabs" aria-label="Choose prediction to edit">{PREDICTION_SLOTS.map(slot => <button key={slot.id} type="button" aria-pressed={active === slot.id} onClick={() => setActive(slot.id)}>{picks[slot.id] ? <span aria-hidden="true">✓ </span> : null}{slot.label}</button>)}</nav>
          <div className="active-prediction"><span>Choose a team for</span><strong>{activeSlot.label}</strong><span>{activeSlot.weight}% of your balance</span></div>
          <div className="team-card-grid">
            {teams.map(team => {
              const selected = picks[active] === team.id;
              const slots = PREDICTION_SLOTS.filter(slot => picks[slot.id] === team.id);
              return <button type="button" key={team.id} className="team-choice-card" aria-pressed={selected} aria-label={`Choose ${team.name} for ${activeSlot.label}`} disabled={recorded || pending} onClick={() => chooseTeam(team.id)}>
                <span className="team-choice-top"><span className="team-card-avatar" aria-hidden="true">{team.name.slice(0, 2).toUpperCase()}</span><span className="team-choice-indicator" aria-hidden="true">{selected ? "✓" : "+"}</span></span><strong>{team.name}</strong>
                <span className="team-probability"><span>Winning probability</span><span>{team.probability === null ? "Pending research" : `${team.probability}%`}</span></span>
                {slots.length ? <span className="team-pick-tags">{slots.map(slot => <span key={slot.id}>{slot.label}</span>)}</span> : <span className="team-entry-status">Entry unverified</span>}
              </button>;
            })}
          </div>
          {!teams.length ? <p className="written-note">No team matches this search. Clear the search to see the full roster.</p> : null}
        </section>
        <aside id="bundle-summary" className="bundle-summary" aria-labelledby="bundle-summary-title" tabIndex={-1}>
          <div className="bundle-summary-title"><h3 id="bundle-summary-title">Your complete ticket</h3><span>{count}/6 picks</span></div>
          {HACKATHON_TICKETS.map(ticket => <section className="bundle-ticket-group" data-ticket={ticket.id} key={ticket.id}><h4>{ticket.label}</h4>{PREDICTION_SLOTS.filter(slot => slot.ticket === ticket.id).map(slot => {
            const index = PREDICTION_SLOTS.findIndex(item => item.id === slot.id);
            const team = HACKATHON_TEAM_ROSTER.find(item => item.id === picks[slot.id]);
            return <button type="button" className="bundle-pick" key={slot.id} aria-pressed={active === slot.id} onClick={() => setActive(slot.id)} disabled={recorded || pending}><span className="bundle-pick-label"><span>{slot.label}</span><strong>{team?.name ?? "Choose a team"}</strong></span><span className="bundle-pick-weight"><strong>{amounts[index] === undefined ? `${slot.weight}%` : amounts[index]}</strong><span>{amounts[index] === undefined ? "allocation" : "credits"}</span></span></button>;
          })}</section>)}
          <div className="bundle-allocation-note"><strong>All available credits, allocated automatically</strong><p>1st: 30%. 2nd: 20%. 3rd: 20%. Each challenge: 10%. Whole-credit rounding may differ by one credit. Credits are deducted only when the complete ticket is recorded.</p></div>
          <div className="bundle-total"><span>Total allocation</span><strong>{account.balance === null ? "Your available balance" : `${account.balance.toLocaleString("en-US")} virtual credits`}</strong></div>
          <button type="submit" className="confirm bundle-confirm" disabled={pending || recorded}>{pending ? "Recording complete ticket…" : recorded ? "Ticket recorded" : "Confirm complete ticket"}</button>
          <p ref={status} tabIndex={-1} className="bundle-notice" role="status" aria-live="polite">{notice}</p>
          {requiresSignIn ? <div className="access-notice"><h4>Sign in to continue</h4><p>A verified account is required. Preview selections do not spend virtual credits.</p><a className="access-signin" href="/login">Continue to sign in <span aria-hidden="true">→</span></a></div> : null}
          <p className="bundle-eligibility-note">Team entries and challenge eligibility must be verified before the complete ticket can be recorded.</p>
        </aside>
      </div>
      <button type="button" className="bundle-mobile-review" onClick={() => { const summary = document.getElementById("bundle-summary"); summary?.focus({ preventScroll: true }); summary?.scrollIntoView({ block: "start", behavior: "instant" }); }}>Review ticket <span>{count}/6 predictions</span><UiIcon name="chevron" /></button>
    </form>
  </section>;
}
