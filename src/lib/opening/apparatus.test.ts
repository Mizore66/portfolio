import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES, VERIDIAN_PRESS } from "@/content/figures";
import { OPENING_NODES } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { GLYPH_IDS } from "@/lib/opening/types";
import { getNode } from "./tree";

const publicDir = join(process.cwd(), "public");

function plateFile(src: string) {
  return join(publicDir, src.replace(/^\//, ""));
}

const SCORESHEET_FIGURES = ["e4", "nf3", "nc6", "bc4", "oo"] as const;

describe("patent apparatuses are data, not art", () => {
  it("caps every figure at 6–12 parts with confirmed|presumed tags and a directional flow", () => {
    const specs = [...Object.values(FIGURES), VERIDIAN_PRESS];
    for (const spec of specs) {
      expect(spec.parts.length, `FIG. ${spec.fig}`).toBeGreaterThanOrEqual(6);
      expect(spec.parts.length, `FIG. ${spec.fig}`).toBeLessThanOrEqual(12);
      expect(spec.review.status).toBe("validated");
      expect(spec.flow.length).toBeGreaterThan(0);
      const nums = spec.parts.map((p) => p.n);
      expect(nums).toEqual([...nums].sort((a, b) => a - b));
      expect(new Set(nums).size).toBe(nums.length);
      for (const part of spec.parts) {
        expect(GLYPH_IDS).toContain(part.glyph);
        expect(part.confidence === "confirmed" || part.confidence === "presumed").toBe(true);
        expect(part.label).toMatch(/^[A-Z][A-Z \-]*$/);
        expect(part.mapsTo.length).toBeGreaterThan(0);
      }
      for (const n of spec.flow) {
        expect(nums).toContain(n);
      }
    }
  });

  it("keeps employer figures generic — no internal names, only public metrics", () => {
    const banned = /petronas|setel|western digital|gitlab|next\.js|asp\.net|postgresql|nestjs|kubernetes|mathcad/i;
    for (const id of ["nf3", "nc6", "bc4"] as const) {
      const spec = FIGURES[id];
      const drawn = spec.parts.map((p) => `${p.label} ${p.mapsTo}`).join(" ");
      expect(drawn, id).not.toMatch(banned);
    }
    expect(FIGURES.nf3.parts.some((p) => p.mapsTo.includes("−20%"))).toBe(true);
    expect(FIGURES.nc6.parts.some((p) => p.mapsTo.includes("92.5%"))).toBe(true);
    expect(FIGURES.bc4.parts.some((p) => p.mapsTo.includes("<100 ms"))).toBe(true);
    expect(FIGURES.bc4.parts.filter((p) => p.glyph === "key")).toHaveLength(3);
  });

  it("files scoresheet figures on the approved nodes and never beside a plate", () => {
    for (const id of SCORESHEET_FIGURES) {
      const n = getNode(id);
      expect(n.figure?.fig, id).toBe(FIGURES[id].fig);
      expect(n.plate, id).toBeUndefined();
    }
    expect(getNode("d4").figure).toBeUndefined();
    expect(getNode("d4").plate).toBeTruthy();
    for (const n of OPENING_NODES) {
      expect(Boolean(n.figure) && Boolean(n.plate), n.id).toBe(false);
    }
  });
});

describe("exhibit machines stay machines", () => {
  it("never draws a project as tech joined with arrows", () => {
    for (const project of resumeData.projects) {
      const names = [
        ...project.apparatus.path.map((l) => l.name),
        ...(project.apparatus.forks ?? []).map((l) => l.name),
        ...(project.apparatus.beside ?? []).map((l) => l.name),
      ];
      expect(names, project.slug).not.toEqual(project.tech);
      expect(project.apparatus.path.length, project.slug).toBeGreaterThan(0);
    }
  });

  it("keeps intercepted infra and interpretability off the request path", () => {
    const veridian = resumeData.projects.find((p) => p.slug === "veridian")!;
    expect(veridian.apparatus.path.map((l) => l.name)).toEqual([
      "GitLab Duo + MCP",
      "Vertex AI",
    ]);
    expect(veridian.apparatus.runtime).toBe("Cloud Run");
    expect(veridian.apparatus.beside?.map((l) => l.name)).toEqual(["BigQuery", "Python"]);
    expect(veridian.patent?.fig).toBe(6);
    expect(veridian.patent?.parts.length).toBeGreaterThanOrEqual(6);

    const circuit = resumeData.projects.find((p) => p.slug === "circuitmindai")!;
    expect(circuit.apparatus.path.map((l) => l.name)).toEqual(["Next.js", "Express"]);
    expect(circuit.apparatus.forks?.map((l) => l.name)).toEqual(["Bedrock Nova", "OpenSearch"]);
    expect(circuit.apparatus.beside?.map((l) => l.name)).toEqual(["GitHub Actions"]);

    const risk = resumeData.projects.find((p) => p.slug === "financial-risk-predictor")!;
    expect(risk.apparatus.path.map((l) => l.name)).toEqual([
      "Kafka",
      "LightGBM / XGBoost",
      "BentoML",
    ]);
    expect(risk.apparatus.beside?.map((l) => l.name)).toEqual(["SHAP"]);
    expect(risk.apparatus.path.map((l) => l.name)).not.toContain("TensorFlow");
  });
});

describe("plate photographs", () => {
  it("keeps every JPEG on disk, sourced, and on the scoresheet", () => {
    const files = [
      "/plates/plate-veridian.jpg",
      "/plates/plate-circuitmind.jpg",
      "/plates/plate-mirrorfi.jpg",
      "/plates/plate-graphrag.jpg",
      "/plates/plate-risk.jpg",
      "/plates/plate-leads.jpg",
      "/plates/plate-slm.jpg",
    ];
    for (const src of files) {
      expect(existsSync(plateFile(src)), src).toBe(true);
    }

    const sources = readFileSync(join(publicDir, "plates/SOURCES.md"), "utf8");
    for (const src of files) {
      expect(sources).toContain(src.replace("/plates/", ""));
    }

    const filed = OPENING_NODES.map((n) => n.plate?.src).filter(Boolean);
    expect(filed.sort()).toEqual(files.slice().sort());

    for (const project of resumeData.projects) {
      expect(existsSync(plateFile(project.plate)), project.slug).toBe(true);
      expect(filed).toContain(project.plate);
    }
  });
});
