export const CATEGORIES = ["All", "Sports", "Club sports", "Transit", "Campus", "Weather", "Hackathon"] as const;

export type Category = (typeof CATEGORIES)[number];
export type ForecastCategory = "Sports" | "Music" | "Dining" | "Hackathon" | "Weather" | "Club sports" | "Transit" | "Campus" | "Academics";
export type ForecastShape = "yes-no" | "higher-lower" | "earlier-later";

export type ExampleOutcome = {
  id: string;
  label: string;
  percent: number;
};

export type ExampleForecast = {
  id: string;
  category: ForecastCategory;
  kind: ForecastShape;
  question: string;
  closeLabel: string;
  outcomes: readonly ExampleOutcome[];
};

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export type ListState = {
  category: Category | "unknown";
  query: string;
};

export const EXAMPLES: readonly ExampleForecast[] = [
  {
    id: "sports-exhibition-winner",
    category: "Sports",
    kind: "yes-no",
    question: "Will the home side win the Saturday exhibition?",
    closeLabel: "Saturday, Nov. 15, 2026, 1:00 p.m.",
    outcomes: [
      { id: "yes", label: "Yes", percent: 62 },
      { id: "no", label: "No", percent: 38 },
    ],
  },
  {
    id: "sports-exhibition-total",
    category: "Sports",
    kind: "higher-lower",
    question: "Will the Saturday exhibition total be higher or lower than 70?",
    closeLabel: "Saturday, Nov. 15, 2026, 4:00 p.m.",
    outcomes: [
      { id: "higher", label: "Higher", percent: 55 },
      { id: "lower", label: "Lower", percent: 45 },
    ],
  },
  {
    id: "music-concert-start",
    category: "Music",
    kind: "earlier-later",
    question: "Will the campus concert start earlier or later than 8:00 p.m.?",
    closeLabel: "Friday, Nov. 21, 2026, 6:00 p.m.",
    outcomes: [
      { id: "later", label: "Later", percent: 59 },
      { id: "earlier", label: "Earlier", percent: 41 },
    ],
  },
  {
    id: "dining-late-window",
    category: "Dining",
    kind: "yes-no",
    question: "Will the late dining window stay open past 10:00 p.m.?",
    closeLabel: "Thursday, Nov. 20, 2026, 9:00 p.m.",
    outcomes: [
      { id: "no", label: "No", percent: 67 },
      { id: "yes", label: "Yes", percent: 33 },
    ],
  },
  {
    id: "hackathon-workshop-start",
    category: "Hackathon",
    kind: "earlier-later",
    question: "Will the example workshop start earlier or later than noon?",
    closeLabel: "Sunday, Nov. 16, 2026, 11:00 a.m.",
    outcomes: [
      { id: "earlier", label: "Earlier", percent: 52 },
      { id: "later", label: "Later", percent: 48 },
    ],
  },
];

export function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isPromise(value: object): value is Promise<SearchParamsInput> {
  return "then" in value && typeof (value as { then?: unknown }).then === "function";
}

export async function resolveSearchParams(
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput,
): Promise<SearchParamsInput> {
  if (!searchParams) return {};
  if (isPromise(searchParams)) return (await searchParams) ?? {};
  return searchParams;
}

export function readListState(params: SearchParamsInput): ListState {
  const rawCategory = firstParam(params.category).trim();
  const query = firstParam(params.q).replace(/\s+/g, " ").trim().slice(0, 120);
  if (rawCategory === "") return { category: "All", query };
  const match = CATEGORIES.find((item) => item.toLowerCase() === rawCategory.toLowerCase());
  if (!match) return { category: "unknown", query };
  return { category: match, query };
}

function searchableText(example: ExampleForecast): string {
  return [
    "example",
    example.question,
    example.category,
    example.closeLabel,
    ...example.outcomes.map((outcome) => `${outcome.label} ${outcome.percent}`),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterExamples(state: ListState): ExampleForecast[] {
  if (state.category === "unknown") return [];
  const needle = state.query.toLowerCase();
  return EXAMPLES.filter((example) => {
    if (state.category !== "All" && example.category !== state.category) return false;
    if (!needle) return true;
    return searchableText(example).includes(needle);
  });
}

export function getExample(id: string): ExampleForecast | undefined {
  return EXAMPLES.find((example) => example.id === id);
}

export function forecastListHref(category: Category | "unknown", query: string): string {
  const params = new URLSearchParams();
  if (category !== "All" && category !== "unknown") params.set("category", category);
  if (query.trim()) params.set("q", query.trim());
  const text = params.toString();
  return text ? `/?${text}` : "/";
}

export function exampleEventHref(
  id: string,
  category: Category | "unknown",
  query: string,
): string {
  const params = new URLSearchParams();
  if (category !== "All" && category !== "unknown") params.set("category", category);
  if (query.trim()) params.set("q", query.trim());
  const text = params.toString();
  return text ? `/examples/${id}?${text}` : `/examples/${id}`;
}

export function emptyForecastMessage(state: ListState): string {
  if (state.category === "unknown") {
    return "That category is not on this board. Choose All, Sports, Club sports, Transit, Campus, Weather, or Hackathon.";
  }
  if (state.query) {
    return "No forecast matches this search. Clear the search or choose another category.";
  }
  if (state.category === "Club sports") {
    return "No club match is posted yet. A forecast needs a public schedule that names the opponent, the time, and where the result will be recorded.";
  }
  return "No forecasts are in this category.";
}
