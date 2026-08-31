import { describe, expect, it } from "vitest";
import { FLAGSHIP_ID } from "@/content/opening";
import { occupancy, positionAfter } from "./chess/replay";
import { collectPlies } from "./opening/tree";
import { buildPrintEditionPdf } from "./print-edition";
import { resumeData } from "@/lib/data";

describe("print edition", () => {
  it("is a PDF that carries the résumé name", () => {
    const bytes = buildPrintEditionPdf();
    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("%%EOF");
    expect(text).toContain(resumeData.name);
    expect(text).toContain("Graduated");
    expect(text).not.toContain("Graduating");
    expect(text).toContain("/Count 1");
    expect(text).toContain("5. d4 - the Italian break");
    expect(text).toContain("a game played since I was a teenager");
    expect(text).toContain("Photographs real and composed");
    expect(text).toContain("3-sheet filing");
    expect(text).toMatch(/economized/);
    expect(text).toMatch(/\(N\)|\(n\)|\(K\)|\(k\)/);
    expect(text).not.toContain("/Count 2");
  });

  it("diagrams 5. d4 of the Italian, not the starting position", () => {
    const occ = occupancy(positionAfter(collectPlies(FLAGSHIP_ID)));
    expect(occ.d4).toBe("wP");
    expect(occ.g1).toBe("wK");
    expect(occ.c4).toBe("wB");
    expect(occ.f3).toBe("wN");
    expect(occ.d2).toBeUndefined();
    expect(occ.e1).toBeUndefined();
    expect(occ.e2).toBeUndefined();

    const text = new TextDecoder().decode(buildPrintEditionPdf());
    expect(text).toContain("% occ d4 wP");
    expect(text).toContain("% occ g1 wK");
    expect(text).toContain("% occ c4 wB");
    expect(text).not.toContain("% occ d2 wP");
    expect(text).not.toContain("% occ e1 wK");
    expect(text).not.toContain("% occ e2 wP");
  });

  it("prints the same dates and claims as the résumé source", () => {
    const text = new TextDecoder().decode(buildPrintEditionPdf());
    expect(text).toContain("Graduated May 2026");
    expect(text).toContain("WAM 82.1");
    expect(text).toContain("3.82");
    for (const job of resumeData.experience) {
      expect(text).toContain(job.period.replace(/[–—]/g, "-"));
    }
    for (const p of resumeData.projects) {
      expect(text).toContain(p.name);
    }
    expect(text).toContain("Zero-touch ML");
    expect(text).toContain("12x inference speedup");
    expect(text).toContain("Monash University");
    expect(text).toContain("Full-stack");
    expect(text).not.toContain("Seeking");
  });
});
