const PLACE_NAMES = new Set([
  "cal poly",
  "san luis",
  "luis obispo",
  "dexter lawn",
  "university union",
  "grand avenue",
  "kennedy library",
  "poly canyon",
  "cerro vista",
  "sierra madre",
  "yosemite hall",
  "santa lucia",
  "bishop peak",
  "vibe coding",
  "engineering west",
  "engineering east",
  "mustang village",
  "baker science",
]);

function properNames(text: string): string[] {
  const found = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) ?? [];
  return found.filter((name) => !PLACE_NAMES.has(name.toLowerCase()));
}

function isExamContent(text: string): boolean {
  const hasExam = /\b(exams?|midterms?|quizzes|quiz|final exams?)\b/i.test(text);
  const hasLeak = /\b(answer keys?|answers?|questions?|solutions?|confidential|unreleased|leaked)\b/i.test(text);
  if (hasExam && hasLeak) return true;
  if (/\bwhat(?:\s+is|'s)\s+on\s+the\b/i.test(text) && /\b(exam|midterm|final|quiz)\b/i.test(text)) {
    return true;
  }
  return false;
}

function isIndividualGrade(text: string): boolean {
  if (/\b(gpas?|transcripts?|letter grades?)\b/i.test(text)) return true;
  if (/\b(his|her|their|my|student'?s)\s+grades?\b/i.test(text)) return true;
  if (/\b(what|which)\s+grades?\b/i.test(text)) return true;
  if (/\bgrades?\b/i.test(text) && properNames(text).length > 0) return true;
  if (/\b(get|receive|earn)\s+an?\s+[ABCDF][+-]?\b/.test(text) && properNames(text).length > 0) {
    return true;
  }
  return false;
}

function isIndividualStudent(text: string): boolean {
  if (/\bindividual students?\b/i.test(text)) return true;
  if (/\bstudent named\b/i.test(text) || /\bnamed student\b/i.test(text)) return true;
  if (/\bstudent\s+[A-Z][a-z]+\b/.test(text)) return true;
  if (/\b(freshman|sophomore|junior|senior|undergrad(?:uate)?)\s+[A-Z][a-z]+\b/.test(text)) {
    return true;
  }
  const names = properNames(text);
  if (names.length === 0) return false;
  return /\b(student|pass|fail|graduate|drop|enroll|expel)\b/i.test(text);
}

function isSinglePersonOutcome(text: string): boolean {
  const role = /\b(professors?|prof\.?|instructors?|lecturers?|deans?|provosts?|chancellors?)\b/i;
  const act =
    /\b(cancel(?:led|ed|s)?|postpone[sd]?|reschedul(?:e|es|ed)|unilaterally|single-handedly|by himself|by herself|by themselves)\b/i;
  if (role.test(text) && act.test(text)) return true;
  if (/\bsingle (?:person|official|administrator)\b/i.test(text)) return true;
  if (/\b(?:decides|decide|deciding) alone\b/i.test(text)) return true;
  if (/\bpresident\b/i.test(text) && /\b(unilaterally|alone|single-handedly)\b/i.test(text)) {
    return true;
  }
  return false;
}

/** Deterministic. No network. Returns a banned class id, or null when the text is allowed. */
export function findBannedTopic(text: string): string | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (isExamContent(normalized)) return "exam-content";
  if (isIndividualGrade(normalized)) return "individual-grade";
  if (isIndividualStudent(normalized)) return "individual-student";
  if (isSinglePersonOutcome(normalized)) return "single-person-outcome";
  return null;
}
