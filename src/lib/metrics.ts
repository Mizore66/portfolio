/**
 * Claim ledger. Homepage, scoresheet, exhibits, patent legends, and the
 * print edition all read from here. Do not retcon owners: Monash
 * regulations ≠ GraphRAG policy corpus.
 *
 * `kind` is epistemic status, not importance:
 *   production — observed in a running product
 *   benchmark  — controlled experiment with a stated protocol
 *   evaluation — offline / test / comparison set
 *   pipeline   — architectural throughput; not claimed as sustained production volume
 */
export const EVIDENCE_TIER = {
  production: "Production",
  benchmark: "Controlled benchmark",
  evaluation: "Evaluation",
  pipeline: "Pipeline / capacity",
} as const;

export type EvidenceKind = keyof typeof EVIDENCE_TIER;

export const METRICS = {
  monashRetrieval: {
    value: "+45%",
    unit: "retrieval accuracy",
    vs: "vector-only RAG",
    owner: "Monash University contract",
    corpus: "university regulations",
    method: "self-correcting Text-to-Cypher over Neo4j",
    strip: "+45% retrieval",
    display: "+45% retrieval vs vector-only",
    impact: "+45% retrieval accuracy",
    note: "vs vector-only RAG · university regulations",
    kind: "evaluation" as const,
  },
  graphragRetrieval: {
    value: "+35%",
    unit: "retrieval accuracy",
    vs: "vector-only",
    owner: "Multi-Agent GraphRAG (project)",
    corpus: "university policy corpus",
    method: "LangGraph over Neo4j plus a vector store",
    strip: "+35% retrieval",
    display: "+35% retrieval vs vector-only",
    impact: "+35% retrieval accuracy",
    gauge: "+35% retrieval vs vector-only (project · policy corpus)",
    note: "vs vector-only · university policy corpus",
    kind: "evaluation" as const,
  },
  setelCoverage: {
    value: "92.5%",
    unit: "unit-test coverage",
    owner: "Setel",
    scope: "checkout and capture",
    display: "92.5% unit-test coverage",
    note: "unit tests · checkout and capture",
    kind: "evaluation" as const,
  },
  setelDefects: {
    value: "−40%",
    unit: "production defects",
    owner: "Setel",
    display: "−40% production defects",
    note: "production",
    kind: "production" as const,
  },
  wdOversight: {
    value: "−40%",
    unit: "manual oversight",
    owner: "Western Digital",
    context: "lab dashboard, 50+ staff",
    display: "−40% manual oversight",
    note: "lab dashboard · 50+ staff",
    kind: "evaluation" as const,
  },
  veridianUptime: {
    value: "99.9%",
    unit: "uptime",
    owner: "Veridian",
    runtime: "Cloud Run",
    display: "99.9% uptime",
    note: "Cloud Run",
    kind: "evaluation" as const,
  },
  veridianEmissions: {
    value: "−15%",
    unit: "cloud emissions",
    owner: "Veridian",
    display: "−15% cloud emissions",
    note: "Cloud Run scheduling",
    kind: "evaluation" as const,
  },
  leadThroughput: {
    value: "100M",
    unit: "events/day",
    owner: "Distributed Lead Scorer",
    display: "100M events/day",
    note: "PySpark pipeline · hours cut to minutes",
    kind: "pipeline" as const,
  },
  slmInference: {
    value: "12×",
    unit: "inference",
    owner: "SLM Distillation Engine",
    path: "70B → 3B",
    display: "12× inference",
    impact: "12x inference speedup",
    note: "70B → 3B student",
    kind: "evaluation" as const,
  },
  riskAuc: {
    value: "0.87",
    unit: "AUC-ROC",
    owner: "Financial Risk Predictor",
    vs: "15% over the baseline",
    display: "0.87 AUC-ROC",
    note: "15% over the baseline",
    kind: "evaluation" as const,
  },
  slmLatency: {
    value: "−50%",
    unit: "inference latency",
    owner: "Monash GraphRAG SLM / SLM Distillation",
    display: "−50% inference latency",
    kind: "evaluation" as const,
  },
  gateC: {
    value: "−143",
    unit: "Elo",
    owner: "Gate C",
    condition: "50 000 nodes/move, 100 games",
    display: "−143 Elo @ 50k nodes",
    note: "100 games · 50 000 nodes/move · fixed-N",
    kind: "benchmark" as const,
  },
} as const;

export const FEATURED_PROJECT_SLUGS = [
  "veridian",
  "circuitmindai",
  "multi-agent-graphrag",
] as const;

