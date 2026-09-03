import type { CmsClaim } from "@/lib/cms/types";

const OWNER_PROJECT: Record<string, { slug: string; label: string }> = {
  Veridian: { slug: "veridian", label: "Veridian exhibit" },
  "Multi-Agent GraphRAG (project)": { slug: "multi-agent-graphrag", label: "GraphRAG exhibit" },
  "Distributed Lead Scorer": { slug: "distributed-lead-scorer", label: "Lead Scorer exhibit" },
  "SLM Distillation Engine": { slug: "slm-distillation-engine", label: "SLM exhibit" },
  "Financial Risk Predictor": { slug: "financial-risk-predictor", label: "Financial Risk exhibit" },
  GateC: { slug: "", label: "Laboratory" },
  "Gate C": { slug: "", label: "Laboratory" },
};

export type ClaimConsumer = { label: string; href: string };

export function claimConsumers(claim: CmsClaim): ClaimConsumer[] {
  const rows: ClaimConsumer[] = [];
  if (claim.surfaces.includes("home")) {
    rows.push({ label: "Homepage proof card", href: "/#proof" });
  }
  if (claim.surfaces.includes("opening")) {
    rows.push({ label: "Opening Preparation", href: "/opening-preparation" });
  }
  if (claim.surfaces.includes("resume")) {
    rows.push({ label: "Generated résumé", href: "/print-edition" });
  }
  if (claim.surfaces.includes("lab") || claim.id === "gateC") {
    rows.push({ label: "Laboratory", href: "/lab/learned-evaluator" });
  }
  if (claim.linkedProject) {
    rows.push({
      label: `Exhibit · ${claim.linkedProject}`,
      href: `/projects/${claim.linkedProject}`,
    });
  } else {
    const linked = OWNER_PROJECT[claim.owner];
    if (linked) {
      rows.push({
        label: linked.label,
        href: linked.slug ? `/projects/${linked.slug}` : "/lab/learned-evaluator",
      });
    } else if (claim.surfaces.includes("exhibit")) {
      rows.push({ label: "Linked exhibit", href: "/#work" });
    }
  }
  const unique = new Map(rows.map((row) => [row.href, row]));
  return [...unique.values()];
}
