import type { Metadata } from "next";
import { JoinForm } from "../local/join-form";
import { LocalShell } from "../local/local-shell";

export const metadata: Metadata = {
  title: "Join · Campus Call",
  description: "Join with your name, email, and phone to get 1,000 virtual credits.",
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

function safeNext(raw: unknown): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

function initialMode(raw: unknown): "join" | "signin" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "signin" ? "signin" : "join";
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput;
} = {}) {
  const resolved = (await searchParams) ?? {};
  const next = safeNext(resolved.next);
  const mode = initialMode(resolved.mode);

  return (
    <LocalShell place="join">
      <JoinForm next={next} initialMode={mode} />
    </LocalShell>
  );
}