/** Experiments and negative results — Lab, not the recruiter funnel. */
export const LAB_PROJECT_SLUGS = ["slm-distillation-engine"] as const;

export const HERO_PROOF = [
  {
    label: METRICS.setelDefects.display,
    owner: METRICS.setelDefects.owner,
    note: METRICS.setelDefects.note,
    kind: METRICS.setelDefects.kind,
  },
  {
    label: `${METRICS.monashRetrieval.strip} (Monash)`,
    owner: METRICS.monashRetrieval.owner,
    note: METRICS.monashRetrieval.note,
    kind: METRICS.monashRetrieval.kind,
  },
  {
    label: METRICS.leadThroughput.display,
    owner: METRICS.leadThroughput.owner,
    note: METRICS.leadThroughput.note,
    kind: METRICS.leadThroughput.kind,
  },
] as const;

/** Desks a recruiter should be able to name after five seconds. */
export const HERO_DESKS = ["Setel", "Western Digital", "Petronas"] as const;

/** Year-first scan of professional desks. Derived from employment periods, not chess chronology. */
export const YEAR_INDEX = [
  { year: "2026", desks: ["Monash University"] },
  { year: "2025", desks: ["Western Digital", "Setel"] },
  { year: "2024", desks: ["Petronas"] },
] as const;

export const POSITIONING = {
  tagline: "I like systems that have to survive measurement.",
  dek: "Software engineer focused on ML infrastructure and data-intensive systems.",
  identity:
    "Early-career software engineer focused on ML infrastructure and data-intensive systems.",
  seniority:
    "Early-career. Intern and contract desks in production systems, plus independent experiments that include a published loss.",
  availability:
    "Open to early-career software engineering roles in fintech and AI infrastructure.",
  graduateNote: "Graduate and junior opportunities welcome.",
  contactHed: "Interested in building measured, reliable systems?",
  closer:
    "I'm interested in teams building reliable ML and data systems in fintech or infrastructure-heavy products.",
  next: "The next line I want to play: measured systems in fintech infrastructure.",
  professionalDek: "Intern and contract desks in production systems.",
  independentDek: "Independent systems. Professional desks are under Experience.",
  deskNote:
    "Professional desks are named and measured here; internal screenshots stay off the paper.",
  nameNote: "Anas T. Qumhiyeh on the masthead; Anas Tarek Qumhiyeh on the résumé.",
  trajectory:
    "The desks compound. Petronas was converting a licensed MATLAB back-end to Python, then presenting usability findings to department leadership. Western Digital put full-stack work behind roles for 50+ staff, with a WebSocket to the lab's deep-learning model. Setel was payments in production: authorization, capture, and tests on that path. Monash was retrieval over a graph of university regulations. The through-line is systems that have to keep working after they ship.",
  about: [
    "I'm a software engineer focused on ML infrastructure and data-intensive systems: retrieval, data pipelines, deployment, reliability, and the product surfaces around them.",
    "I've worked across payment engineering at Setel, lab systems at Western Digital, engineering tooling at Petronas, and a GraphRAG contract at Monash University. ML projects range from model distillation to large-scale data processing. I like work that can be measured — latency, reliability, retrieval quality, test coverage, throughput — rather than demonstrated only through a polished demo.",
    "Outside software, I've played chess since I was a teenager, which is why this portfolio is structured as a game. The moves are the work; the annotations are my interpretation of it.",
  ],
} as const;

export type ProjectOrigin = "Hackathon" | "Laboratory" | "Independent";
export type WorkPath = "ML / data systems" | "Product / backend";

/** Origin is derived from filings we already have. Do not invent team size or duration. */
export function projectOrigin(project: {
  slug: string;
  contextLabel?: string;
}): ProjectOrigin {
  if ((LAB_PROJECT_SLUGS as readonly string[]).includes(project.slug)) return "Laboratory";
  if (project.contextLabel && /hackathon|megahack/i.test(project.contextLabel)) return "Hackathon";
  return "Independent";
}

/** Two recruiter paths. Not a persona mode. */
export function projectPath(slug: string): WorkPath {
  if (slug === "circuitmindai" || slug === "mirrorfi") return "Product / backend";
  return "ML / data systems";
}

/** Survives a screenshot, a Slack unfurl, and a CSS-off document. */
export function exhibitTitle(project: { name: string; subtitle: string }): string {
  return `${project.name} — ${project.subtitle}`;
}
