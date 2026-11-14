"use server";

import { readStagedEntry } from "./hackathon-entry";
import type { HackathonTicketFormState } from "./hackathon-tickets";
import { confirmForecastPosition } from "./ticket-confirm";

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Screen confirm. No live session is available from the form, so this writes nothing. */
export async function confirmHackathonTicket(formData: FormData): Promise<HackathonTicketFormState> {
  const result = await confirmForecastPosition({
    entry: readStagedEntry({
      entry: formText(formData, "entry"),
      event: formText(formData, "event"),
    }),
    ticket: formText(formData, "ticket"),
    amount: formText(formData, "amount"),
    requestKey: crypto.randomUUID(),
    placeFirst: formText(formData, "placeFirst"),
    placeSecond: formText(formData, "placeSecond"),
    placeThird: formText(formData, "placeThird"),
    teamName: formText(formData, "teamName"),
  });
  return {
    wrote: result.wrote,
    debited: result.debited,
    message: result.message,
  };
}
