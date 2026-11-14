"use client";

import { useState } from "react";
import { UiIcon } from "./ui-icon";

// Public-project candidates from research/team-sweeps/2026-11-14-sweep-01/team-findings.json.
// Suggestions are not an eligibility list. Challenge entrants have not been sourced.
const PROJECT_SUGGESTIONS = ["FSH", "Mission Impromptable", "Cache us if you can", "Study Abroad Student Companion"];

export function TeamPicker({ id, name, label, mainPrize }: { id: string; name: string; label: string; mainPrize: boolean }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const suggestions = mainPrize ? PROJECT_SUGGESTIONS.filter(team => team.toLowerCase().includes(value.toLowerCase())) : [];
  return (
    <div className="enrollment-field team-picker">
      <label className="enrollment-label" htmlFor={id}>{label}</label>
      <div className="team-picker-input"><input id={id} className="enrollment-input" name={name} type="text" autoComplete="off" role="combobox" aria-expanded={open} aria-autocomplete="list" aria-controls={open ? `${id}-options` : undefined} aria-activedescendant={open && suggestions.length ? `${id}-option-${Math.min(activeIndex, suggestions.length - 1)}` : undefined} aria-describedby={`${id}-hint`} value={value} placeholder="Search or enter a team" onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={event => {
        if (event.key === "Escape") setOpen(false);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActiveIndex(index => Math.max(0, Math.min(suggestions.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))); }
        if (event.key === "Enter" && open && suggestions.length) { event.preventDefault(); setValue(suggestions[Math.min(activeIndex, suggestions.length - 1)]); setOpen(false); }
      }} onChange={event => { setValue(event.target.value); setActiveIndex(0); setOpen(true); }} /><span aria-hidden="true"><UiIcon name="search" width="16" height="16" /></span></div>
      <p id={`${id}-hint`} className="team-picker-hint">{mainPrize ? "Research suggestions; final entry is unverified." : "Challenge entry is not in yet. Sourced entrants will appear here."}</p>
      {open ? <div className="team-picker-results" id={`${id}-options`} role="listbox" aria-label={`${label} teams`}>
        {suggestions.length ? suggestions.map((team, index) => <button id={`${id}-option-${index}`} key={team} type="button" role="option" tabIndex={-1} aria-selected={activeIndex === index} onMouseDown={event => event.preventDefault()} onClick={() => { setValue(team); setOpen(false); }}><span className="team-avatar" aria-hidden="true">{team.slice(0, 2).toUpperCase()}</span><span>{team}</span></button>) : <p>{mainPrize ? "Enter a team name to preview your selection." : "No sourced challenge entrants yet."}</p>}
      </div> : null}
    </div>
  );
}
