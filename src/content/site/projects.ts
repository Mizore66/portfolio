import { RETRIEVAL_SPLIT } from "./roles";
import type { Project, ProjectCategory } from "./types";

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  ml: "ML / data systems",
  product: "Product / backend",
  devtools: "Developer tools",
};

export const FEATURED_SLUGS = ["faultline", "gemini-teleportal", "circuitmindai"] as const;

export const TELEPORTAL_TEAM = "Built together with Kai; the repository is under his account.";

export const SLM_LATENCY_NOTE =
  "The halved inference latency elsewhere on this site belongs to the Monash contract's graph-logic SLM, not to this project.";

export const PROJECTS: readonly Project[] = [
  {
    slug: "faultline",
    name: "FaultLine",
    subtitle: "Regression and leak-evidence CLI",
    date: "2026-07",
    origin: "Solo",
    category: "devtools",
    group: "featured",
    repo: "https://github.com/Mizore66/faultline",
    tech: ["Go", "Docker", "GitHub Actions", "Sigstore"],
    purpose: "Replays a frozen, human-reviewed check across Git history in Docker sandboxes to find the first reliable PASS→FAIL commit.",
    result: { claimId: "faultlineLocate", line: "First PASS→FAIL commit in 1–5 min" },
    seo: {
      title: "FaultLine — Regression and leak-evidence CLI",
      description: "A Go CLI that replays a frozen, human-reviewed check across Git history in Docker sandboxes to find the first reliable PASS→FAIL commit.",
    },
    caseStudy: {
      draft: true,
      evidence: ["faultlineLocate", "faultlineSaved"],
      notes: ["Rewritten in Go from the original TypeScript version."],
      problem:
        "A bisect result or a CI log says where a check failed once. It does not give another engineer evidence they can verify without rerunning the repository's code.",
      decision:
        "Freeze one human-reviewed check, replay that exact check across the selected Git states in Docker sandboxes, and package the recorded results so another engineer can verify them offline.",
      constraint: "Proof artifacts must never carry credentials, so verification fails closed.",
      example:
        "Input: a frozen workflow check and four Git states from FaultLine's own history. Output: PASS at e8e30649, the first stable FAIL at 97c3290e, and PASS again at the fix, 07ee7f11, in a package that verified against its recorded root.",
      rejected: "Git bisect on its own: it finds a boundary but leaves no reviewable, portable record of what was executed.",
      built: [
        "A solo Go CLI that replays a frozen, human-reviewed check across Git history in Docker sandboxes. It pinpoints the first reliable PASS→FAIL commit in 1–5 minutes.",
        "It automates investigation, minimisation and CI attestation with GitHub Actions and Sigstore. This saves 1–3 hours per regression investigation compared with manual bisecting, on small-to-medium projects.",
        "Adversarial secret scanning with 8 detection rules plus an entropy heuristic, and fail-closed verification. Together they block credential leaks from proof artifacts.",
      ],
      limitations:
        "It shows where a frozen check first fails across the supplied Git states. It does not establish a unique root cause or an agent's intent.",
    },
    architecture: {
      path: [
        { label: "Frozen check", note: "human-reviewed" },
        { label: "Replay", note: "Docker, per Git state" },
        { label: "Proof package" },
        { label: "Offline verifier", note: "no repo code runs" },
      ],
      branches: [{ label: "Secret scanner", note: "8 rules + entropy", from: 2 }],
      beside: [{ label: "GitHub Actions + Sigstore", note: "CI attestation" }],
    },
    media: [
      {
        src: "/work/faultline/proof-page.webp",
        width: 1600,
        height: 992,
        alt: "FaultLine's read-only proof page, headed 'Where this frozen predicate first failed', reporting 18 declared files checked, 9 recorded executions, 3 Git states and 2 stable transitions.",
        caption: "The read-only proof view of a verified package. It checks every declared file before rendering and never reruns repository code.",
      },
      {
        src: "/work/faultline/codex-session.webp",
        width: 1532,
        height: 1122,
        alt: "A Codex session log: FaultLine confirmed the human freeze, then refused to localise the regression without a digest-pinned runtime image.",
        caption: "FaultLine inside a Codex session on a real CI failure. After the human freeze it refused to run without a digest-pinned runtime image, a fail-closed stop rather than a guess.",
      },
    ],
  },
  {
    slug: "gemini-teleportal",
    name: "Gemini Teleportal",
    subtitle: "Voice-controlled desktop AI agent",
    date: "2026-03",
    origin: "Built with Kai",
    category: "product",
    group: "featured",
    repo: "https://github.com/Kaiz404/Teleportal",
    tech: ["Next.js", "TypeScript", "Python", "Gemini Live API", "WebRTC", "Firebase", "Cloud Run"],
    purpose: "Streams phone audio and screen video to the Gemini Live API, which drives the Windows desktop by exact UI element ids.",
    result: { claimId: "teleportalTasks", line: "90%+ of demo desktop tasks, unaided" },
    seo: {
      title: "Gemini Teleportal — Voice-controlled desktop AI agent",
      description: "A voice-controlled desktop agent built with Kai: phone audio and screen video stream over WebRTC to the Gemini Live API, which drives the Windows UI.",
    },
    caseStudy: {
      draft: true,
      evidence: ["teleportalTasks", "teleportalLatency"],
      team: `${TELEPORTAL_TEAM} Made for the Gemini Live Agent Challenge.`,
      problem:
        "Driving a Windows desktop from a phone usually means pinching at a small mirror of the screen. The aim was to say the task instead, and have an agent that can see the screen carry it out.",
      decision:
        "Stream phone audio and the desktop's screen over WebRTC to the Gemini Live API, and have a ReAct agent act on exact UI element ids from the Windows UI Automation tree rather than on pixel guesses.",
      constraint:
        "Pairing had to need no setup: the phone and the desktop find each other through the same Google account, with no QR codes or session URLs.",
      built: [
        "A ReAct agent that clicks exact UI element ids from the Windows UI Automation tree and from annotated screenshots, with perceptual-hash verification. It completed 90%+ of demo desktop tasks unaided.",
        "Phone audio and screen video are streamed over WebRTC to the Gemini Live API. The agent acts on spoken commands within about 2–5 seconds. Pairing needs no configuration, using Google OAuth and Firestore signalling.",
        "A GitHub Actions and Cloud Build pipeline that auto-deploys every frontend change to Cloud Run.",
      ],
    },
    architecture: {
      path: [
        { label: "Phone web app", note: "Next.js on Cloud Run" },
        { label: "Desktop executor", note: "Python, WebRTC" },
        { label: "ReAct agent", note: "UI Automation tree" },
      ],
      branches: [
        { label: "Firestore", note: "signalling", from: 0 },
        { label: "Gemini Live API", note: "voice and screen", from: 1 },
      ],
      beside: [{ label: "GitHub Actions + Cloud Build", note: "deploys the web app" }],
    },
    thumbnail: 1,
    media: [
      {
        src: "/work/gemini-teleportal/sign-in.webp",
        width: 720,
        height: 1021,
        alt: "Gemini Teleportal's phone sign-in screen: 'Sign in with the Google account you use on your desktop to connect.'",
        caption: "Pairing is the Google sign-in. The phone and the desktop find each other through the same account.",
      },
      {
        src: "/work/gemini-teleportal/live-session.webp",
        width: 616,
        height: 1234,
        alt: "Teleportal on a phone during a session: the desktop's screen streams live at the top while the assistant listens, with voice input and output on.",
        caption: "A live session: the desktop streams to the phone while the assistant listens for a spoken task.",
      },
    ],
  },
  {
    slug: "circuitmindai",
    name: "CircuitMindAI",
    subtitle: "PCB inspection",
    date: "2026-03",
    origin: "Solo",
    category: "product",
    group: "featured",
    repo: "https://github.com/Mizore66/CircuitMindAI",
    tech: ["Next.js", "Amazon Bedrock", "Express", "OpenSearch Serverless", "GitHub Actions", "ECS Fargate"],
    purpose: "Images in, voice-guided inspection steps out, with cached results for network loss.",
    result: { claimId: "circuitmindInspection", line: "Vision and voice PCB inspection" },
    seo: {
      title: "CircuitMindAI — PCB inspection",
      description: "Nova Pro analyses the PCB image; Nova Sonic talks the operator through the fault. Next.js and Express on ECS Fargate.",
    },
    caseStudy: {
      evidence: ["circuitmindInspection"],
      problem:
        "An operator inspecting a board needs to see the copper fault and hear inspection guidance, including when the network drops. A detector that fails with connectivity loss is not dependable enough for the inspection floor.",
      decision:
        "Vision on the board and voice for the operator … results are cached locally so the floor can keep working when the network drops.",
      constraint: "The inspection has to survive a dropped network.",
      example:
        "Input: a board image and operator audio. Output: a fault overlay on the copper, with inspection guidance still audible when the network drops.",
      rejected: "A server-only detector, rejected because it would fail when connectivity drops.",
      built: [
        "A multi-modal GenAI pipeline: Nova Pro handles vision-based fault detection, and Nova Sonic provides low-latency, two-way voice guidance for the technician.",
        "A decoupled Next.js frontend with an Express REST API.",
        "GitHub Actions builds and pushes Docker images to ECR and updates ECS Fargate on every push. An Application Load Balancer and Auto Scaling keep it available and cost-efficient.",
        "A local cache that holds the inspection when the network drops.",
      ],
      limitations: "Detection quality (precision, latency, confusion) was never measured.",
      changeNow: "Measure precision, latency and confusion.",
    },
    architecture: {
      host: "ECS Fargate",
      path: [
        { label: "Next.js", note: "UI" },
        { label: "Express", note: "API" },
      ],
      branches: [
        { label: "Bedrock Nova", note: "vision and voice" },
        { label: "OpenSearch", note: "index" },
      ],
      beside: [{ label: "GitHub Actions", note: "CI/CD to ECR" }],
    },
    media: [
      {
        src: "/work/circuitmindai/inspection.webp",
        width: 1600,
        height: 613,
        alt: "CircuitMindAI inspecting a PCB photo: components U2 and U3 are outlined, and the model's diagnosis flags thermal discolouration on IC U1 as a warning.",
        caption: "Nova Pro's diagnosis beside the board, with the fix-it, voice and agent panels on the right.",
      },
    ],
  },
  {
    slug: "veridian",
    name: "Veridian",
    subtitle: "MLOps tradeoff engine",
    date: "2026-04",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["Python", "Terraform", "BigQuery", "GCP Vertex AI", "GitLab Duo", "MCP"],
    purpose: "Intercepts Terraform and Kubernetes and recommends a lower-carbon compute configuration before provisioning or a demand-driven scale event.",
    result: { claimId: "veridianEmissions", line: "−15% cloud emissions (Cloud Run evaluation)" },
    seo: {
      title: "Veridian — MLOps tradeoff engine",
      description: "GitLab Duo intercepts Terraform; Vertex AI recommends a lower-carbon compute configuration; BigQuery keeps the carbon ledger off the request.",
    },
    caseStudy: {
      evidence: ["veridianEmissions", "veridianUptime"],
      problem:
        "Selecting compute after provisioning or a demand-driven scale event means remediation arrives after the expensive decision has already been made.",
      decision:
        "Inspect Terraform before provisioning. Vertex AI recommends a lower-carbon compute configuration. The carbon ledger stays off the request path.",
      constraint:
        "The ledger had to stay off the request path so a slow or missing carbon number could not stall a provision.",
      example:
        "Input: a Terraform intent. Output: a recommended compute configuration, with the carbon ledger written beside the request, not on it.",
      rejected:
        "Putting the ledger on the request path, which would stall provisioning; and selecting compute after provisioning, which arrives too late.",
      built: [
        "GitLab Duo plus MCP intercept Terraform and Kubernetes changes.",
        "Vertex AI recommends a quantised, lower-carbon compute configuration.",
        "BigQuery holds the ESG ledger, off the request path.",
      ],
      limitations: "The evaluation period, sample size and emissions-calculation source were not recorded.",
      changeNow: "Record those three items.",
    },
    architecture: {
      host: "Cloud Run",
      path: [{ label: "GitLab Duo + MCP" }, { label: "Vertex AI" }],
      beside: [
        { label: "BigQuery", note: "ESG ledger" },
        { label: "Python", note: "glue" },
      ],
    },
  },
  {
    slug: "multi-agent-graphrag",
    name: "Multi-Agent GraphRAG",
    subtitle: "Policy-corpus retrieval",
    date: "2025-10",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["LangGraph", "Neo4j", "Vector DB", "Knowledge Graphs", "RAG"],
    purpose: "LangGraph over an independent university handbook and policy archive, with a vector fallback.",
    result: { claimId: "graphragRetrieval", line: "+35% retrieval vs vector-only" },
    seo: {
      title: "Multi-Agent GraphRAG — Policy-corpus retrieval",
      description: "LangGraph over an independent university handbook and policy archive: agents write Cypher, check it, and fall back to a vector store. +35% retrieval.",
    },
    caseStudy: {
      evidence: ["graphragRetrieval"],
      notes: [RETRIEVAL_SPLIT],
      problem: "A question about prerequisites has to walk the graph, not only the nearest paragraph.",
      decision:
        "The graph is the structured path for prerequisites and policy; the vector store is the fallback when no valid graph path is returned.",
      constraint: "Prerequisites and credit-transfer are edges, not another vector-only retrieval dump.",
      example: "Input: a policy question. Output: a neighbourhood of clauses from the independent handbook archive.",
      rejected: "Vector-only retrieval as the primary path.",
      built: [
        "Agents write Cypher and check it.",
        "Global-to-local retrieval for questions that span the whole handbook.",
        "Ambiguous questions fall back to a broader semantic search.",
      ],
      limitations: "The query set, scoring rule and denominator were not recorded; this is not Recall@k.",
      changeNow: "Record them.",
    },
    architecture: {
      path: [{ label: "LangGraph", note: "orchestrates" }],
      branches: [
        { label: "Neo4j", note: "structured" },
        { label: "Vector DB", note: "unstructured" },
      ],
    },
  },
  {
    slug: "mirrorfi",
    name: "MirrorFi",
    subtitle: "Solana vault strategy platform",
    date: "2025-05",
    origin: "Hackathon team of 6",
    category: "product",
    group: "archive",
    repo: "https://github.com/Mizore66/MirrorFi",
    tech: ["Next.js", "ShadCN", "MongoDB", "Solana", "Node.js"],
    purpose: "A no-code builder for sharing and executing Solana yield strategies across Drift, Jupiter and Meteora.",
    result: { claimId: "mirrorfiPrize", line: "Grand Prize, Solana Megahack 2025" },
    seo: {
      title: "MirrorFi — Solana vault strategy platform",
      description: "Grand Prize, Solana Megahack 2025: a no-code builder for sharing and executing Solana yield strategies across Drift, Jupiter and Meteora.",
    },
    caseStudy: {
      evidence: ["mirrorfiPrize"],
      team: "Built in a team of 6. What was built below is my part.",
      problem: "Three protocol integrations, and a hand-off that lived in a document.",
      decision: "One schematic that builds, shares, and executes.",
      constraint: "A hackathon weekend.",
      built: [
        "Built the strategy-builder page and its no-code interface, covering Drift, Jupiter and Meteora.",
        "Designed the MongoDB schema that stores user-made strategies so others can share and copy them.",
      ],
      limitations: "The public repository is the remaining artifact.",
    },
  },
  {
    slug: "financial-risk-predictor",
    name: "Financial Risk Predictor",
    subtitle: "ML risk assessment",
    date: "2025-07",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["TensorFlow", "XGBoost", "LightGBM", "BentoML", "SHAP", "Kafka"],
    purpose: "Daily credit-risk scores that have to be interpreted, served, and retrained.",
    result: { claimId: "riskAuc", line: "0.87 AUC-ROC" },
    seo: {
      title: "Financial Risk Predictor — ML risk assessment",
      description: "Kafka feeds the daily tape. LightGBM and XGBoost score it at 0.87 AUC-ROC. SHAP writes why. BentoML serves the number.",
    },
    caseStudy: {
      evidence: ["riskAuc"],
      problem: "Daily credit scores that a desk has to interpret, serve, and retrain — not a notebook that dies after the plot.",
      decision:
        "LightGBM and XGBoost, with SHAP explaining each score, served through BentoML. Kafka carries a daily retrain without taking the API down.",
      rejected: "A single offline notebook.",
      limitations: "Dataset size, split, leakage controls and prevalence were not recorded.",
    },
    architecture: {
      path: [{ label: "Kafka" }, { label: "LightGBM / XGBoost" }, { label: "BentoML" }],
      beside: [{ label: "SHAP", note: "explains each score" }],
    },
  },
  {
    slug: "distributed-lead-scorer",
    name: "Distributed Lead Scorer",
    subtitle: "Large-scale data mining pipeline",
    date: "2025-05",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["PySpark", "PyTorch DDP", "Deep Interest Network"],
    purpose: "Scores conversion on a hundred million events a day, with checkpoints so a failed hour can resume.",
    result: { claimId: "leadThroughput", line: "100M-event capacity benchmark" },
    seo: {
      title: "Distributed Lead Scorer — Large-scale data mining pipeline",
      description: "Capacity-benchmarked at 100M events/day. A Deep Interest Network on PyTorch DDP scores conversion. Checkpoints resume from the last completed slice.",
    },
    caseStudy: {
      evidence: ["leadThroughput"],
      decision: "PySpark for features, and a Deep Interest Network on PyTorch DDP for scoring.",
      constraint: "A failed hour resumes from the last completed slice.",
      rejected: "Restarting the whole hour.",
      limitations: "Cluster size, input distribution and runtime were not recorded.",
    },
    architecture: {
      path: [
        { label: "PySpark", note: "features" },
        { label: "PyTorch DDP", note: "Deep Interest Network" },
      ],
    },
  },
  {
    slug: "slm-distillation-engine",
    name: "SLM Distillation Engine",
    subtitle: "Knowledge distillation and fine-tuning",
    date: "2025-07",
    origin: "Lab experiment",
    category: "ml",
    group: "lab",
    tech: ["PyTorch", "QLoRA", "DeepSpeed", "FlashAttention"],
    purpose: "A 70B teacher distilled into a 3B student with QLoRA, DeepSpeed and FlashAttention.",
    result: { claimId: "slmInference", line: "70B → 3B student" },
    seo: {
      title: "SLM Distillation Engine — Knowledge distillation and fine-tuning",
      description: "A 70B teacher writes the traces; QLoRA, DeepSpeed and FlashAttention compress them into a 3B student. No speed-up claimed.",
    },
    caseStudy: {
      evidence: ["slmInference"],
      notes: [SLM_LATENCY_NOTE],
      built: ["A 70B teacher distilled into a 3B student using QLoRA, DeepSpeed and FlashAttention."],
      limitations: "No speed-up is claimed, because tokens/second, hardware and batch size were not measured.",
    },
  },
];
