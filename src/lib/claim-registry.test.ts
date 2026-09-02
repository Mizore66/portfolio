import { describe, expect, it } from "vitest";
import { PROJECT_FIGURES } from "@/content/project-figures";
import { resumeData } from "@/lib/data";
import {
  EVIDENCE_TIER,
  HERO_PROOF,
  METRICS,
  projectEvidence,
  type EvidenceKind,
} from "@/lib/metrics";

const NUMERIC = /(?:\+|-|−)?\d+(?:\.\d+)?(?:%|×|x)|100M|99\.9%|0\.87/;

describe("claim registry", () => {
  it("does not duplicate evidence kind in the note", () => {
    for (const metric of Object.values(METRICS)) {
      if (!("kind" in metric) || !("note" in metric)) continue;
      const kind = metric.kind as EvidenceKind;
      const note = String(metric.note);
      expect(note.toLowerCase().startsWith(`${EVIDENCE_TIER[kind].toLowerCase()} ·`)).toBe(false);
      expect(note.toLowerCase().startsWith("evaluation ·")).toBe(false);
    }
    expect(`${EVIDENCE_TIER.evaluation} · ${METRICS.veridianUptime.note}`).not.toMatch(
      /Evaluation · evaluation/i,
    );
  });

  it("keeps hours-cut only in the lead note, not the hero label", () => {
    expect(HERO_PROOF[2]?.label).toBe("100M events/day");
    expect(HERO_PROOF[2]?.label).not.toMatch(/hours cut/i);
    expect(HERO_PROOF[2]?.note).toMatch(/hours cut to minutes/);
    expect(HERO_PROOF[2]?.note).not.toMatch(/production/i);
  });

  it("labels reused Veridian sheets as illustrations on GraphRAG and SLM", () => {
    const graphrag = resumeData.projects.find((p) => p.slug === "multi-agent-graphrag")!;
    const slm = resumeData.projects.find((p) => p.slug === "slm-distillation-engine")!;
    expect(graphrag.date).toMatch(/Oct 2025/);
    expect(slm.date).toMatch(/Jul 2025/);
    expect(graphrag.patent.filed).toMatch(/Apr\. 2026/);
    expect(slm.patent.filed).toMatch(/Apr\. 2026/);
    expect(graphrag.patent.dateKind).toBe("illustration");
    expect(slm.patent.dateKind).toBe("illustration");
    expect(PROJECT_FIGURES["multi-agent-graphrag"].dateKind).toBe("illustration");
    expect(PROJECT_FIGURES["slm-distillation-engine"].dateKind).toBe("illustration");
  });

  it("does not promote secondary numbers as the exhibit result", () => {
    const risk = resumeData.projects.find((p) => p.slug === "financial-risk-predictor")!;
    const slm = resumeData.projects.find((p) => p.slug === "slm-distillation-engine")!;
    const lead = resumeData.projects.find((p) => p.slug === "distributed-lead-scorer")!;
    expect(projectEvidence(risk).result).toBe(METRICS.riskAuc.display);
    expect(projectEvidence(risk).result).not.toMatch(/15%/);
    expect(projectEvidence(slm).result).toBe(METRICS.slmInference.display);
    expect(lead.bullets.join(" ")).not.toMatch(/zero tape lost/i);
    expect(slm.bullets.join(" ")).not.toMatch(/98%/);
    expect(slm.bullets.join(" ")).not.toMatch(/−40%/);
    expect(risk.bullets.join(" ")).not.toMatch(/−30%/);
  });

  it("registers every numeric exhibit impact in the ledger", () => {
    for (const project of resumeData.projects) {
      if (!NUMERIC.test(project.impact)) continue;
      const card = projectEvidence(project);
      expect(card.result.length, project.slug).toBeGreaterThan(3);
      expect(card.environment || card.baseline || card.method || card.sample, project.slug).toBeTruthy();
    }
  });

  it("names Kind values in plain English", () => {
    expect(EVIDENCE_TIER.evaluation).toBe("Controlled evaluation");
    expect(EVIDENCE_TIER.pipeline).toBe("Capacity benchmark");
    expect(EVIDENCE_TIER.benchmark).toBe("Controlled benchmark");
    expect(EVIDENCE_TIER.production).toBe("Production");
  });
});
