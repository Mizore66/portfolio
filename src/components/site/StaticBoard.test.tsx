import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LINE_PLIES } from "@/content/site/line";
import { StaticBoard } from "./StaticBoard";

describe("StaticBoard", () => {
  const html = renderToStaticMarkup(<StaticBoard plies={LINE_PLIES} label="Position after 10…Bg4" />);
  it("draws 64 squares and 28 pieces", () => {
    expect(html.match(/<rect /g)).toHaveLength(64);
    expect(html.match(/<text /g)).toHaveLength(28);
  });
  it("is a labelled image", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Position after 10…Bg4"');
  });
  it("colours a1 dark and h1 light", () => {
    expect(html).toMatch(/data-square="a1" class="sq-dark"/);
    expect(html).toMatch(/data-square="h1" class="sq-light"/);
  });
});
