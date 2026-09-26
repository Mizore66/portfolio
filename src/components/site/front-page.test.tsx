import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getClaim } from "@/content/site";
import { IDENTITY } from "@/content/site/identity";
import { ROLES } from "@/content/site/roles";
import { ClaimLine } from "./ClaimLine";
import { Contact } from "./Contact";
import { Experience } from "./Experience";
import { Hero } from "./Hero";
import { Work } from "./Work";

describe("front page sections", () => {
  it("opens the hero with the statement as h1 and no metric", () => {
    const html = renderToStaticMarkup(<Hero identity={IDENTITY} />);
    expect(html).toMatch(/^<section id="proof"/);
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1];
    expect(h1).toBe("I like systems that have to survive measurement.");
    expect(html).not.toMatch(/claim-/);
  });
  it("labels a claim with its evidence type in text", () => {
    const html = renderToStaticMarkup(<ClaimLine claim={getClaim("setelDefects")} />);
    expect(html).toContain('id="claim-setelDefects"');
    expect(html).toContain("Production");
  });
  it("renders every role anchor and the legacy claim anchors", () => {
    const html = renderToStaticMarkup(<Experience roles={ROLES} />);
    for (const id of ["deriv", "skribble-lab", "monash-university", "western-digital", "setel", "petronas"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('id="claim-setelDefects"');
    expect(html).toContain('id="claim-monashRetrieval"');
    expect(html).toContain('<h3 class="earlier-heading">Earlier experience</h3>');
  });
  it("filters work by path and keeps the leadThroughput anchor in the archive", () => {
    const all = renderToStaticMarkup(<Work path={null} />);
    expect(all).toContain('id="work"');
    expect(all).toContain('id="claim-leadThroughput"');
    expect(all.indexOf('id="faultline"')).toBeLessThan(all.indexOf('id="gemini-teleportal"'));
    expect(all.indexOf('id="gemini-teleportal"')).toBeLessThan(all.indexOf('id="circuitmindai"'));
    const product = renderToStaticMarkup(<Work path="product" />);
    expect(product).not.toContain('id="faultline"');
    expect(product).toContain('id="circuitmindai"');
  });
  it("offers email, phone and both résumé sizes", () => {
    const html = renderToStaticMarkup(<Contact identity={IDENTITY} />);
    expect(html).toContain('href="mailto:anasqumhiyeh@gmail.com"');
    expect(html).toContain('href="tel:+601112983246"');
    expect(html).toContain('href="/print-edition"');
    expect(html).toContain('href="/print-edition?paper=a4"');
    expect(html).toContain("Singapore or Australia");
  });
});
