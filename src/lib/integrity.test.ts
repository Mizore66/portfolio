import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { BROADSHEET, OPENING_NODES } from "@/content/opening";
import { resumeData } from "@/lib/data";
import {
  COLOPHON_HREF,
  PAPER_HREF,
  RETRIEVAL_SPLIT,
  projectEvidence,
  projectRole,
  projectSourceLabel,
} from "@/lib/metrics";
import { getNode } from "@/lib/opening/tree";
import { META_DESCRIPTION } from "@/lib/person";

describe("document integrity", () => {
  it("lists the paper plate on the sitemap", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/opening-preparation"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/colophon"))).toBe(true);
    expect(PAPER_HREF).toBe("/opening-preparation");
    expect(BROADSHEET.paperHref).toBe("/opening-preparation");
    expect(COLOPHON_HREF).toBe("/colophon");
  });

  it("gives the 404 a title that is not the homepage brand", () => {
    const src = readFileSync(join(process.cwd(), "src/app/not-found.tsx"), "utf8");
    expect(src).toMatch(/title: "Correction — A\. T\. Qumhiyeh"/);
    expect(src).toMatch(/description: "The page you requested was a misprint/);
    expect(src).not.toMatch(/Anas T\. Qumhiyeh — Opening Preparation/);
  });

  it("gives the colophon a title that is not the homepage brand", () => {
    const src = readFileSync(join(process.cwd(), "src/app/colophon/page.tsx"), "utf8");
    expect(src).toMatch(/title: "How this paper was set — A\. T\. Qumhiyeh"/);
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
    const card = projectEvidence(graphrag);
    expect(card.baseline).toMatch(/Vector-only/);
    expect(card.sample).toMatch(/not filed/);
  });

  it("labels source and role from filings, never a team size", () => {
    const circuit = resumeData.projects.find((p) => p.slug === "circuitmindai")!;
    const veridian = resumeData.projects.find((p) => p.slug === "veridian")!;
    expect(projectSourceLabel(circuit.github)).toBe("Public repository");
    expect(projectSourceLabel(veridian.github)).toBe("Private project archive");
    expect(projectRole(circuit)).toBe("Sole builder — architecture, implementation, and evaluation.");
    expect(projectRole({ slug: "mirrorfi", contextLabel: "Grand Prize, Solana Megahack 2025" })).toBe(
      "Hackathon builder — architecture, implementation, and demo.",
    );
    expect(projectRole({ slug: "slm-distillation-engine" })).toBe(
      "Laboratory experiment — design, training, and evaluation.",
    );
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

  it("gives every exhibit a unique title, meta, and date", () => {
    const titles = resumeData.projects.map((p) => `${p.name} — ${p.subtitle}`);
    const metas = resumeData.projects.map((p) => p.meta);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(metas).size).toBe(metas.length);
    for (const p of resumeData.projects) {
      expect(p.date, p.slug).toMatch(/20\d{2}/);
      expect(p.meta.length, p.slug).toBeGreaterThan(40);
    }
  });

  it("keeps the measurement tagline on the masthead, not the scoresheet identity nodes", () => {
    expect(BROADSHEET.tagline).toMatch(/survive measurement/);
    expect(getNode("start").fact).not.toMatch(/survive measurement/);
    expect(getNode("e5").fact).not.toMatch(/survive measurement/);
    expect(getNode("start").fact).not.toMatch(/Software engineer focused on ML/);
    expect(getNode("e5").fact).not.toMatch(/Software engineer focused on ML/);
    expect(BROADSHEET.classified).not.toMatch(/Open to early-career/);
    expect(BROADSHEET.closer).not.toMatch(/next line I want to play/);
  });

  it("resolves scoresheet artifact hrefs to known routes or public URLs", () => {
    const known = new Set([
      "/",
      "/opening-preparation",
      "/print-edition",
      "/colophon",
      "/lab/learned-evaluator",
      ...resumeData.projects.map((p) => `/projects/${p.slug}`),
    ]);
    for (const node of OPENING_NODES) {
      for (const artifact of node.artifacts ?? []) {
        const href = artifact.href;
        if (href.startsWith("mailto:") || href.startsWith("https://")) continue;
        const path = href.split("?")[0]?.split("#")[0] ?? href;
        expect(known.has(path), `${node.id} → ${href}`).toBe(true);
      }
    }
  });

  it("does not repeat the hero availability line in Contact", () => {
    const src = readFileSync(join(process.cwd(), "src/components/opening/ContactBand.tsx"), "utf8");
    expect(src).toMatch(/contactHed/);
    expect(src).not.toMatch(/POSITIONING\.availability/);
  });
});
