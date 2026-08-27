import type { ApparatusSpec } from "@/lib/opening/types";

/** Overlay percents are of the engraving box. Furniture is HTML/SVG around it. */
const SHEET = { w: 720, h: 540 };
const ENGRAVING = { width: 1400, height: 1050 };

/**
 * Project patents. Domain-literal machines whose stages follow the
 * Reviewer-validated architecture in flow order. Role/education sheets
 * in figures.ts are archived on disk, not filed on the scoresheet.
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
    { mark: "1", x: 3.0, y: 18.0, fromX: 11.8, fromY: 18.0, glyph: "hopper" },
    { mark: "1a", x: 3.0, y: 28.0, fromX: 9.1, fromY: 28.0, glyph: "hopper" },
    { mark: "2", x: 3.0, y: 50.0, fromX: 18.9, fromY: 44.5, glyph: "belt" },
    { mark: "2a", x: 49.0, y: 12.0, fromX: 49.7, fromY: 31.3, glyph: "belt" },
    { mark: "3", x: 35.0, y: 8.0, fromX: 43.5, fromY: 14.2, glyph: "loupe" },
    { mark: "3a", x: 69.0, y: 8.0, fromX: 61.5, fromY: 14.8, glyph: "loupe" },
    { mark: "3b", x: 33.0, y: 88.0, fromX: 37.8, fromY: 82.2, glyph: "loupe" },
    { mark: "4", x: 81.0, y: 6.0, fromX: 81.5, fromY: 14.8, glyph: "pigeonhole" },
    { mark: "4a", x: 93.0, y: 50.0, fromX: 90.2, fromY: 40.1, glyph: "pigeonhole" },
    { mark: "5", x: 95.0, y: 58.0, fromX: 71.6, fromY: 44.9, glyph: "seal" },
    { mark: "6", x: 7.0, y: 74.0, fromX: 16.2, fromY: 57.2, glyph: "bedplate" },
    { mark: "6a", x: 53.0, y: 80.0, fromX: 53.9, fromY: 57.5, glyph: "bedplate" },
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
    { mark: "1", x: 27.0, y: 8.0, fromX: 22.1, fromY: 13.5, glyph: "hopper" },
    { mark: "2", x: 3.0, y: 42.0, fromX: 21.4, fromY: 40.1, glyph: "funnel" },
    { mark: "3", x: 43.0, y: 8.0, fromX: 47.8, fromY: 37.0, glyph: "vault" },
    { mark: "3a", x: 23.0, y: 52.0, fromX: 40.6, fromY: 52.0, glyph: "vault" },
    { mark: "3b", x: 49.0, y: 70.0, fromX: 49.8, fromY: 55.5, glyph: "vault" },
    { mark: "3c", x: 81.0, y: 62.0, fromX: 56.8, fromY: 52.3, glyph: "vault" },
    { mark: "3d", x: 59.0, y: 96.0, fromX: 54.0, fromY: 90.5, glyph: "vault" },
    { mark: "4", x: 93.0, y: 22.0, fromX: 82.4, fromY: 27.8, glyph: "pigeonhole" },
    { mark: "5", x: 59.0, y: 8.0, fromX: 54.0, fromY: 12.4, glyph: "governor" },
    { mark: "6", x: 71.0, y: 8.0, fromX: 66.2, fromY: 14.8, glyph: "gauge" },
    { mark: "7", x: 93.0, y: 74.0, fromX: 87.2, fromY: 71.4, glyph: "ledger" },
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
    { mark: "1", x: 15.0, y: 8.0, fromX: 16.0, fromY: 17.7, glyph: "hopper" },
    { mark: "2", x: 37.0, y: 8.0, fromX: 41.5, fromY: 20.6, glyph: "millwheel" },
    { mark: "2a", x: 55.0, y: 8.0, fromX: 56.0, fromY: 21.6, glyph: "millwheel" },
    { mark: "2b", x: 41.0, y: 92.0, fromX: 46.0, fromY: 88.7, glyph: "millwheel" },
    { mark: "3", x: 77.0, y: 8.0, fromX: 77.0, fromY: 23.0, glyph: "seal" },
    { mark: "4", x: 7.0, y: 68.0, fromX: 21.5, fromY: 62.2, glyph: "loupe" },
    { mark: "5", x: 29.0, y: 8.0, fromX: 31.6, fromY: 30.7, glyph: "belt" },
    { mark: "6", x: 53.0, y: 66.0, fromX: 53.0, fromY: 59.3, glyph: "gauge" },
    { mark: "7", x: 93.0, y: 62.0, fromX: 75.2, fromY: 62.0, glyph: "ledger" },
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
    { mark: "1", x: 23.0, y: 8.0, fromX: 19.1, fromY: 13.5, glyph: "hopper" },
    { mark: "2", x: 51.0, y: 8.0, fromX: 51.5, fromY: 14.6, glyph: "pigeonhole" },
    { mark: "2a", x: 49.0, y: 96.0, fromX: 50.0, fromY: 85.4, glyph: "pigeonhole" },
    { mark: "3", x: 7.0, y: 22.0, fromX: 29.6, fromY: 38.3, glyph: "belt" },
    { mark: "4", x: 93.0, y: 32.0, fromX: 76.5, fromY: 32.0, glyph: "millwheel" },
    { mark: "5", x: 93.0, y: 58.0, fromX: 88.0, fromY: 52.5, glyph: "seal" },
    { mark: "6", x: 95.0, y: 26.0, fromX: 94.1, fromY: 34.7, glyph: "gauge" },
    { mark: "7", x: 93.0, y: 70.0, fromX: 84.1, fromY: 66.8, glyph: "ledger" },
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
    { mark: "1", x: 15.0, y: 8.0, fromX: 16.0, fromY: 17.7, glyph: "hopper" },
    { mark: "2", x: 29.0, y: 8.0, fromX: 30.0, fromY: 27.4, glyph: "telegraph" },
    { mark: "3", x: 47.0, y: 8.0, fromX: 49.2, fromY: 25.8, glyph: "crucible" },
    { mark: "4", x: 65.0, y: 8.0, fromX: 66.0, fromY: 29.3, glyph: "valve" },
    { mark: "4a", x: 55.0, y: 92.0, fromX: 52.2, fromY: 88.7, glyph: "valve" },
    { mark: "5", x: 5.0, y: 50.0, fromX: 19.5, fromY: 53.9, glyph: "bedplate" },
    { mark: "6", x: 93.0, y: 64.0, fromX: 73.3, fromY: 52.8, glyph: "ledger" },
    { mark: "7", x: 97.0, y: 22.0, fromX: 92.2, fromY: 27.8, glyph: "funnel" },
    { mark: "8", x: 93.0, y: 16.0, fromX: 80.4, fromY: 31.5, glyph: "gauge" },
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
