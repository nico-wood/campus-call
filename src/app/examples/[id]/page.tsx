import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExampleEventView } from "../../example-event";
import {
  CATEGORIES,
  EXAMPLES,
  firstParam,
  getExample,
  readListState,
  resolveSearchParams,
  type Category,
  type SearchParamsInput,
} from "../../example-forecasts";

export function generateStaticParams() {
  return EXAMPLES.map((example) => ({ id: example.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const example = getExample(id);
  return {
    title: example ? `${example.question} · Campus Call` : "Example forecast · Campus Call",
    description: "An example forecast we wrote. It is not live.",
  };
}

export default async function ExampleEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput;
}) {
  const { id } = await params;
  const example = getExample(id);
  if (!example) notFound();

  const resolved = await resolveSearchParams(searchParams);
  const state = readListState(resolved);
  const hasCategory = firstParam(resolved.category).trim() !== "";
  const listed = hasCategory && state.category !== "unknown" ? state.category : example.category;
  const category: Category = (CATEGORIES as readonly string[]).includes(listed) ? (listed as Category) : "All";

  return <ExampleEventView example={example} category={category} query={state.query} />;
}
