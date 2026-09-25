import type { Role } from "./types";

export const RETRIEVAL_SPLIT =
  "+45% is the Monash contract on university regulations. +35% is the independent GraphRAG project on a separate university handbook and policy archive. Same comparison — vector-only — different corpus.";

export const OVERLAP_NOTE =
  "Western Digital (Feb–Dec 2025) overlapped with the Setel internship (Jul–Dec 2025) and final-year study. The Monash contract (Nov 2025 – Feb 2026) overlapped with the start of Skribble Lab (Jan 2026). I graduated in April 2026 and joined Deriv in June.";

export const ROLES: readonly Role[] = [
  {
    id: "deriv",
    employer: "Deriv",
    title: "AI Engineer",
    kind: "Full-time",
    start: "2026-06",
    end: null,
    tech: ["Go", "FastAPI", "Next.js", "Kafka", "Terraform", "AWS EKS/EC2"],
    bullets: [
      "Shipped a full-stack customer-support system that proactively resolves user issues.",
      "Built a Go microservice that unifies data from 4–6 internal services into a single response for the support system, now running in staging.",
      "Built and operate Kafka- and API-based ingestion pipelines for reliable downstream analysis.",
      "Built evaluation and debugging harnesses that reproduce failures and capture environment signals.",
      "Updated the team's Terraform configurations while scaling existing infrastructure and provisioning new services.",
    ],
    claimIds: ["derivCxCost", "derivCsat", "derivEvents", "derivTimeToFix", "derivAwsCost", "derivGoService"],
    earlier: false,
  },
  {
    id: "skribble-lab",
    employer: "Skribble Lab",
    title: "Software Engineer",
    kind: "Full-time",
    start: "2026-01",
    end: "2026-06",
    tech: ["Laravel", "PostgreSQL", "Redis", "Docker"],
    bullets: [
      "Owned the Xendit payment-gateway integration end to end, from requirements review through production support.",
      "Designed and shipped a merchant onboarding module for product and payment setup, and onboarded the primary client, Chung Ling Private High School.",
      "Hunted integration breakage and production defects before customers found them.",
    ],
    claimIds: ["skribbleMerchants", "skribbleReach", "skribbleErrors"],
    earlier: false,
  },
  {
    id: "monash-university",
    employer: "Monash University",
    title: "Full-Stack AI Engineer",
    kind: "Contract",
    start: "2025-11",
    end: "2026-02",
    tech: ["FastAPI", "Neo4j", "Next.js", "LangGraph"],
    scope: "I owned the GraphRAG retrieval path and the distilled SLM; the faculty's administration tools were outside my scope.",
    bullets: [
      "Built a FastAPI and Neo4j graph service for university regulations with a self-correcting Text-to-Cypher loop.",
      "Automated prerequisite and credit-transfer rule resolution with embeddings plus multi-hop graph queries.",
      "Profiled and simplified the reasoning pipeline into a graph-logic SLM that surfaced contradictory policy data for administrators.",
    ],
    claimIds: ["monashRetrieval", "slmLatency"],
    note: RETRIEVAL_SPLIT,
    earlier: false,
  },
  {
    id: "western-digital",
    employer: "Western Digital",
    title: "Full-stack Engineer",
    kind: "Contract",
    start: "2025-02",
    end: "2025-12",
    tech: ["Next.js", "ASP.NET", "PostgreSQL", "Docker"],
    bullets: [
      "Built the lab-operations dashboard used by 50+ lab staff, with WebSocket station-status and model-inference updates under 100 ms of UI-visible latency.",
    ],
    claimIds: ["wdOversight"],
    annotation: "Operators had to walk stations when the board was silent, so the dashboard had to carry live status.",
    earlier: true,
  },
  {
    id: "setel",
    employer: "Setel",
    title: "Software Engineer Intern",
    kind: "Internship",
    start: "2025-07",
    end: "2025-12",
    tech: ["Docker", "Kubernetes", "React", "Node.js", "MongoDB", "NestJS"],
    bullets: ["Authorization and capture of stored payment methods on the payment engine, documented so a new developer could follow the path without a walkthrough."],
    claimIds: ["setelCoverage", "setelDefects"],
    annotation: "Payment-engine defects could travel to checkout at the pump, so the tests had to survive that path.",
    earlier: true,
  },
  {
    id: "petronas",
    employer: "Petronas",
    title: "Project Engineer Intern",
    kind: "Internship",
    start: "2024-11",
    end: "2025-02",
    tech: ["MATLAB", "Python", "MathCAD"],
    bullets: ["Replaced MATLAB-dependent back-end calculation and reporting functions with Python packages, removing paid runtime dependencies."],
    claimIds: [],
    earlier: true,
  },
];
