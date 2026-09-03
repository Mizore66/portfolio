import { describe, expect, it } from "vitest";
import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { PHASE2_MATCH } from "@/lib/chess/phase2";

describe("learned evaluator lab article", () => {
  it("restates the terminated Gate C SPRT without inventing a rematch of this net", () => {
    const blob = `${LAB_ARTICLE.hypothesis} ${LAB_ARTICLE.experiment} ${LAB_ARTICLE.failed} ${LAB_ARTICLE.learned}`;
    expect(LAB_ARTICLE.result).toContain(String(PHASE2_MATCH.elo));
    expect(blob).toMatch(/H0/);
    expect(blob).toMatch(/128 games/);
    expect(blob).not.toMatch(/unterminated|inconclusive/);
    expect(blob).not.toMatch(/what I'd test next/i);
    expect(blob).not.toMatch(/should outperform/i);
    expect(LAB_ARTICLE.learned).toMatch(/A loss at the spec cap is still a result/);
    expect(LAB_ARTICLE.learned).toMatch(/Do not rematch this net/);
    expect(LAB_ARTICLE.resultJoke).toMatch(/Black was unconvinced/);
    expect(LAB_ARTICLE.failed).not.toMatch(/RESULT: REJECTED/);
    expect(LAB_ARTICLE.href).toBe("/lab/learned-evaluator");
    expect(LAB_ARTICLE.filed).toContain("2026-08-29");
    expect(LAB_ARTICLE.filed).toMatch(/^Filed /);
    expect(LAB_ARTICLE.datePublished).toBe("2026-08-29");
    expect(LAB_ARTICLE.filed).not.toMatch(/Published March/i);
  });
});
