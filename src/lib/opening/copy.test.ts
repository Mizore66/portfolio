import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { META_DESCRIPTION, personJsonLd, projectJsonLd, websiteJsonLd, labArticleJsonLd, PERSON_ALT_NAME, PERSON_NAME } from "@/lib/person";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { getNode } from "@/lib/opening/tree";

const BANNED =
  /high-performance|intelligent hybrid|intuitive no-code|GenAI-powered|factual enterprise data|scalable REST/i;

describe("exhibit register", () => {
  it("keeps exhibit copy in the annotator voice, without adjectives without receipts", () => {
    const blob = resumeData.projects
      .map((p) => `${p.description}\n${p.bullets.join("\n")}\n${p.subtitle}\n${p.purpose}\n${"why" in p ? p.why : ""}`)
      .join("\n");
    expect(blob).not.toMatch(BANNED);
    expect(resumeData.projects.find((p) => p.slug === "circuitmindai")?.description).toMatch(
      /Nova Pro reads the copper/,
    );
    expect(resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")?.description).toMatch(
      /handbook and policy archive/,
    );
    expect(resumeData.projects.find((p) => p.slug === "circuitmindai")?.tech[0]).toBe("Next.js");
    expect(resumeData.projects.find((p) => p.slug === "veridian")?.tech[0]).toBe("Python");
    expect(resumeData.projects.find((p) => p.slug === "slm-distillation-engine")?.tech[0]).toBe("PyTorch");
    expect(resumeData.projects.find((p) => p.slug === "distributed-lead-scorer")?.tech[0]).toBe("PyTorch DDP");
    expect(resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")?.bullets[0]).toMatch(/^\+35%/);
    expect(resumeData.projects.find((p) => p.slug === "mirrorfi")?.description).not.toMatch(/intuitive/);
  });

  it("does not print Monash +45% on the GraphRAG exhibit", () => {
    const project = resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")!;
    const fig = `${project.patent.review.notes} ${project.patent.parts.map((p) => p.mapsTo).join(" ")}`;
    expect(fig).toMatch(/\+35%/);
    expect(fig).not.toMatch(/\+45%/);
    expect(project.impact).toMatch(/^\+35%/);
    expect(project.meta).not.toMatch(/\+45%/);
  });

  it("names owners on the numbers that survive the demo", () => {
    expect(getNode("exd4").fact).toMatch(/Monash GraphRAG \+45%/);
    expect(getNode("exd4").fact).toMatch(/Veridian 99\.9% observed uptime/);
    expect(getNode("oo").fact).toMatch(/Veridian Cloud Run evaluation: 99\.9% observed uptime/);
    expect(getNode("closed").fact).toMatch(/\+35%/);
    expect(getNode("closed").fact).not.toMatch(/\+45%/);
  });
});

describe("SEO identity", () => {
  it("hands machines the full name and a handwritten meta description", () => {
    const ld = personJsonLd();
    expect(ld.name).toBe(PERSON_NAME);
    expect(ld.alternateName).toBe(PERSON_ALT_NAME);
    expect(ld.alumniOf).toEqual({ "@type": "CollegeOrUniversity", name: "Monash University" });
    expect(ld.sameAs).toContain("https://github.com/Mizore66");
    expect(ld.sameAs).toContain("https://linkedin.com/in/anasqumhiyeh");
    expect(META_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(META_DESCRIPTION).toMatch(/annotated career of Anas T\. Qumhiyeh/);
    expect(META_DESCRIPTION).toMatch(/payment, laboratory, and retrieval/);
  });

  it("also hands machines a WebSite node", () => {
    const site = websiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(site.name).toBe("Opening Preparation");
    expect(site.author.name).toBe(PERSON_NAME);
  });

  it("hands machines a CreativeWork or source node per exhibit", () => {
    const circuit = resumeData.projects.find((p) => p.slug === "circuitmindai")!;
    const veridian = resumeData.projects.find((p) => p.slug === "veridian")!;
    const src = projectJsonLd(circuit);
    const work = projectJsonLd(veridian);
    expect(src["@type"]).toBe("SoftwareSourceCode");
    expect("codeRepository" in src ? src.codeRepository : undefined).toBe(circuit.github);
    expect(src.name).toMatch(/CircuitMindAI —/);
    expect(work["@type"]).toBe("CreativeWork");
    expect(work).not.toHaveProperty("codeRepository");
    expect(work.name).toMatch(/Veridian —/);
    expect("dateCreated" in work ? work.dateCreated : undefined).toBe("2026-04");
  });

  it("hands machines an Article node for the lab report", () => {
    const article = labArticleJsonLd();
    expect(article["@type"]).toBe("Article");
    expect(article.headline).toMatch(/lost −143\.1 ±40\.5 Elo/);
    expect(article.datePublished).toBe("2026-08-29");
    expect(article.url).toMatch(/\/lab\/learned-evaluator$/);
  });

  it("writes a per-exhibit meta description, not a cloned dek", () => {
    for (const p of resumeData.projects) {
      expect(p.meta.length, p.slug).toBeGreaterThan(40);
      expect(p.meta.length, p.slug).toBeLessThanOrEqual(160);
      expect(p.meta, p.slug).not.toBe(p.description);
      expect(p.meta, p.slug).not.toMatch(BANNED);
    }
    expect(resumeData.projects.find((p) => p.slug === "veridian")?.meta).toMatch(/carbon ledger/);
    const graphrag = resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")!;
    expect("why" in graphrag && graphrag.why).toMatch(/walk the graph/);
    expect(resumeData.projects.find((p) => p.slug === "veridian")?.why).toMatch(/Terraform change is read/);
    expect(resumeData.projects.find((p) => p.slug === "slm-distillation-engine")?.why).toMatch(
      /I used QLoRA to distil traces from a 70B teacher into a deployable 3B student/,
    );
    expect(BROADSHEET.exhibitHost).toMatch(/no live host to sleep/);
    expect(BROADSHEET.exhibitGithub).toMatch(/GitHub is blocked/);
  });

  it("points Repository only at a named source, never the bare profile", () => {
    expect(resumeData.projects.find((p) => p.slug === "circuitmindai")?.github).toBe(
      "https://github.com/Mizore66/CircuitMindAI",
    );
    expect(resumeData.projects.find((p) => p.slug === "mirrorfi")?.github).toBe(
      "https://github.com/Mizore66/MirrorFi",
    );
    for (const p of resumeData.projects) {
      expect(p.github, p.slug).not.toMatch(/github\.com\/Mizore66\/?$/);
    }
  });

  it("lists the lab and every exhibit on the sitemap", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(robots().sitemap).toMatch(/sitemap\.xml/);
    expect(urls.some((u) => u.endsWith("/lab/learned-evaluator"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/opening-preparation"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/colophon"))).toBe(true);
    for (const p of resumeData.projects) {
      expect(urls.some((u) => u.endsWith(`/projects/${p.slug}`)), p.slug).toBe(true);
    }
    const map = await sitemap();
    const veridian = map.find((e) => e.url.endsWith("/projects/veridian"));
    expect(veridian?.lastModified instanceof Date && veridian.lastModified.toISOString().startsWith("2026-04")).toBe(
      true,
    );
    const lab = map.find((e) => e.url.endsWith("/lab/learned-evaluator"));
    expect(lab?.lastModified instanceof Date && lab.lastModified.toISOString().startsWith("2026-08-29")).toBe(true);
  });
});

describe("image sizes", () => {
  it("pins role plates to 184px at desktop, not a 92vw 4K candidate", () => {
    expect(IMAGE_SIZES.rolePlate).toContain("184px");
    expect(IMAGE_SIZES.rolePlate).toContain("45vw");
    expect(IMAGE_SIZES.patentSheet).toContain("640px");
  });

  it("does not offer a 1920w device breakpoint", () => {
    const src = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(src).not.toMatch(/1920/);
    expect(src).not.toMatch(/3840/);
  });
});

describe("bfcache", () => {
  it("registers no unload listeners in the opening app", () => {
    const src = readFileSync(join(process.cwd(), "src/components/opening/OpeningApp.tsx"), "utf8");
    expect(src).not.toMatch(/onunload|beforeunload|addEventListener\(\s*["']unload/);
  });

  it("does not ship a custom cursor or disable selection on copyable text", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).not.toMatch(/cursor:\s*url\(/);
    expect(css).not.toMatch(/user-select:\s*none/);
  });
});

describe("quiz and glass-case copy", () => {
  it("keeps the puzzle and the engine in the annotator voice", () => {
    const puzzle = getNode("nf6").puzzle;
    expect(puzzle?.hit).toMatch(/found over the board/);
    expect(puzzle?.miss).toMatch(/The break was d4/);
    expect(puzzle?.miss).toMatch(/— Ed\./);
    expect(BROADSHEET.engineDown).toMatch(/trust the annotator/);
    expect(BROADSHEET.weightsError).toMatch(/learned packet did not arrive/);
    expect(BROADSHEET.weightsPending).toMatch(/handcrafted holds the line/);
    expect(BROADSHEET.searching).toMatch(/going to press/);
    expect(BROADSHEET.settling).toMatch(/settling/);
  });
});

describe("canonical desk facts", () => {
  it("does not let Opening Preparation redefine the Petronas migration", () => {
    const node = getNode("nf3");
    const blob = `${node.fact}\n${node.commentary}\n${node.clipping?.headline}`;
    expect(blob).toMatch(/Replaced MATLAB-dependent back-end functionality with Python packages/);
    expect(blob).toMatch(/post-release acceptance cases/);
    expect(blob).not.toMatch(/converting paid MATLAB licences/i);
    expect(blob).not.toMatch(/tests that proved it/i);
    expect(node.clipping?.headline).toBe("PETRONAS TAKES ON SOFTWARE ENGINEERING INTERN");
  });
});
