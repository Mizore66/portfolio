import { compiledMainlinePgn, ledgerChessNotes } from "@/lib/cms/chess-notes";
import { ledgerLab } from "@/lib/cms/lab-copy";
import { companyAnchor } from "@/lib/anchors";
import { resumeData } from "@/lib/data";
import { METRICS, POSITIONING } from "@/lib/metrics";
import { SITE_REVISED, type CmsClaim, type CmsEducation, type CmsExperience, type CmsProjectCopy, type SiteDocument } from "@/lib/cms/types";

function claim(
  id: string,
  metric: {
    display: string;
    value: string;
    unit: string;
    kind: CmsClaim["kind"];
    owner: string;
    note?: string;
  },
  extra: Partial<CmsClaim>,
): CmsClaim {
  return {
    id,
    display: metric.display,
    value: metric.value,
    unit: metric.unit,
    kind: metric.kind,
    owner: metric.owner,
    method: extra.method ?? "",
    baseline: extra.baseline ?? "",
    sample: extra.sample ?? metric.note ?? "",
    environment: extra.environment ?? "",
    date: extra.date ?? "",
    caveat: extra.caveat ?? metric.note ?? "",
    denominator: extra.denominator ?? "",
    source: extra.source ?? "",
    sourceUrl: extra.sourceUrl ?? "",
    linkedProject: extra.linkedProject ?? "",
    heroEligible: extra.heroEligible ?? false,
    archived: extra.archived ?? false,
    surfaces: extra.surfaces ?? (extra.heroEligible ? ["home", "opening", "resume"] : ["opening", "resume", "exhibit"]),
  };
}

function field(project: (typeof resumeData.projects)[number], key: keyof CmsProjectCopy): string {
  return key in project && typeof project[key as keyof typeof project] === "string"
    ? String(project[key as keyof typeof project])
    : "";
}

function formatLayers(layers?: { name: string; role: string }[]): string {
  return (layers ?? []).map((layer) => `${layer.name} — ${layer.role}`).join("\n");
}

function claimsForProject(slug: string): string[] {
  if (slug === "veridian") return ["veridianUptime", "veridianEmissions"];
  if (slug === "distributed-lead-scorer") return ["leadThroughput"];
  if (slug === "slm-distillation-engine") return ["slmInference"];
  if (slug === "financial-risk-predictor") return ["riskAuc"];
  if (slug === "multi-agent-graphrag") return ["graphragRetrieval"];
  return [];
}

function projectCopies(): CmsProjectCopy[] {
  return resumeData.projects.map((project) => ({
    slug: project.slug,
    title: project.name,
    subtitle: project.subtitle,
    date: project.date,
    category: project.slug === "circuitmindai" || project.slug === "mirrorfi" ? "Product / backend" : "ML / data systems",
    tech: project.tech.join(", "),
    github: project.github,
    seoTitle: `${project.name} — ${project.subtitle}`,
    seoDescription: project.meta,
    purpose: project.purpose,
    impact: project.impact,
    why: field(project, "why"),
    judgment: field(project, "judgment"),
    constraint: field(project, "constraint"),
    limitation: field(project, "limitation"),
    example: field(project, "example"),
    rejected: field(project, "rejected"),
    retrospective: field(project, "retrospective"),
    bullets: project.bullets.join("\n"),
    description: project.description,
    plate: project.plate,
    plateCaption: project.plateCaption,
    plateAlt: project.plateAlt,
    apparatusName: project.apparatus.name,
    apparatusRuntime: project.apparatus.runtime ?? "",
    apparatusPath: formatLayers(project.apparatus.path),
    apparatusBeside: formatLayers(project.apparatus.beside),
    claimIds: claimsForProject(project.slug),
    archived: false,
  }));
}

function experienceCopies(): CmsExperience[] {
  return resumeData.experience.map((job) => ({
    id: companyAnchor(job.company),
    employer: job.company,
    role: job.title,
    type: "type" in job && job.type ? String(job.type) : "",
    period: job.period,
    tech: job.tech.join(", "),
    ownership: "scope" in job && job.scope ? String(job.scope) : "",
    bullets: job.bullets.join("\n"),
    impact: job.impact,
    archived: false,
  }));
}

function educationCopies(): CmsEducation[] {
  const edu = resumeData.education;
  return [
    {
      id: "monash-beng",
      institution: edu.school,
      qualification: edu.degree,
      honours: edu.honours,
      grades: `WAM ${edu.wam} · CGPA ${edu.cgpa}`,
      dates: edu.graduation,
      location: edu.location,
      archived: false,
    },
  ];
}

