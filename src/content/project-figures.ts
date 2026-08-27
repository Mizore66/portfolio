import type { ApparatusSpec } from "@/lib/opening/types";

/** Overlay percents are of the engraving box. Furniture is HTML/SVG around it. */
const SHEET = { w: 720, h: 540 };
const ENGRAVING = { width: 1400, height: 1050 };

/**
 * Project patents. Domain-literal machines whose stages follow the
 * Reviewer-validated architecture in flow order. The six role/education
 * sheets in figures.ts stay frozen.
 */
export const CIRCUITMIND_LINE: ApparatusSpec = {
  fig: 7,
  move: "3…Bc5",
  function: "INSPECTING PRINTED CIRCUITS",
  filed: "Mar. 2026",
  viewBox: SHEET,
  layout: "elevation",
  flow: [1, 2, 3, 4],
  engraving: { src: "/figures/fig-circuitmind.webp", ...ENGRAVING },
  review: {
    status: "validated",
    notes:
      "Architecture 1:1. Hopper=Next.js UI; belt=Express API; loupe station=Bedrock Nova (vision+voice); pigeonholes=OpenSearch; stamp beside the line=GitHub Actions; bedplate=ECS Fargate. Not relabeled to fit the picture.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "Next.js — the UI", confidence: "confirmed" },
    { n: 2, glyph: "belt", label: "BELT", mapsTo: "Express — the API", confidence: "confirmed" },
    { n: 3, glyph: "loupe", label: "LOUPE", mapsTo: "Bedrock Nova — vision and voice", confidence: "confirmed" },
    { n: 4, glyph: "pigeonhole", label: "PIGEONHOLES", mapsTo: "OpenSearch — the index", confidence: "confirmed" },
    { n: 5, glyph: "seal", label: "STAMP", mapsTo: "GitHub Actions — not this belt", confidence: "confirmed" },
    { n: 6, glyph: "bedplate", label: "BEDPLATE", mapsTo: "ECS Fargate", confidence: "confirmed" },
  ],
  numerals: [
    { mark: "1", x: 8, y: 8, fromX: 16, fromY: 18, glyph: "hopper" },
    { mark: "1a", x: 6, y: 32, fromX: 14, fromY: 28, glyph: "hopper" },
    { mark: "2", x: 28, y: 48, fromX: 32, fromY: 40, glyph: "belt" },
    { mark: "2a", x: 48, y: 48, fromX: 50, fromY: 38, glyph: "belt" },
    { mark: "3", x: 42, y: 6, fromX: 46, fromY: 16, glyph: "loupe" },
    { mark: "3a", x: 62, y: 8, fromX: 58, fromY: 18, glyph: "loupe" },
    { mark: "3b", x: 28, y: 72, fromX: 38, fromY: 82, glyph: "loupe" },
    { mark: "4", x: 78, y: 10, fromX: 82, fromY: 22, glyph: "pigeonhole" },
    { mark: "4a", x: 92, y: 36, fromX: 88, fromY: 32, glyph: "pigeonhole" },
    { mark: "5", x: 86, y: 58, fromX: 70, fromY: 44, glyph: "seal" },
    { mark: "6", x: 8, y: 58, fromX: 18, fromY: 54, glyph: "bedplate" },
    { mark: "6a", x: 58, y: 62, fromX: 54, fromY: 56, glyph: "bedplate" },
  ],
  figLabels: [
    { n: 1, x: 3, y: 64 },
    { n: 2, x: 18, y: 96, caption: "board under the loupe" },
  ],
  detail: { title: "board under the loupe" },
};

