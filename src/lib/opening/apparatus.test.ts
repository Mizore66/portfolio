import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OPENING_NODES } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { getNode } from "./tree";

const publicDir = join(process.cwd(), "public");

function plateFile(src: string) {
  return join(publicDir, src.replace(/^\//, ""));
}

describe("apparatuses are machines, not shopping lists", () => {
  it("never draws a job or project as tech joined with arrows", () => {
    const petronas = getNode("nf3").figure!;
    expect(petronas.path.map((l) => l.name)).toEqual(["MATLAB", "Python"]);
    expect(petronas.beside?.map((l) => l.name)).toEqual(["MathCAD"]);
    expect(petronas.path.map((l) => l.name)).not.toEqual(petronas.tech);

    const wd = getNode("bc4").figure!;
    expect(wd.runtime).toBe("Docker");
    expect(wd.path.map((l) => l.name)).toEqual(["Next.js", "ASP.NET", "PostgreSQL"]);
    expect(wd.path.map((l) => l.name)).not.toContain("Docker");
    expect(wd.path.map((l) => l.name)).not.toEqual(wd.tech);

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
    expect(veridian.apparatus.path.map((l) => l.name).join()).not.toMatch(/Terraform/);

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
  it("keeps every JPEG on disk and on the scoresheet", () => {
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

    const filed = OPENING_NODES.map((n) => n.plate?.src).filter(Boolean);
    expect(filed.sort()).toEqual(files.slice().sort());

    for (const project of resumeData.projects) {
      expect(existsSync(plateFile(project.plate)), project.slug).toBe(true);
      expect(filed).toContain(project.plate);
    }
  });
});
