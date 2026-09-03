/**
 * Claim ledger. Homepage, scoresheet, exhibits, patent legends, and the
 * print edition all read from here. Do not retcon owners: Monash
 * regulations ≠ GraphRAG handbook / policy archive.
 *
 * `kind` is epistemic status, not importance:
 *   production — observed in a running product
 *   benchmark  — controlled experiment with a stated protocol
 *   evaluation — offline / test / comparison set
 *   pipeline   — architectural throughput; not claimed as sustained traffic
 */
export const EVIDENCE_TIER = {
  production: "Production",
  benchmark: "Controlled benchmark",
  evaluation: "Controlled evaluation",
  pipeline: "Capacity benchmark",
  capability: "Capability",
} as const;

export type EvidenceKind = keyof typeof EVIDENCE_TIER;

/** Short classified line: the number never travels without its epistemic status. */
export function classifiedShort(metric: { display: string; kind: EvidenceKind }): string {
  return `${metric.display} · ${EVIDENCE_TIER[metric.kind]}`;
}

export const METRICS = {
  monashRetrieval: {
    value: "+45%",
    unit: "retrieval accuracy",
    vs: "vector-only RAG",
    owner: "Monash University contract",
    corpus: "university regulations",
    method: "self-correcting Text-to-Cypher over Neo4j",
    methodPlain:
      "generated graph queries, checked failures, and retried malformed Cypher automatically",
    strip: "+45% retrieval",
    display: "+45% retrieval vs vector-only",
    impact: "+45% retrieval accuracy",
    note: "vs vector-only RAG · university regulations",
    sample:
      "Query set size, scoring rule, and denominator were not filed. Filed as retrieval accuracy versus vector-only RAG on university regulations, contract ending Feb 2026.",
    denominator: "Unfiled — query count and scoring rule were not published.",
    kind: "evaluation" as const,
  },
  graphragRetrieval: {
    value: "+35%",
    unit: "retrieval accuracy as filed (not Recall@k)",
    vs: "vector-only",
    owner: "Multi-Agent GraphRAG (project)",
    corpus: "independent university handbook and policy archive",
    method: "LangGraph over Neo4j plus a vector store",
    strip: "+35% retrieval",
    display: "+35% retrieval vs vector-only",
    impact: "+35% retrieval accuracy",
    gauge: "+35% retrieval vs vector-only (project · handbook / policy archive)",
    note: "vs vector-only · independent handbook / policy archive, not Monash regulations",
    sample:
      "Query set size, scoring rule, and Recall@k were not filed. Filed as retrieval accuracy versus vector-only on that handbook and policy archive.",
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
    note: "Separate from 92.5% coverage; not claimed as coverage's effect.",
    denominator:
      "Count denominator on checkout and capture was not filed. Filed as a production defect-count change during the Jul–Dec 2025 internship, not a rate or severity-weighted index.",
    kind: "production" as const,
  },
  wdOversight: {
    value: "−40%",
    unit: "manual oversight",
    owner: "Western Digital",
    context: "lab dashboard, 50+ staff",
    oversight:
      "manual station-checking on the lab dashboard — operators verifying station status by hand rather than reading it on the board",
    latency: "under 100 ms of UI-visible latency on the dashboard path",
    socket:
      "WebSocket carried station-status and model-inference updates so operators could read the board instead of walking stations",
    display: "−40% manual oversight",
    note: "lab dashboard · 50+ staff",
    denominator:
      "Baseline window and measurement method were not filed beyond dashboard observation for 50+ staff during the Feb–Dec 2025 contract.",
    kind: "evaluation" as const,
  },
  veridianUptime: {
    value: "99.9%",
    unit: "observed uptime",
    owner: "Veridian",
    runtime: "Cloud Run",
    display: "99.9% observed uptime",
    opening: "Veridian Cloud Run evaluation: 99.9% observed uptime",
    resume: "Cloud Run evaluation · 99.9% observed uptime",
    note: "Cloud Run evaluation — not a named production SLO",
    kind: "evaluation" as const,
  },
  veridianEmissions: {
    value: "−15%",
    unit: "cloud emissions",
    owner: "Veridian",
    display: "−15% cloud emissions",
    note: "Cloud Run scheduling vs the default unscheduled Cloud Run service. Evaluation period, sample size, and the emissions calculation source were not filed.",
    kind: "evaluation" as const,
  },
  leadThroughput: {
    value: "100M",
    unit: "events/day capacity",
    owner: "Distributed Lead Scorer",
    display: "100M-event capacity benchmark",
    note: "PySpark pipeline capacity. Not claimed as sustained traffic.",
    denominator:
      "Cluster size, input distribution, runtime, checkpoint interval, and failure-injection procedure were not filed.",
    kind: "pipeline" as const,
  },
  slmInference: {
    value: "70B → 3B",
    unit: "teacher-to-student compression (speed unfiled)",
    owner: "SLM Distillation Engine",
    path: "70B → 3B",
    display: "70B → 3B student",
    impact: "70B → 3B student",
    note: "Tokens/second, hardware, and batch size were not filed. Speed-up is unpublished until those are measured.",
    kind: "evaluation" as const,
  },
  riskAuc: {
    value: "0.87",
    unit: "AUC-ROC",
    owner: "Financial Risk Predictor",
    vs: "no published comparator",
    display: "0.87 AUC-ROC",
    note: "An unnamed 15% lift was withdrawn until a comparator and method can be filed. Dataset size, split, leakage controls, and positive-class prevalence were not filed.",
    kind: "evaluation" as const,
  },
  slmLatency: {
    value: "−50%",
    unit: "inference latency",
    owner: "Monash GraphRAG SLM",
    display: "−50% inference latency (Monash GraphRAG SLM)",
    note: "Monash contract SLM, not the independent SLM Distillation Engine exhibit.",
    kind: "evaluation" as const,
  },
  gateC: {
    value: "−143",
    unit: "Elo",
    owner: "Gate C",
    condition: "50 000 nodes/move, 128 games",
    display: "−143 Elo @ 50k nodes",
    note: "128 games · 50 000 nodes/move · SPRT h0",
    denominator: "128 games. SPRT terminated for H0 (LLR −2.99).",
    source: "matches/gate-c-v1-50000-sprt.json · training/GUARDS.md",
    kind: "benchmark" as const,
  },
} as const;

