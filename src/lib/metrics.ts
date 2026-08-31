/**
 * One source of truth for measured claims.
 * Homepage, scoresheet, exhibits, patent legends, and the print edition
 * all read from here. Do not retcon owners: Monash regulations ≠ GraphRAG policy corpus.
 */
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
  },
  setelCoverage: {
    value: "92.5%",
    unit: "unit-test coverage",
    owner: "Setel",
    scope: "checkout and capture",
    display: "92.5% unit-test coverage",
  },
  setelDefects: {
    value: "−40%",
    unit: "production defects",
    owner: "Setel",
    display: "−40% production defects",
  },
  wdOversight: {
    value: "−40%",
    unit: "manual oversight",
    owner: "Western Digital",
    context: "lab dashboard, 50+ staff",
    display: "−40% manual oversight",
  },
  veridianUptime: {
    value: "99.9%",
    unit: "uptime",
    owner: "Veridian",
    runtime: "Cloud Run",
    display: "99.9% uptime",
  },
  veridianEmissions: {
    value: "−15%",
    unit: "cloud emissions",
    owner: "Veridian",
    display: "−15% cloud emissions",
  },
  leadThroughput: {
    value: "100M",
    unit: "events/day",
    owner: "Distributed Lead Scorer",
    display: "100M events/day",
  },
  slmInference: {
    value: "12×",
    unit: "inference",
    owner: "SLM Distillation Engine",
    path: "70B → 3B",
    display: "12× inference",
    impact: "12x inference speedup",
  },
  riskAuc: {
    value: "0.87",
    unit: "AUC-ROC",
    owner: "Financial Risk Predictor",
    vs: "15% over the baseline",
    display: "0.87 AUC-ROC",
  },
  slmLatency: {
    value: "−50%",
    unit: "inference latency",
    owner: "Monash GraphRAG SLM / SLM Distillation",
    display: "−50% inference latency",
  },
  gateC: {
    value: "−143",
    unit: "Elo",
    owner: "Gate C",
    condition: "50 000 nodes/move, 100 games",
    display: "−143 Elo @ 50k nodes",
  },
} as const;

export const FEATURED_PROJECT_SLUGS = [
  "veridian",
  "circuitmindai",
  "multi-agent-graphrag",
] as const;

export const HERO_PROOF = [
  { label: METRICS.leadThroughput.display, owner: METRICS.leadThroughput.owner },
  { label: METRICS.setelDefects.display, owner: METRICS.setelDefects.owner },
  { label: `${METRICS.monashRetrieval.strip} (Monash)`, owner: METRICS.monashRetrieval.owner },
  { label: METRICS.slmInference.display, owner: METRICS.slmInference.owner },
] as const;

export const POSITIONING = {
  tagline: "I build ML and software systems that have to survive measurement.",
  dek: "Software engineer building ML infrastructure, data systems, and full-stack products.",
  identity:
    "Early-career software engineer focused on ML infrastructure, data systems and full-stack products.",
  availability:
    "Open to early-career software engineering roles in fintech and AI infrastructure.",
  graduateNote: "Graduate and junior opportunities welcome.",
  closer:
    "I'm interested in teams building reliable ML and data systems in fintech or infrastructure-heavy products.",
  about: [
    "I'm a software engineer interested in systems where machine learning meets production infrastructure: retrieval systems, data pipelines, deployment, reliability, and the product surfaces around them.",
    "I've worked across payment engineering at Setel, lab systems at Western Digital, engineering tooling at Petronas, and ML projects ranging from GraphRAG and model distillation to large-scale data processing. I like work that can be measured — latency, reliability, retrieval quality, test coverage, throughput — rather than demonstrated only through a polished demo.",
    "Chess has been part of my life since I was a teenager, which is why this portfolio is structured as a game. The moves are the work; the annotations are my interpretation of it.",
  ],
} as const;
