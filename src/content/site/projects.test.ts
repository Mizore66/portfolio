import { describe, expect, it } from "vitest";
import { CLAIMS } from "./claims";
import { EDUCATION } from "./education";
import { IDENTITY } from "./identity";
import { featuredProjects, getClaim, parsePath, pathCounts, workFor } from "./index";
import { LAB_TEASER } from "./lab";
import { FEATURED_SLUGS, PROJECTS } from "./projects";
import { ROLES } from "./roles";
import { SKILLS } from "./skills";

const LEGACY_SLUGS = [
  "veridian",
  "circuitmindai",
  "mirrorfi",
  "multi-agent-graphrag",
  "financial-risk-predictor",
  "distributed-lead-scorer",
  "slm-distillation-engine",
];

describe("projects", () => {
  it("features exactly FaultLine, Gemini Teleportal, CircuitMindAI in order", () => {
    expect(FEATURED_SLUGS).toEqual(["faultline", "gemini-teleportal", "circuitmindai"]);
    expect(featuredProjects().map((p) => p.slug)).toEqual(FEATURED_SLUGS);
    expect(PROJECTS.filter((p) => p.group === "featured").map((p) => p.slug).sort()).toEqual([...FEATURED_SLUGS].sort());
  });
  it("keeps every legacy project URL", () => {
    for (const slug of LEGACY_SLUGS) expect(PROJECTS.some((p) => p.slug === slug), slug).toBe(true);
  });
  it("has unique kebab-case slugs and unique SEO titles", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const titles = PROJECTS.map((p) => p.seo.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
  it("keeps meta descriptions at 160 characters or fewer", () => {
    for (const p of PROJECTS) expect(p.seo.description.length, p.slug).toBeLessThanOrEqual(160);
  });
  it("only references claims that exist", () => {
    for (const p of PROJECTS) if (p.result.claimId) expect(() => getClaim(p.result.claimId!)).not.toThrow();
  });
  it("never attributes the Monash −50% latency to the SLM Distillation Engine", () => {
    const slm = PROJECTS.find((p) => p.slug === "slm-distillation-engine");
    expect(JSON.stringify(slm)).not.toMatch(/50%/);
  });
  it("credits Kai on Gemini Teleportal and the team on MirrorFi", () => {
    expect(PROJECTS.find((p) => p.slug === "gemini-teleportal")?.origin).toBe("Built with Kai");
    expect(PROJECTS.find((p) => p.slug === "mirrorfi")?.origin).toBe("Hackathon team of 6");
  });
});

describe("claim placement", () => {
  it("shows each claim at most once on the front page, so fragment ids stay unique", () => {
    const used = [
      ...ROLES.flatMap((r) => r.claimIds),
      ...PROJECTS.filter((p) => p.group !== "lab").flatMap((p) => (p.result.claimId ? [p.result.claimId] : [])),
      LAB_TEASER.claimId,
    ];
    expect(new Set(used).size).toBe(used.length);
  });
  it("keeps the legacy claim anchors reachable", () => {
    const used = new Set([
      ...ROLES.flatMap((r) => r.claimIds),
      ...PROJECTS.flatMap((p) => (p.result.claimId ? [p.result.claimId] : [])),
    ]);
    for (const id of ["setelDefects", "monashRetrieval", "leadThroughput"]) expect(used.has(id), id).toBe(true);
  });
});

describe("work filter", () => {
  it("parses only known paths", () => {
    expect(parsePath("ml")).toBe("ml");
    expect(parsePath("product")).toBe("product");
    expect(parsePath("devtools")).toBe("devtools");
    expect(parsePath("x")).toBeNull();
    expect(parsePath(undefined)).toBeNull();
  });
  it("filters featured and archive by category", () => {
    const ml = workFor("ml");
    expect([...ml.featured, ...ml.archive].every((p) => p.category === "ml")).toBe(true);
    const all = workFor(null);
    expect(all.featured).toHaveLength(3);
    expect(all.archive.every((p) => p.group === "archive")).toBe(true);
  });
  it("counts projects per path (lab excluded)", () => {
    const counts = pathCounts();
    expect(counts.all).toBe(counts.ml + counts.product + counts.devtools);
    expect(counts.all).toBe(PROJECTS.filter((p) => p.group !== "lab").length);
  });
});

describe("lab teaser", () => {
  it("keeps the honest wording", () => {
    expect(LAB_TEASER.headline).toMatch(/underperformed PeSTO/);
    expect(getClaim(LAB_TEASER.claimId).id).toBe("gateC");
  });
});

describe("en-GB spelling", () => {
  it("uses British spellings across all site content", () => {
    const text = JSON.stringify([CLAIMS, IDENTITY, ROLES, EDUCATION, SKILLS, PROJECTS, LAB_TEASER]).replaceAll(
      "Authorization and capture",
      "",
    );
    expect(text).not.toMatch(/\b(behavior|catalog|authorization|organization|optimize|analyze|color)\b/i);
  });
});
