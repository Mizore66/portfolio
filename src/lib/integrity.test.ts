import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import {
  PAPER_HREF,
  RETRIEVAL_SPLIT,
  projectRole,
  projectSourceLabel,
} from "@/lib/metrics";
import { META_DESCRIPTION } from "@/lib/person";

describe("document integrity", () => {
  it("lists the paper plate on the sitemap", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/opening-preparation"))).toBe(true);
    expect(PAPER_HREF).toBe("/opening-preparation");
    expect(BROADSHEET.paperHref).toBe("/opening-preparation");
  });

  it("gives the 404 a title that is not the homepage brand", () => {
    const src = readFileSync(join(process.cwd(), "src/app/not-found.tsx"), "utf8");
    expect(src).toMatch(/title: "Correction — A\. T\. Qumhiyeh"/);
    expect(src).toMatch(/description: "The page you requested was a misprint/);
    expect(src).not.toMatch(/Anas T\. Qumhiyeh — Opening Preparation/);
  });

  it("keeps GraphRAG +35 and Monash +45 as two filings", () => {
    expect(RETRIEVAL_SPLIT).toMatch(/\+45%/);
    expect(RETRIEVAL_SPLIT).toMatch(/\+35%/);
    expect(RETRIEVAL_SPLIT).toMatch(/different corpus/);
    expect(RETRIEVAL_SPLIT).not.toMatch(/after the Monash contract iteration/i);
    const graphrag = resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")!;
    expect(graphrag.impact).toMatch(/^\+35%/);
    expect("split" in graphrag && graphrag.split).toBe(RETRIEVAL_SPLIT);
  });

  it("labels source and role from filings, never a team size", () => {
    const circuit = resumeData.projects.find((p) => p.slug === "circuitmindai")!;
    const veridian = resumeData.projects.find((p) => p.slug === "veridian")!;
    expect(projectSourceLabel(circuit.github)).toBe("Public repository");
    expect(projectSourceLabel(veridian.github)).toBe("No public repository");
    expect(projectRole(circuit)).toBe("Sole builder");
    expect(projectRole({ slug: "mirrorfi", contextLabel: "Grand Prize, Solana Megahack 2025" })).toBe(
      "Hackathon builder",
    );
    expect(projectRole({ slug: "slm-distillation-engine" })).toBe("Laboratory experiment");
  });

  it("does not ship JQuery, OracleSQL, or A-prefixed framework drop-caps", () => {
    const blob = JSON.stringify(resumeData);
    expect(blob).not.toMatch(/JQuery/);
    expect(blob).not.toMatch(/OracleSQL/);
    expect(blob).toMatch(/jQuery/);
    expect(blob).toMatch(/Oracle Database/);
    expect(blob).toMatch(/NestJS/);
    const exhibit = readFileSync(join(process.cwd(), "src/app/projects/[slug]/page.tsx"), "utf8");
    expect(exhibit).not.toMatch(/drop-cap/);
  });

  it("distils QLoRA as a method, not a slogan, and drops undefined real-time", () => {
    const slm = resumeData.projects.find((p) => p.slug === "slm-distillation-engine")!;
    expect("why" in slm && slm.why).toMatch(
      /I used QLoRA to distil traces from a 70B teacher into a deployable 3B student/,
    );
    const circuit = resumeData.projects.find((p) => p.slug === "circuitmindai")!;
    expect(circuit.impact).not.toMatch(/real-time/i);
    expect(circuit.impact).toMatch(/PCB fault detection/);
  });

  it("keeps the homepage meta description handwritten", () => {
    expect(META_DESCRIPTION).toMatch(/annotated career/);
    expect(META_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });
});
