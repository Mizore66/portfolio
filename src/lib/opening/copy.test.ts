import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resumeData } from "@/lib/data";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { META_DESCRIPTION, personJsonLd, PERSON_ALT_NAME, PERSON_NAME } from "@/lib/person";
import { getNode } from "@/lib/opening/tree";

const BANNED =
  /high-performance|intelligent hybrid|intuitive no-code|GenAI-powered|factual enterprise data|scalable REST/i;

describe("exhibit register", () => {
  it("keeps exhibit copy in the annotator voice, without adjectives without receipts", () => {
    const blob = resumeData.projects
      .map((p) => `${p.description}\n${p.bullets.join("\n")}\n${p.subtitle}`)
      .join("\n");
    expect(blob).not.toMatch(BANNED);
    expect(resumeData.projects.find((p) => p.slug === "circuitmindai")?.description).toMatch(
      /Nova Pro reads the copper/,
    );
    expect(resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")?.description).toMatch(
      /university's policy corpus/,
    );
    expect(resumeData.projects.find((p) => p.slug === "circuitmindai")?.tech[0]).toBe("Next.js");
    expect(resumeData.projects.find((p) => p.slug === "veridian")?.tech[0]).toBe("Python");
    expect(resumeData.projects.find((p) => p.slug === "slm-distillation-engine")?.tech[0]).toBe("PyTorch");
    expect(resumeData.projects.find((p) => p.slug === "distributed-lead-scorer")?.tech[0]).toBe("PyTorch DDP");
    expect(resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")?.bullets[0]).toMatch(/^\+35%/);
    expect(resumeData.projects.find((p) => p.slug === "mirrorfi")?.description).not.toMatch(/intuitive/);
  });

  it("names owners on the numbers that survive the demo", () => {
    expect(getNode("exd4").fact).toMatch(/Monash GraphRAG \+45%/);
    expect(getNode("exd4").fact).toMatch(/Veridian 99\.9%/);
    expect(getNode("closed").fact).toMatch(/\+35%/);
    expect(getNode("closed").fact).not.toMatch(/\+45%/);
  });
});

describe("SEO identity", () => {
  it("hands machines the full name and a handwritten meta description", () => {
    const ld = personJsonLd();
    expect(ld.name).toBe(PERSON_NAME);
    expect(ld.alternateName).toBe(PERSON_ALT_NAME);
    expect(META_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(META_DESCRIPTION).toMatch(/annotated career of Anas T\. Qumhiyeh/);
  });
});

describe("image sizes", () => {
  it("pins role plates to 184px at desktop, not a 92vw 4K candidate", () => {
    expect(IMAGE_SIZES.rolePlate).toContain("184px");
    expect(IMAGE_SIZES.rolePlate).toContain("45vw");
    expect(IMAGE_SIZES.patentSheet).toContain("640px");
  });
});

describe("bfcache", () => {
  it("registers no unload listeners in the opening app", () => {
    const src = readFileSync(join(process.cwd(), "src/components/opening/OpeningApp.tsx"), "utf8");
    expect(src).not.toMatch(/onunload|beforeunload|addEventListener\(\s*["']unload/);
  });
});
