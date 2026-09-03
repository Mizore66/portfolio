import { resumeData } from "@/lib/data";
import { METRICS, POSITIONING } from "@/lib/metrics";
import { SITE_REVISED, type CmsClaim, type CmsProjectCopy, type SiteDocument } from "@/lib/cms/types";

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

function projectCopies(): CmsProjectCopy[] {
  return resumeData.projects.map((project) => ({
    slug: project.slug,
    purpose: project.purpose,
    impact: project.impact,
    why: field(project, "why"),
    judgment: field(project, "judgment"),
    constraint: field(project, "constraint"),
    limitation: field(project, "limitation"),
    example: field(project, "example"),
    rejected: field(project, "rejected"),
    retrospective: field(project, "retrospective"),
    archived: false,
  }));
}

export function ledgerDocument(): SiteDocument {
  return {
    revisionId: "ledger",
    status: "published",
    publishedAt: SITE_REVISED,
    note: "TypeScript ledger. Publish from /admin to replace this snapshot.",
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
        heroEligible: true,
      }),
      claim("gateC", METRICS.gateC, {
        method: "SPRT (H0=0 Elo, H1=+10), same search, continued from the 100-game suite",
        baseline: "Handcrafted PeSTO",
        sample: METRICS.gateC.note,
        environment: "50 000 nodes/move",
        date: "2026-09-03",
        heroEligible: true,
      }),
      claim("graphragRetrieval", METRICS.graphragRetrieval, {
        method: METRICS.graphragRetrieval.method,
        baseline: METRICS.graphragRetrieval.vs,
        sample: METRICS.graphragRetrieval.note,
        environment: METRICS.graphragRetrieval.corpus,
        date: "2025-10",
      }),
      claim("veridianUptime", METRICS.veridianUptime, {
        method: "Cloud Run evaluation",
        environment: METRICS.veridianUptime.runtime,
        sample: METRICS.veridianUptime.note,
        date: "2026-04",
      }),
      claim("veridianEmissions", METRICS.veridianEmissions, {
        method: METRICS.veridianEmissions.note,
        sample: "Evaluation period and emissions source were not filed.",
        environment: "Cloud Run",
        date: "2026-04",
      }),
      claim("riskAuc", METRICS.riskAuc, {
        method: "AUC-ROC",
        baseline: METRICS.riskAuc.vs,
        sample: METRICS.riskAuc.note,
        environment: "Offline evaluation",
        date: "2025",
      }),
      claim("slmInference", METRICS.slmInference, {
        method: METRICS.slmInference.path,
        sample: METRICS.slmInference.note,
        caveat: "Not claimed as a measured throughput.",
        environment: "DeepSpeed distillation path",
        date: "2025-07",
      }),
      claim("setelCoverage", METRICS.setelCoverage, {
        method: "Unit tests",
        environment: METRICS.setelCoverage.scope,
        date: "2025-12",
      }),
      claim("wdOversight", METRICS.wdOversight, {
        method: "Lab dashboard observation",
        environment: METRICS.wdOversight.context,
        date: "2025-12",
      }),
    ],
    projects: projectCopies(),
  };
}

export function activeAvailability(doc: SiteDocument): string {
  const live = doc.aspirations.find((item) => item.active);
  return live?.label ?? doc.profile.availability;
}
