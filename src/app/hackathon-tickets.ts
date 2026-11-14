/** Four hackathon forecast tickets. Challenge labels are the ticket ids. */

export const HACKATHON_TICKETS = [
  { id: "main", label: "Main", fields: "places" },
  { id: "openai", label: "openai", fields: "team" },
  { id: "startup-launch", label: "startup-launch", fields: "team" },
  { id: "best-use-of-ai", label: "best-use-of-ai", fields: "team" },
] as const;

export type HackathonTicket = (typeof HACKATHON_TICKETS)[number];
export type HackathonTicketId = HackathonTicket["id"];
export type HackathonTicketFields = HackathonTicket["fields"];

export type HackathonTicketFormState = {
  wrote: boolean;
  debited: number;
  message: string;
};

export function hackathonTicket(id: unknown): HackathonTicket | null {
  if (typeof id !== "string") return null;
  return HACKATHON_TICKETS.find((ticket) => ticket.id === id) ?? null;
}
