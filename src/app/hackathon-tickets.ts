/** Four hackathon forecast tickets. Stable ids with presentation labels. */

export const HACKATHON_TICKETS = [
  { id: "main", label: "Main prize", fields: "places" },
  { id: "openai", label: "Open AI", fields: "team" },
  { id: "startup-launch", label: "Startup launch", fields: "team" },
  { id: "best-use-of-ai", label: "Best use of AI", fields: "team" },
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
