import { ForecastList } from "./forecast-list";
import {
  filterExamples,
  readListState,
  resolveSearchParams,
  type SearchParamsInput,
} from "./example-forecasts";
import { Shell } from "./shell";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput;
} = {}) {
  const state = readListState(await resolveSearchParams(searchParams));
  return (
    <Shell category={state.category} query={state.query}>
      <ForecastList state={state} examples={filterExamples(state)} />
    </Shell>
  );
}
