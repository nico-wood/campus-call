import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VolleyballMatch } from "../src/app/volleyball-match";

describe("volleyball match", () => {
  it("offers a position on each question and shows the team marks", () => {
    const html = renderToStaticMarkup(createElement(VolleyballMatch));

    expect(html).toContain('src="/teams/cal-poly.svg"');
    expect(html).toContain('src="/teams/sacramento-state.svg"');
    expect(html).toContain("Market probability is not published for this match yet.");
    expect(html.match(/>Confirm</g)).toHaveLength(4);
    expect(html).toContain(">25<");
    expect(html).toContain(">50<");
    expect(html).toContain(">100<");
    expect(html).toContain('type="button"');
    expect(html).not.toContain("%");
    expect(html).not.toContain('method="post"');
    expect(html.toLowerCase()).not.toMatch(/\b(bet|wager|odds|payout)s?\b/);
  });
});
