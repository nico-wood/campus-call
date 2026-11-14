import roster from "./hackathon-team-roster.json";

export const PREDICTION_SLOTS = [
  { id: "first", label: "1st place", ticket: "main", weight: 30 },
  { id: "second", label: "2nd place", ticket: "main", weight: 20 },
  { id: "third", label: "3rd place", ticket: "main", weight: 20 },
  { id: "openai", label: "Open AI", ticket: "openai", weight: 10 },
  { id: "startup", label: "Startup launch", ticket: "startup-launch", weight: 10 },
  { id: "ai", label: "Best use of AI", ticket: "best-use-of-ai", weight: 10 },
] as const;
export type PredictionSlot = (typeof PREDICTION_SLOTS)[number]["id"];
export type BundlePicks = Record<PredictionSlot, string>;
export const EMPTY_BUNDLE_PICKS: BundlePicks = { first: "", second: "", third: "", openai: "", startup: "", ai: "" };
export type HackathonTeam = { id: string; name: string; probability: number | null; verified: boolean; challenge: string | null };
export const HACKATHON_TEAM_ROSTER: readonly HackathonTeam[] = roster;
export const TEAM_ROSTER_SOURCE = "Check-in research snapshot · 14 November 2026. Final entry and challenge eligibility are unverified.";

/** 30/20/20/10/10/10, using largest remainders to spend the entire whole-credit balance. */
export function splitBundleCredits(balance: number): number[] {
  if (!Number.isSafeInteger(balance) || balance < 10) return [];
  const hundreds = Math.floor(balance / 100);
  const residual = balance % 100;
  const allocations = PREDICTION_SLOTS.map(slot => hundreds * slot.weight + Math.floor(residual * slot.weight / 100));
  const order = PREDICTION_SLOTS.map((slot, index) => ({ index, remainder: residual * slot.weight % 100 })).sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  const remaining = balance - allocations.reduce((sum, value) => sum + value, 0);
  for (let i = 0; i < remaining; i++) allocations[order[i].index]++;
  return allocations;
}