export const MIRRORFI_VAULT: ApparatusSpec = {
  fig: 8,
  move: "4…Nf6",
  function: "AN AUTOMATED VAULT",
  filed: "May 2025",
  viewBox: SHEET,
  layout: "elevation",
  flow: [1, 2, 3, 4],
  engraving: { src: "/figures/fig-mirrorfi.webp", ...ENGRAVING },
  review: {
    status: "validated",
    notes:
      "Architecture 1:1. Hopper=Next.js UI; chute=Node.js API; vault+three lockboxes=Solana (Drift, Jupiter, Meteora); pigeonholes=MongoDB; governor=auto-rebalance; gauge=APY. Not relabeled to fit the picture.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "Next.js — the no-code desk", confidence: "confirmed" },
    { n: 2, glyph: "funnel", label: "CHUTE", mapsTo: "Node.js — the API", confidence: "confirmed" },
    { n: 3, glyph: "vault", label: "VAULT", mapsTo: "Solana — Drift, Jupiter, Meteora", confidence: "confirmed" },
    { n: 4, glyph: "pigeonhole", label: "PIGEONHOLES", mapsTo: "MongoDB — shareable strategies", confidence: "confirmed" },
    { n: 5, glyph: "governor", label: "GOVERNOR", mapsTo: "auto-rebalancing", confidence: "confirmed" },
    { n: 6, glyph: "gauge", label: "GAUGE", mapsTo: "live APY", confidence: "confirmed" },
    { n: 7, glyph: "ledger", label: "LEDGER", mapsTo: "Grand Prize, Megahack 2025", confidence: "confirmed" },
  ],
  numerals: [
    { mark: "1", x: 10, y: 8, fromX: 18, fromY: 18, glyph: "hopper" },
    { mark: "2", x: 8, y: 42, fromX: 22, fromY: 40, glyph: "funnel" },
    { mark: "3", x: 40, y: 28, fromX: 48, fromY: 38, glyph: "vault" },
    { mark: "3a", x: 38, y: 58, fromX: 44, fromY: 52, glyph: "vault" },
    { mark: "3b", x: 50, y: 58, fromX: 50, fromY: 52, glyph: "vault" },
    { mark: "3c", x: 62, y: 58, fromX: 56, fromY: 52, glyph: "vault" },
    { mark: "3d", x: 48, y: 74, fromX: 50, fromY: 86, glyph: "vault" },
    { mark: "4", x: 86, y: 16, fromX: 82, fromY: 28, glyph: "pigeonhole" },
    { mark: "5", x: 48, y: 6, fromX: 50, fromY: 16, glyph: "governor" },
    { mark: "6", x: 66, y: 8, fromX: 64, fromY: 18, glyph: "gauge" },
    { mark: "7", x: 92, y: 62, fromX: 84, fromY: 70, glyph: "ledger" },
  ],
  figLabels: [
    { n: 1, x: 3, y: 64 },
    { n: 2, x: 18, y: 96, caption: "the vault lock, sectioned" },
  ],
  detail: { title: "the vault lock, sectioned" },
};

export const RISK_ENGINE: ApparatusSpec = {
  fig: 9,
  move: "1…Nf6",
  function: "AN UNDERWRITING ENGINE",
  filed: "Jul. 2025",
  viewBox: SHEET,
  layout: "elevation",
  flow: [1, 2, 3],
  engraving: { src: "/figures/fig-risk.webp", ...ENGRAVING },
  review: {
    status: "validated",
    notes:
      "Architecture 1:1. Hopper=Kafka; millwheels=LightGBM/XGBoost ensemble; stamp=BentoML; loupe beside the mill=SHAP; belt=the daily pipeline; gauge=0.87 AUC. Not relabeled to fit the picture.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "Kafka — daily market signals", confidence: "confirmed" },
    { n: 2, glyph: "millwheel", label: "MILLWHEEL", mapsTo: "LightGBM / XGBoost", confidence: "confirmed" },
    { n: 3, glyph: "seal", label: "STAMP", mapsTo: "BentoML — the serving hatch", confidence: "confirmed" },
    { n: 4, glyph: "loupe", label: "LOUPE", mapsTo: "SHAP — not this belt", confidence: "confirmed" },
    { n: 5, glyph: "belt", label: "BELT", mapsTo: "the daily retrain", confidence: "confirmed" },
    { n: 6, glyph: "gauge", label: "GAUGE", mapsTo: "0.87 AUC-ROC", confidence: "confirmed" },
    { n: 7, glyph: "ledger", label: "LEDGER", mapsTo: "the risk score", confidence: "presumed" },
  ],
  numerals: [
    { mark: "1", x: 10, y: 8, fromX: 16, fromY: 18, glyph: "hopper" },
    { mark: "2", x: 38, y: 8, fromX: 42, fromY: 22, glyph: "millwheel" },
    { mark: "2a", x: 58, y: 8, fromX: 56, fromY: 22, glyph: "millwheel" },
    { mark: "2b", x: 48, y: 74, fromX: 50, fromY: 86, glyph: "millwheel" },
    { mark: "3", x: 88, y: 8, fromX: 77, fromY: 24, glyph: "seal" },
    { mark: "4", x: 16, y: 52, fromX: 22, fromY: 62, glyph: "loupe" },
    { mark: "5", x: 28, y: 42, fromX: 32, fromY: 34, glyph: "belt" },
    { mark: "6", x: 42, y: 50, fromX: 53, fromY: 58, glyph: "gauge" },
    { mark: "7", x: 78, y: 50, fromX: 74, fromY: 62, glyph: "ledger" },
  ],
  figLabels: [
    { n: 1, x: 3, y: 58 },
    { n: 2, x: 18, y: 96, caption: "section of the driving hub" },
  ],
  detail: { title: "section of the driving hub" },
};

