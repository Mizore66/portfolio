import { METRICS, POSITIONING } from "@/lib/metrics";
import { SITE_REVISED, type CmsClaim, type SiteDocument } from "@/lib/cms/types";

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
    heroEligible: extra.heroEligible ?? false,
    surfaces: extra.surfaces ?? (extra.heroEligible ? ["home", "opening", "resume"] : ["opening", "resume", "exhibit"]),
  };
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
        heroEligible: true,
      }),
      claim("monashRetrieval", METRICS.monashRetrieval, {
        method: METRICS.monashRetrieval.method,
        baseline: METRICS.monashRetrieval.vs,
        environment: METRICS.monashRetrieval.corpus,
        date: "2026-02",
        heroEligible: true,
      }),
      claim("leadThroughput", METRICS.leadThroughput, {
        method: "PySpark pipeline capacity",
        sample: METRICS.leadThroughput.note,
        environment: "PySpark pipeline",
        date: "2025-05",
        heroEligible: true,
      }),
      claim("gateC", METRICS.gateC, {
        method: "Fixed-N match, same search",
        baseline: "Handcrafted PeSTO",
        sample: METRICS.gateC.note,
        environment: "50 000 nodes/move",
        date: "2026-08-29",
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
    projects: [],
  };
}

export function activeAvailability(doc: SiteDocument): string {
  const live = doc.aspirations.find((item) => item.active);
  return live?.label ?? doc.profile.availability;
}
