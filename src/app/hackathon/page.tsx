import type { Metadata } from "next";
import { HackathonEventView } from "../hackathon-event";
import { loadHackathonDoor, type SearchParamsInput } from "../hackathon-entry";

export const metadata: Metadata = {
  title: "Hackathon forecast · Campus Call",
  description: "The hackathon event. Entry is not open yet. No virtual credits are granted here.",
};

export default async function HackathonPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput;
} = {}) {
  const door = await loadHackathonDoor(searchParams);
  return <HackathonEventView entry={door.entry} section={door.section} />;
}