export const LEADS_HALL: ApparatusSpec = {
  fig: 10,
  move: "2…d5",
  function: "A SORTING HALL",
  filed: "May 2025",
  viewBox: SHEET,
  layout: "elevation",
  flow: [1, 2, 3, 4],
  engraving: { src: "/figures/fig-leads.webp", ...ENGRAVING },
  review: {
    status: "validated",
    notes:
      "Architecture 1:1. Hopper=100M+ events; pigeonholes=PySpark feature engineering; belt=the hall; millwheel=PyTorch DDP / DIN; stamp=checkpointing; gauge=conversion. Not relabeled to fit the picture.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "100M+ events a day", confidence: "confirmed" },
    { n: 2, glyph: "pigeonhole", label: "PIGEONHOLES", mapsTo: "PySpark — the sort", confidence: "confirmed" },
    { n: 3, glyph: "belt", label: "BELT", mapsTo: "the hall", confidence: "presumed" },
    { n: 4, glyph: "millwheel", label: "MILLWHEEL", mapsTo: "PyTorch DDP — Deep Interest Network", confidence: "confirmed" },
    { n: 5, glyph: "seal", label: "STAMP", mapsTo: "checkpointing — zero loss", confidence: "confirmed" },
    { n: 6, glyph: "gauge", label: "GAUGE", mapsTo: "conversion", confidence: "presumed" },
    { n: 7, glyph: "ledger", label: "LEDGER", mapsTo: "the run log", confidence: "presumed" },
  ],
  numerals: [
    { mark: "1", x: 8, y: 8, fromX: 16, fromY: 18, glyph: "hopper" },
    { mark: "2", x: 48, y: 8, fromX: 52, fromY: 20, glyph: "pigeonhole" },
    { mark: "2a", x: 48, y: 74, fromX: 50, fromY: 85, glyph: "pigeonhole" },
    { mark: "3", x: 28, y: 48, fromX: 32, fromY: 40, glyph: "belt" },
    { mark: "4", x: 80, y: 8, fromX: 76, fromY: 32, glyph: "millwheel" },
    { mark: "5", x: 88, y: 40, fromX: 84, fromY: 48, glyph: "seal" },
    { mark: "6", x: 98, y: 22, fromX: 94, fromY: 36, glyph: "gauge" },
    { mark: "7", x: 94, y: 58, fromX: 82, fromY: 66, glyph: "ledger" },
  ],
  figLabels: [
    { n: 1, x: 3, y: 64 },
    { n: 2, x: 18, y: 96, caption: "a pigeonhole, sectioned" },
  ],
  detail: { title: "a pigeonhole, sectioned" },
};

export const VERIDIAN_PLANT: ApparatusSpec = {
  fig: 11,
  move: "5. d4",
  function: "AN ECONOMIZED PLANT",
  filed: "Apr. 2026",
  viewBox: SHEET,
  layout: "elevation",
  flow: [1, 2, 3, 4],
  engraving: { src: "/figures/fig-veridian.webp", ...ENGRAVING },
  review: {
    status: "validated",
    notes:
      "Press retired. Hopper=intercepted plans; Morse telegraph=GitLab Duo+MCP; crucible=Vertex AI; valve=quantized hardware; bedplate=Cloud Run; ledger beside=BigQuery ESG; idle funnel=Python. Not relabeled to fit the picture.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "the intercept — Terraform / K8s", confidence: "confirmed" },
    { n: 2, glyph: "telegraph", label: "TELEGRAPH", mapsTo: "GitLab Duo + MCP", confidence: "confirmed" },
    { n: 3, glyph: "crucible", label: "CRUCIBLE", mapsTo: "Vertex AI — profile the model", confidence: "confirmed" },
    { n: 4, glyph: "valve", label: "VALVE", mapsTo: "quantized, low-carbon hardware", confidence: "confirmed" },
    { n: 5, glyph: "bedplate", label: "BEDPLATE", mapsTo: "Cloud Run", confidence: "confirmed" },
    { n: 6, glyph: "ledger", label: "LEDGER", mapsTo: "BigQuery — not this request", confidence: "confirmed" },
    { n: 7, glyph: "funnel", label: "FUNNEL", mapsTo: "Python — glue, not this path", confidence: "confirmed" },
    { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed" },
  ],
  numerals: [
    { mark: "1", x: 8, y: 8, fromX: 16, fromY: 18, glyph: "hopper" },
    { mark: "2", x: 26, y: 6, fromX: 30, fromY: 28, glyph: "telegraph" },
    { mark: "3", x: 48, y: 8, fromX: 50, fromY: 32, glyph: "crucible" },
    { mark: "4", x: 68, y: 18, fromX: 66, fromY: 30, glyph: "valve" },
    { mark: "4a", x: 48, y: 74, fromX: 50, fromY: 86, glyph: "valve" },
    { mark: "5", x: 8, y: 58, fromX: 20, fromY: 54, glyph: "bedplate" },
    { mark: "6", x: 92, y: 62, fromX: 72, fromY: 52, glyph: "ledger" },
    { mark: "7", x: 96, y: 12, fromX: 92, fromY: 28, glyph: "funnel" },
    { mark: "8", x: 88, y: 8, fromX: 80, fromY: 32, glyph: "gauge" },
  ],
  figLabels: [
    { n: 1, x: 3, y: 64 },
    { n: 2, x: 18, y: 96, caption: "the throttle, sectioned" },
  ],
  detail: { title: "the throttle, sectioned" },
};

export const PROJECT_FIGURES = {
  circuitmindai: CIRCUITMIND_LINE,
  mirrorfi: MIRRORFI_VAULT,
  "financial-risk-predictor": RISK_ENGINE,
  "distributed-lead-scorer": LEADS_HALL,
  veridian: VERIDIAN_PLANT,
} as const;