/** Two retrieval numbers. Same comparison; different corpus, different owner. Not a retcon. */
export const RETRIEVAL_SPLIT =
  "+45% is the Monash contract on university regulations (Text-to-Cypher). +35% is the independent GraphRAG project on a separate university handbook and policy archive. Same comparison — vector-only — different corpus, different filing.";

export const FEATURED_PROJECT_SLUGS = [
  "veridian",
  "circuitmindai",
  "multi-agent-graphrag",
] as const;

/** Experiments and negative results — Lab, not the recruiter funnel. */
export const LAB_PROJECT_SLUGS = ["slm-distillation-engine"] as const;

export const HERO_PROOF = [
  {
    id: "setelDefects" as const,
    label: METRICS.setelDefects.display,
    owner: METRICS.setelDefects.owner,
    note: METRICS.setelDefects.note,
    kind: METRICS.setelDefects.kind,
  },
  {
    id: "monashRetrieval" as const,
    label: `${METRICS.monashRetrieval.strip} vs vector-only (Monash)`,
    owner: METRICS.monashRetrieval.owner,
    note: METRICS.monashRetrieval.note,
    kind: METRICS.monashRetrieval.kind,
  },
  {
    id: "leadThroughput" as const,
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
  dek: "Software engineer building ML infrastructure and data-intensive systems for payments, lab operations, and retrieval.",
  identity:
    "Software engineer building ML infrastructure and data-intensive systems for payments, lab operations, and retrieval.",
  seniority:
    "Internships and contract roles in payments, lab operations, and university-policy retrieval, plus independent experiments that include a published loss.",
  howIWork:
    "At Setel, payment-engine defects could travel to checkout at the pump, so the tests had to survive that path.",
  availability:
    "Open to software engineering roles across fintech, ML infrastructure, and data platforms.",
  graduateNote: "Graduate and junior opportunities welcome.",
  workAuth: "Ask about work authorization and relocation.",
  contactHed: "Hiring a software engineer for backend, product, ML infrastructure, or data-platform work? Write to me.",
  replies: "Usually replies within two business days (MYT).",
  closer:
    "I'm interested in teams building reliable ML and data systems in fintech or infrastructure-heavy products.",
  next: "The next line I want to play: measured systems in fintech infrastructure.",
  professionalDek: "Internships and contract roles in payments, lab operations, and university-policy retrieval.",
  independentDek: "Independent projects. Production and contract work is under Experience.",
  independentKicker: "Independent projects",
  deskNote:
    "Professional work is summarized here; internal screenshots remain private. I joined existing teams on internships and contracts; independent flagships are solo.",
  ownershipBridge:
    "I built payment systems at Setel, a lab-operations dashboard at Western Digital, retrieval systems at Monash, and the projects below independently.",
  nameNote: "Anas T. Qumhiyeh on the masthead; Anas Tarek Qumhiyeh on the résumé.",
  desksLine:
    "Built payment systems at Setel, a lab-operations dashboard at Western Digital, then retrieval at Monash University, with earlier work at Petronas.",
  throughLine: "At Western Digital, operators had to walk stations when the board was silent, so the dashboard had to carry live status.",
  deskSummaries: [
    {
      desk: "Petronas",
      line: "Replaced MATLAB-dependent back-end calculation and reporting functions with Python packages; usability findings to department leadership.",
    },
    {
      desk: "Western Digital",
      line: "Lab dashboard for 50+ staff; WebSocket carried station-status and model-inference updates to the board.",
    },
    {
      desk: "Setel",
      line: "Payments in production: authorization, capture, and tests.",
    },
    {
      desk: "Monash University",
      line: "Retrieval over a graph of university regulations.",
    },
  ],
  recruiterBio:
    "Software engineer building ML infrastructure and data-intensive systems for payments, lab operations, and retrieval. I built production payment paths at Setel, a lab-operations dashboard at Western Digital, and retrieval over university regulations at Monash. Graduate, May 2026.",
  followerBio:
    "I build backend, ML-infrastructure, and data systems, with production work at Setel and Western Digital and retrieval work at Monash. I've played chess since I was a teenager, which is why this portfolio is a scoresheet: moves are facts, annotations are voice. At Petronas I replaced MATLAB-dependent back-end functions with Python packages and presented usability findings to department leadership. At Western Digital I built a lab-operations dashboard for 50+ staff, with WebSocket station-status updates so operators could read the board instead of walking stations. At Setel I worked on checkout and capture on the payment engine. At Monash I owned the GraphRAG retrieval path and distilled an SLM; the faculty's administration tools were outside my scope. I joined existing teams on internships and contracts; independent flagships are solo.",
  aboutHeading: "About the annotator",
  about: [
    "I build backend, ML-infrastructure, and data systems, with production work at Setel and Western Digital and retrieval work at Monash.",
    "I've played chess since I was a teenager, which is why this portfolio is a scoresheet: moves are facts, annotations are voice.",
    "The moves are the work; the annotations are my interpretation of it.",
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
export function projectPath(slug: string, category?: string): WorkPath {
  if (category === "Product / backend" || category === "ML / data systems") return category;
  if (slug === "circuitmindai" || slug === "mirrorfi") return "Product / backend";
  return "ML / data systems";
}

export function workPathFromQuery(path?: string): WorkPath | "all" {
  if (path === "product") return "Product / backend";
  if (path === "ml") return "ML / data systems";
  return "all";
}

export function workPathParam(path: WorkPath | "all"): string | undefined {
  if (path === "ML / data systems") return "ml";
  if (path === "Product / backend") return "product";
  return undefined;
}

export function workHomeHref(path: WorkPath | "all" = "all"): string {
  const param = workPathParam(path);
  return param ? `/?path=${param}#work` : "/#work";
}

export function exhibitHref(slug: string, path: WorkPath | "all" = "all"): string {
  const param = workPathParam(path);
  return param ? `/projects/${slug}?path=${param}` : `/projects/${slug}`;
}

/** Survives a screenshot, a Slack unfurl, and a CSS-off document. */
export function exhibitTitle(project: { name: string; subtitle: string }): string {
  return `${project.name} — ${project.subtitle}`;
}

/** Role is derived from origin. Do not invent architect / team lead. */
export function projectRole(project: { slug: string; contextLabel?: string }): string {
  const origin = projectOrigin(project);
  if (origin === "Hackathon") return "Hackathon builder — architecture, implementation, and demo.";
  if (origin === "Laboratory") return "Laboratory experiment — design, training, and evaluation.";
  return "Sole builder — architecture, implementation, and evaluation.";
}

export function projectSourceLabel(github: string): string {
  return github ? "Public repository" : "Private project archive";
}

export function exhibitKicker(origin: ProjectOrigin, slug?: string): string {
  const featured = slug ? (FEATURED_PROJECT_SLUGS as readonly string[]).includes(slug) : false;
  const lab = slug ? (LAB_PROJECT_SLUGS as readonly string[]).includes(slug) : origin === "Laboratory";
  if (slug && !featured && !lab) return "Archive / supporting work";
  if (origin === "Hackathon") return "Prize clipping";
  if (origin === "Laboratory") return "Laboratory note";
  return "Clipping · Exhibit";
}

export type EvidenceRow = { label: string; value: string };

export type EvidenceCard = {
  result: string;
  capability?: string;
  method?: string;
  baseline?: string;
  environment?: string;
  sample?: string;
  alsoFiled?: string;
  rows?: EvidenceRow[];
};

/** Rows a recruiter can audit. Sample sizes and percentiles stay blank unless filed. */
export function projectEvidence(project: {
  slug: string;
  impact: string;
  apparatus: { runtime?: string };
}): EvidenceCard {
  switch (project.slug) {
    case "veridian":
      return {
        result: project.impact,
        method: "Cloud Run scheduling versus the default unscheduled Cloud Run service. Carbon ledger off the request path.",
        baseline: "Emissions versus the default unscheduled Cloud Run service. Uptime is not a named production SLO.",
        environment: METRICS.veridianUptime.runtime,
        alsoFiled: `${METRICS.veridianUptime.display} and ${METRICS.veridianEmissions.display} were recorded as Cloud Run evaluations of the implemented recommendation path — not a named production SLO. Evaluation period, sample size, and the emissions calculation source were not filed.`,
      };
    case "multi-agent-graphrag":
      return {
        result: `${METRICS.graphragRetrieval.display} (${METRICS.graphragRetrieval.unit})`,
        baseline: `Vector-only retrieval on the ${METRICS.graphragRetrieval.corpus}`,
        environment: METRICS.graphragRetrieval.method,
        sample:
          "The filed unit is a retrieval-accuracy comparison against vector-only on that handbook and policy archive. Query set, scoring rule, denominator, and Recall@k were not filed.",
        rows: [
          { label: "Vector-only retrieval", value: "Baseline" },
          { label: "Graph + vector, as filed", value: METRICS.graphragRetrieval.display },
        ],
      };
    case "financial-risk-predictor":
      return {
        result: METRICS.riskAuc.display,
        baseline: METRICS.riskAuc.note,
        sample: "Sample size not filed.",
        alsoFiled:
          "A −30% inference latency on the BentoML hatch was also noted; hardware and percentile were not filed.",
      };
    case "distributed-lead-scorer":
      return {
        result: METRICS.leadThroughput.display,
        method: "PySpark pipeline. Hours of pipeline latency were cut to minutes on that capacity-benchmark desk; exact clocks were not filed.",
        environment: "PySpark pipeline",
        sample: "Capacity benchmark. Not claimed as sustained traffic.",
        alsoFiled:
          "Checkpoints resume a failed hour from the last completed slice. Cluster size, input distribution, checkpoint interval, and a failure-injection record were not filed.",
      };
    case "slm-distillation-engine":
      return {
        result: METRICS.slmInference.display,
        baseline: METRICS.slmInference.path,
        environment: project.apparatus.runtime,
        sample: "Tokens/second, hardware, and batch size were not filed. Quality parity was not supported by a named filed evaluation.",
        alsoFiled:
          "A 98% test-pass note was also recorded; it is not a named task-success evaluation. −50% latency belongs to the Monash GraphRAG SLM, not this exhibit.",
      };
    case "circuitmindai":
      return {
        result: project.impact,
        capability:
          "Cached results cover network loss. Detection quality (precision, latency, confusion) was not filed.",
        environment: project.apparatus.runtime,
        sample: "This is a capability, not a measured detector. Precision and recall were not filed.",
      };
    case "mirrorfi":
      return {
        result: project.impact,
        environment: "Hackathon desk on Solana.",
        sample: "Prize clipping. No production traffic was filed.",
      };
    default:
      return {
        result: project.impact,
        environment: project.apparatus.runtime,
      };
  }
}

export const PAPER_HREF = "/opening-preparation";
export const COLOPHON_HREF = "/colophon";
