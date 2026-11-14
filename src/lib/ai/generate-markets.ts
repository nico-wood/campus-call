import { findBannedTopic } from "./banned-topics";

export interface MarketDraft {
  question: string;
  outcomes: ["YES", "NO"];
  resolutionSource: string;
  closeAt: string;
  category: "campus" | "knowledge" | "academic";
}

export type GenerateMarketsResult =
  | { rejected: true; reason: string }
  | { rejected: false; markets: MarketDraft[] };

const POSTINGS: ReadonlyArray<{ pattern: RegExp; source: string }> = [
  { pattern: /\blibrary\b[\s\S]*\bhours\b|\bhours\b[\s\S]*\blibrary\b/i, source: "library hours page" },
  { pattern: /\bshowcase\b/i, source: "showcase listing" },
  { pattern: /\bclub fair\b/i, source: "club-fair listing" },
  { pattern: /\b(?:transit|shuttle)\b/i, source: "transit notice" },
  { pattern: /\bkickoff\b/i, source: "kickoff notice" },
  { pattern: /\bdiscord\b/i, source: "Discord member count" },
];

function postingNamedIn(announcement: string): string {
  for (const posting of POSTINGS) {
    if (posting.pattern.test(announcement)) return posting.source;
  }
  return "campus announcement";
}

/** Phase B. Must pass evals offline. Do not call a live model from the eval path. */
export function generateMarkets(announcement: string, deadline: string | null): GenerateMarketsResult {
  const banned = findBannedTopic(announcement);
  if (banned !== null) {
    return { rejected: true, reason: `Rejected: ${banned}` };
  }

  const question = announcement.trim();
  if (question.length === 0 || findBannedTopic(question) !== null) {
    return { rejected: true, reason: "Announcement is not an allowed market question." };
  }

  if (deadline === null || Number.isNaN(Date.parse(deadline))) {
    return { rejected: true, reason: "No deadline was given, so no close time was set." };
  }

  return {
    rejected: false,
    markets: [
      {
        question,
        outcomes: ["YES", "NO"],
        resolutionSource: postingNamedIn(announcement),
        closeAt: deadline,
        category: "campus",
      },
    ],
  };
}
