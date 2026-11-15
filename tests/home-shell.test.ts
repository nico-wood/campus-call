import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../src/app/page";

const here = dirname(fileURLToPath(import.meta.url));

describe("home shell", () => {
  it("shows the name, search, portfolio, and category row", async () => {
    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain(">Campus Call<");
    expect(html).toContain('placeholder="Search forecasts"');
    expect(html).toContain(">Portfolio<");
    for (const category of ["All", "Sports", "Club sports", "Transit", "Campus", "Weather"]) {
      expect(html).toContain(`>${category}<`);
    }
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html.toLowerCase()).not.toMatch(/\b(bet|wager|odds|payout)s?\b/);
  });

  it("wraps the top bar on a narrow screen", () => {
    const css = readFileSync(join(here, "../src/app/globals.css"), "utf8");

    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain("@media (max-width: 40rem)");
    expect(css).toContain("--page-max");
  });
});
