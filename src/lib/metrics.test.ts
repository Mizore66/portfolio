import { describe, expect, it } from "vitest";
import { PROJECT_FIGURES } from "@/content/project-figures";
import { resumeData } from "@/lib/data";
import { FEATURED_PROJECT_SLUGS, HERO_DESKS, HERO_PROOF, METRICS } from "@/lib/metrics";
import { getNode } from "@/lib/opening/tree";

describe("measured claims have one owner each", () => {
  it("keeps Monash +45% off the GraphRAG exhibit figure", () => {
    const fig = PROJECT_FIGURES["multi-agent-graphrag"];
    const blob = `${fig.review.notes} ${fig.parts.map((p) => p.mapsTo).join(" ")} ${fig.function}`;
    expect(blob).toMatch(/\+35%/);
    expect(blob).not.toMatch(/\+45%/);
    expect(fig.parts.find((p) => p.label === "GAUGE")?.mapsTo).toBe(METRICS.graphragRetrieval.gauge);
  });

  it("keeps the contract +45% on the job line and the scoresheet method node", () => {
    const job = resumeData.experience.find((e) => e.company === "Monash University");
    expect(job?.impact).toBe(METRICS.monashRetrieval.impact);
    expect(job?.bullets.join(" ")).toMatch(/\+45%/);
    expect(job?.bullets.join(" ")).not.toMatch(/\+35%/);
    expect(getNode("exd4").fact).toContain(METRICS.monashRetrieval.display);
    expect(getNode("closed").fact).toContain(METRICS.graphragRetrieval.display);
    expect(getNode("closed").fact).not.toMatch(/\+45%/);
  });

  it("spells Full-stack the same way on jobs and the scoresheet", () => {
    expect(resumeData.experience.map((e) => e.title).join(" ")).not.toMatch(/Fullstack|Full Stack/);
    expect(resumeData.experience.some((e) => e.title.includes("Full-stack"))).toBe(true);
    expect(getNode("bc4").fact).toMatch(/Full-stack Engineer/);
    expect(getNode("bc4").scanTitle).toMatch(/Western Digital — Full-stack Engineer/);
  });

  it("names Monash on the GraphRAG contract", () => {
    expect(resumeData.experience[0]?.company).toBe("Monash University");
  });

  it("features three flagship exhibits", () => {
    expect(FEATURED_PROJECT_SLUGS).toEqual(["veridian", "circuitmindai", "multi-agent-graphrag"]);
  });

  it("keeps the hero to three proof points and named desks", () => {
    expect(HERO_PROOF).toHaveLength(3);
    expect(HERO_PROOF[0]?.label).toBe(METRICS.setelDefects.display);
    expect(HERO_PROOF[0]?.kind).toBe("production");
    expect(HERO_PROOF[2]?.kind).toBe("pipeline");
    expect(HERO_PROOF.map((p) => p.label).join(" ")).not.toMatch(/12×/);
    expect(HERO_DESKS).toEqual(["Setel", "Western Digital", "Petronas"]);
  });

  it("does not let pipeline throughput masquerade as production", () => {
    expect(METRICS.leadThroughput.kind).toBe("pipeline");
    expect(METRICS.setelDefects.kind).toBe("production");
    expect(METRICS.gateC.kind).toBe("benchmark");
    expect(METRICS.monashRetrieval.kind).toBe("evaluation");
    expect(METRICS.graphragRetrieval.kind).toBe("evaluation");
  });

  it("keeps Setel's headline as production defects, coverage as supporting", () => {
    const job = resumeData.experience.find((e) => e.company === "Setel");
    expect(job?.impact).toBe(METRICS.setelDefects.display);
    expect(job?.bullets.join(" ")).toMatch(/92\.5%/);
  });
});
