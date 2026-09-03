import { describe, expect, it } from "vitest";
import { resumeData } from "@/lib/data";
import { FEATURED_PROJECT_SLUGS, HERO_PROOF, POSITIONING } from "@/lib/metrics";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import { occupancy, positionAfter } from "./chess/replay";
import { collectPlies } from "./opening/tree";
import { FLAGSHIP_ID } from "@/content/opening";
import { buildPrintEditionPdf } from "./print-edition";

describe("print edition", () => {
  it("is a tagged one-page PDF with the résumé name and a declared language", () => {
    const bytes = buildPrintEditionPdf();
    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("%%EOF");
    expect(text).toContain(resumeData.name);
    expect(text).toContain("Graduated");
    expect(text).not.toContain("Graduating");
    expect(text).toContain("/Count 1");
    expect(text).not.toContain("/Count 2");
    expect(text).toContain("/Lang (en-GB)");
    expect(text).toContain("/Marked true");
    expect(text).toContain("/StructTreeRoot");
    expect(text).toContain("/S /H1");
    expect(text).toContain("/S /H2");
    expect(text).toContain("/Title (Anas Tarek Qumhiyeh - Resume)");
    expect(text).not.toContain("\\226");
    expect(text).toContain("-40%");
    expect(text).toContain("-50%");
    expect(text).not.toContain("3-sheet filing");
    expect(text).not.toContain("Photographs real and composed");
    expect(text).not.toContain("a game played since I was a teenager");
    expect(text).toContain("opening-preparation");
    expect(text).toContain("lower-carbon compute");
  });

  it("does not put the chessboard in the reading order", () => {
    const occ = occupancy(positionAfter(collectPlies(FLAGSHIP_ID)));
    expect(occ.d4).toBe("wP");
    const text = new TextDecoder().decode(buildPrintEditionPdf());
    expect(text).not.toContain("% occ d4");
    expect(text).not.toContain("% occ g1");
    expect(text).not.toContain("% occ c4");
    expect(text).not.toContain("5. d4 - the Italian break");
    expect(text).not.toMatch(/% fen-occ/);
  });

  it("prints achievement bullets and a compact stack, not a tool inventory", () => {
    const text = new TextDecoder().decode(buildPrintEditionPdf());
    expect(text).toContain("Authorization and capture");
    expect(text).toContain("separate observation");
    expect(text).toContain("Replaced MATLAB-dependent back-end functionality");
    expect(text).not.toContain("converting paid MATLAB");
    expect(text).toContain("LangGraph");
    expect(text).not.toContain("Flutter");
    expect(text).not.toContain("JQuery");
    expect(text).not.toContain("OracleSQL");
  });

  it("prints the same dates and claims as the résumé source", () => {
    const text = new TextDecoder().decode(buildPrintEditionPdf());
    expect(text).toContain("Graduated May 2026");
    expect(text).not.toMatch(/1 0 0 1 40 -/);
    expect(text).toContain("WAM 82.1");
    expect(text).toContain("3.82");
    for (const job of resumeData.experience) {
      expect(text).toContain(job.period.replace(/[–—]/g, "-"));
    }
    for (const p of resumeData.projects) {
      expect(text).toContain(p.name);
    }
    expect(FEATURED_PROJECT_SLUGS).toContain("veridian");
    expect(text).toContain("Automatic lower-carbon");
    expect(text).toContain("70B-to-3B");
    expect(text).not.toContain("12x inference speedup");
    expect(text).toContain("Monash University");
    expect(text).toContain("Contract Full-stack");
    expect(text).toContain("Solana Megahack 2025");
    expect(text).toContain("Open to");
    expect(text).toContain(SITE_HOST);
    expect(text).toContain(`/URI (mailto:${resumeData.email})`);
    expect(text).toContain(`/URI (${SITE_URL})`);
    expect(text).toContain(`/URI (${SITE_URL}/opening-preparation)`);
    expect(HERO_PROOF).toHaveLength(3);
    expect(POSITIONING.availability).toMatch(/Open to/);
  });
});