export function ledgerDocument(): SiteDocument {
  return {
    revisionId: "ledger",
    status: "published",
    publishedAt: SITE_REVISED,
    savedAt: SITE_REVISED,
    restoredFrom: "",
    note: "Published snapshot from the TypeScript ledger.",
    profile: {
      displayName: "Anas T. Qumhiyeh",
      legalName: "Anas Tarek Qumhiyeh",
      dek: POSITIONING.dek,
      tagline: POSITIONING.tagline,
      desksLine: POSITIONING.desksLine,
      howIWork: POSITIONING.howIWork,
      availability: POSITIONING.availability,
      recruiterBio: POSITIONING.recruiterBio,
      followerBio: POSITIONING.followerBio,
      location: "Bandar Sunway, Selangor, Malaysia",
    },
    aspirations: [
      {
        id: "swe-fintech-ml",
        label: POSITIONING.availability,
        active: true,
        start: "2026-05-01",
        end: "",
      },
    ],
    claims: [
      claim("setelDefects", METRICS.setelDefects, {
        method: "Production defect count on checkout and capture",
        environment: "Setel payment engine",
        date: "2025-12",
        caveat: METRICS.setelDefects.note,
        denominator: METRICS.setelDefects.denominator,
        source: "Internship observation on checkout and capture, Jul–Dec 2025",
        heroEligible: true,
      }),
      claim("monashRetrieval", METRICS.monashRetrieval, {
        method: METRICS.monashRetrieval.method,
        baseline: METRICS.monashRetrieval.vs,
        environment: METRICS.monashRetrieval.corpus,
        sample: METRICS.monashRetrieval.sample,
        date: "2026-02",
        denominator: METRICS.monashRetrieval.denominator,
        source: "Monash University contract, Faculty of IT",
        heroEligible: true,
      }),
      claim("leadThroughput", METRICS.leadThroughput, {
        method: "PySpark pipeline capacity",
        sample: METRICS.leadThroughput.note,
        environment: "PySpark pipeline",
        date: "2025-05",
        denominator: METRICS.leadThroughput.denominator,
        source: "Capacity benchmark filing",
        linkedProject: "distributed-lead-scorer",
        heroEligible: true,
      }),
      claim("gateC", METRICS.gateC, {
        method: "SPRT (H0=0 Elo, H1=+10), same search, continued from the 100-game suite",
        baseline: "Handcrafted PeSTO",
        sample: METRICS.gateC.note,
        environment: "50 000 nodes/move",
        date: "2026-09-03",
        denominator: METRICS.gateC.denominator,
        source: METRICS.gateC.source,
        sourceUrl: "/lab/learned-evaluator",
        linkedProject: "",
        heroEligible: true,
        surfaces: ["home", "opening", "resume", "lab"],
      }),
      claim("graphragRetrieval", METRICS.graphragRetrieval, {
        method: METRICS.graphragRetrieval.method,
        baseline: METRICS.graphragRetrieval.vs,
        sample: METRICS.graphragRetrieval.note,
        environment: METRICS.graphragRetrieval.corpus,
        date: "2025-10",
        denominator: "Unfiled — query count, scoring rule, and Recall@k were not published.",
        source: "Independent handbook / policy archive exhibit",
        linkedProject: "multi-agent-graphrag",
      }),
      claim("veridianUptime", METRICS.veridianUptime, {
        method: "Cloud Run evaluation",
        environment: METRICS.veridianUptime.runtime,
        sample: METRICS.veridianUptime.note,
        date: "2026-04",
        denominator: "Unfiled — evaluation period and sample size were not published.",
        source: "Cloud Run evaluation filing",
        linkedProject: "veridian",
      }),
      claim("veridianEmissions", METRICS.veridianEmissions, {
        method: METRICS.veridianEmissions.note,
        sample: "Evaluation period and emissions source were not filed.",
        environment: "Cloud Run",
        date: "2026-04",
        denominator: "Unfiled — evaluation period, sample size, and emissions calculation source were not published.",
        source: "Cloud Run scheduling evaluation",
        linkedProject: "veridian",
      }),
      claim("riskAuc", METRICS.riskAuc, {
        method: "AUC-ROC",
        baseline: METRICS.riskAuc.vs,
        sample: METRICS.riskAuc.note,
        environment: "Offline evaluation",
        date: "2025",
        denominator: "Unfiled — dataset size, split, leakage controls, and positive-class prevalence were not published.",
        source: "Offline evaluation filing",
        linkedProject: "financial-risk-predictor",
      }),
      claim("slmInference", METRICS.slmInference, {
        method: METRICS.slmInference.path,
        sample: METRICS.slmInference.note,
        caveat: "Not claimed as a measured throughput.",
        environment: "DeepSpeed distillation path",
        date: "2025-07",
        denominator: "Unfiled — hardware, batch size, tokens/second, and named quality evaluation were not published.",
        source: "Distillation exhibit filing",
        linkedProject: "slm-distillation-engine",
      }),
      claim("setelCoverage", METRICS.setelCoverage, {
        method: "Unit tests",
        environment: METRICS.setelCoverage.scope,
        date: "2025-12",
        denominator: "Unfiled — checkout and capture test count was not published.",
        source: "Internship observation on checkout and capture, Jul–Dec 2025",
      }),
      claim("wdOversight", METRICS.wdOversight, {
        method: "Lab dashboard observation",
        environment: METRICS.wdOversight.context,
        date: "2025-12",
        denominator: METRICS.wdOversight.denominator,
        source: "Western Digital lab dashboard contract, Feb–Dec 2025",
      }),
    ],
    projects: projectCopies(),
    experience: experienceCopies(),
    education: educationCopies(),
    chess: ledgerChessNotes(),
    chessPgn: compiledMainlinePgn(),
    lab: ledgerLab(),
  };
}

export function activeAvailability(doc: SiteDocument): string {
  const live = doc.aspirations.find((item) => item.active);
  return live?.label ?? doc.profile.availability;
}
