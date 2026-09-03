import { ledgerDocument } from "@/lib/cms/ledger";
import type {
  CmsAspiration,
  CmsChessNote,
  CmsClaim,
  CmsEducation,
  CmsExperience,
  CmsLabCopy,
  CmsProfile,
  CmsProjectCopy,
  SiteDocument,
} from "@/lib/cms/types";

const SURFACES: CmsClaim["surfaces"][number][] = ["home", "opening", "resume", "exhibit", "lab"];

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Empty strings are missing fields. Hero packets fall back to the TypeScript ledger. */
function filed(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim() ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function surfaces(value: unknown, fallback: CmsClaim["surfaces"]): CmsClaim["surfaces"] {
  if (!Array.isArray(value)) return fallback;
  const next = value.filter((item): item is CmsClaim["surfaces"][number] =>
    SURFACES.includes(item as CmsClaim["surfaces"][number]),
  );
  return next.length ? next : fallback;
}

function hydrateClaim(seed: CmsClaim, row: Partial<CmsClaim> | undefined): CmsClaim {
  if (!row) return { ...seed, archived: seed.archived ?? false, sourceUrl: seed.sourceUrl ?? "", linkedProject: seed.linkedProject ?? "" };
  return {
    ...seed,
    ...row,
    id: seed.id,
    archived: bool(row.archived, seed.archived ?? false),
    heroEligible: bool(row.heroEligible, seed.heroEligible),
    surfaces: surfaces(row.surfaces, seed.surfaces),
    method: filed(row.method, seed.method),
    baseline: str(row.baseline, seed.baseline),
    sample: str(row.sample, seed.sample),
    environment: filed(row.environment, seed.environment),
    date: filed(row.date, seed.date),
    caveat: str(row.caveat, seed.caveat),
    denominator: filed(row.denominator, seed.denominator),
    source: filed(row.source, seed.source),
    sourceUrl: str(row.sourceUrl, seed.sourceUrl),
    linkedProject: str(row.linkedProject, seed.linkedProject ?? ""),
  };
}

function hydrateProject(seed: CmsProjectCopy, row: Partial<CmsProjectCopy> | undefined): CmsProjectCopy {
  if (!row) {
    return {
      ...seed,
      archived: seed.archived ?? false,
      bullets: seed.bullets ?? "",
      description: seed.description ?? "",
      plate: seed.plate ?? "",
      plateCaption: seed.plateCaption ?? "",
      plateAlt: seed.plateAlt ?? "",
      apparatusName: seed.apparatusName ?? "",
      apparatusRuntime: seed.apparatusRuntime ?? "",
      apparatusPath: seed.apparatusPath ?? "",
      apparatusBeside: seed.apparatusBeside ?? "",
      claimIds: seed.claimIds ?? [],
    };
  }
  return {
    ...seed,
    ...row,
    slug: seed.slug,
    archived: bool(row.archived, seed.archived ?? false),
    title: str(row.title, seed.title),
    subtitle: str(row.subtitle, seed.subtitle),
    date: str(row.date, seed.date),
    category: str(row.category, seed.category),
    tech: str(row.tech, seed.tech),
    github: str(row.github, seed.github),
    seoTitle: str(row.seoTitle, seed.seoTitle),
    seoDescription: str(row.seoDescription, seed.seoDescription),
    rejected: str(row.rejected, seed.rejected),
    retrospective: str(row.retrospective, seed.retrospective),
    bullets: str(row.bullets, seed.bullets ?? ""),
    description: str(row.description, seed.description ?? ""),
    plate: str(row.plate, seed.plate ?? ""),
    plateCaption: str(row.plateCaption, seed.plateCaption ?? ""),
    plateAlt: str(row.plateAlt, seed.plateAlt ?? ""),
    apparatusName: str(row.apparatusName, seed.apparatusName ?? ""),
    apparatusRuntime: str(row.apparatusRuntime, seed.apparatusRuntime ?? ""),
    apparatusPath: str(row.apparatusPath, seed.apparatusPath ?? ""),
    apparatusBeside: str(row.apparatusBeside, seed.apparatusBeside ?? ""),
    claimIds: Array.isArray(row.claimIds)
      ? row.claimIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim()))
      : (seed.claimIds ?? []),
  };
}

function hydrateProfile(seed: CmsProfile, row: Partial<CmsProfile> | undefined): CmsProfile {
  if (!row) return { ...seed };
  return {
    displayName: str(row.displayName, seed.displayName),
    legalName: str(row.legalName, seed.legalName),
    dek: str(row.dek, seed.dek),
    tagline: str(row.tagline, seed.tagline),
    desksLine: str(row.desksLine, seed.desksLine),
    howIWork: str(row.howIWork, seed.howIWork),
    availability: str(row.availability, seed.availability),
    recruiterBio: str(row.recruiterBio, seed.recruiterBio),
    followerBio: str(row.followerBio, seed.followerBio),
    location: str(row.location, seed.location),
  };
}

function hydrateAspiration(seed: CmsAspiration, row: Partial<CmsAspiration> | undefined): CmsAspiration {
  if (!row) return { ...seed };
  return {
    ...seed,
    ...row,
    id: seed.id,
    active: bool(row.active, seed.active),
    label: str(row.label, seed.label),
    start: str(row.start, seed.start),
    end: str(row.end, seed.end),
  };
}

function hydrateExperience(seed: CmsExperience, row: Partial<CmsExperience> | undefined): CmsExperience {
  if (!row) return { ...seed };
  return {
    ...seed,
    ...row,
    id: seed.id,
    employer: str(row.employer, seed.employer),
    role: str(row.role, seed.role),
    type: str(row.type, seed.type),
    period: str(row.period, seed.period),
    tech: str(row.tech, seed.tech),
    ownership: str(row.ownership, seed.ownership),
    bullets: str(row.bullets, seed.bullets),
    impact: str(row.impact, seed.impact),
    archived: bool(row.archived, seed.archived),
  };
}

function hydrateEducation(seed: CmsEducation, row: Partial<CmsEducation> | undefined): CmsEducation {
  if (!row) return { ...seed };
  return {
    ...seed,
    ...row,
    id: seed.id,
    institution: str(row.institution, seed.institution),
    qualification: str(row.qualification, seed.qualification),
    honours: str(row.honours, seed.honours),
    grades: str(row.grades, seed.grades),
    dates: str(row.dates, seed.dates),
    location: str(row.location, seed.location),
    archived: bool(row.archived, seed.archived),
  };
}

function hydrateChessNote(seed: CmsChessNote, row: Partial<CmsChessNote> | undefined): CmsChessNote {
  if (!row) return { ...seed };
  const kinds: CmsChessNote["entityKind"][] = ["experience", "education", "project", "lab", "outlook", ""];
  const entityKind = kinds.includes(row.entityKind as CmsChessNote["entityKind"])
    ? (row.entityKind as CmsChessNote["entityKind"])
    : seed.entityKind;
  return {
    ...seed,
    fact: str(row.fact, seed.fact),
    commentary: str(row.commentary, seed.commentary),
    featured: bool(row.featured, seed.featured),
    entityKind,
    entityId: str(row.entityId, seed.entityId),
  };
}

function hydrateLab(seed: CmsLabCopy, row: Partial<CmsLabCopy> | undefined): CmsLabCopy {
  if (!row) return { ...seed };
  return {
    hed: filed(row.hed, seed.hed),
    dek: filed(row.dek, seed.dek),
    teaser: filed(row.teaser, seed.teaser),
    meta: filed(row.meta, seed.meta),
    resultJoke: filed(row.resultJoke, seed.resultJoke),
    hypothesisHed: filed(row.hypothesisHed, seed.hypothesisHed),
    hypothesis: filed(row.hypothesis, seed.hypothesis),
    experimentHed: filed(row.experimentHed, seed.experimentHed),
    experiment: filed(row.experiment, seed.experiment),
    failedHed: filed(row.failedHed, seed.failedHed),
    failed: filed(row.failed, seed.failed),
    learnedHed: filed(row.learnedHed, seed.learnedHed),
    learned: filed(row.learned, seed.learned),
  };
}

function fallbackDocument(raw: unknown, ledger: SiteDocument): SiteDocument {
  const row = raw && typeof raw === "object" ? (raw as Partial<SiteDocument>) : {};
  return {
    ...ledger,
    revisionId: str(row.revisionId, "unreadable"),
    status: row.status === "draft" || row.status === "published" ? row.status : ledger.status,
    publishedAt: str(row.publishedAt, ledger.publishedAt),
    savedAt: str(row.savedAt, ledger.savedAt),
    note: `Unreadable snapshot (${str(row.revisionId, "unknown")}). Showing the TypeScript ledger for this row.`,
  };
}

/** Paths filled from the TypeScript ledger because the stored snapshot left them blank. */
export function evidenceBackfillPaths(raw: unknown, hydrated: SiteDocument): string[] {
  if (!raw || typeof raw !== "object") return [];
  const claims = (raw as { claims?: unknown }).claims;
  if (!Array.isArray(claims)) return [];
  const paths: string[] = [];
  for (const claim of hydrated.claims) {
    const before = claims.find((row) => row && typeof row === "object" && (row as CmsClaim).id === claim.id) as
      | Partial<CmsClaim>
      | undefined;
    if (!before) continue;
    for (const field of ["source", "denominator", "method", "environment", "date"] as const) {
      const was = typeof before[field] === "string" ? before[field].trim() : "";
      if (!was && claim[field].trim()) paths.push(`${claim.id}.${field}`);
    }
  }
  return paths;
}

/** Fill missing rows/flags from the TypeScript ledger so older revisions stay editable. */
export function hydrateDocument(input: unknown): SiteDocument {
  const ledger = ledgerDocument();
  try {
    if (!input || typeof input !== "object") return { ...ledger };
    const doc = input as Partial<SiteDocument>;
    const claims = Array.isArray(doc.claims) ? doc.claims : [];
    const projects = Array.isArray(doc.projects) ? doc.projects : [];
    const aspirations = Array.isArray(doc.aspirations) ? doc.aspirations : [];
    const experience = Array.isArray(doc.experience) ? doc.experience : [];
    const education = Array.isArray(doc.education) ? doc.education : [];
    const claimsById = new Map(claims.map((claim) => [claim.id, claim]));
    const extraClaims = claims.filter((claim) => claim?.id && !ledger.claims.some((seed) => seed.id === claim.id));
    const projectsBySlug = new Map(projects.map((project) => [project.slug, project]));
    const extraProjects = projects.filter(
      (project) => project?.slug && !ledger.projects.some((seed) => seed.slug === project.slug),
    );
    const experienceById = new Map(experience.map((row) => [row.id, row]));
    const extraExperience = experience.filter(
      (row) => row?.id && !ledger.experience.some((seed) => seed.id === row.id),
    );
    const educationById = new Map(education.map((row) => [row.id, row]));
    const extraEducation = education.filter((row) => row?.id && !ledger.education.some((seed) => seed.id === row.id));
    const chessById = new Map(
      (Array.isArray(doc.chess) ? doc.chess : []).map((row) => [row.id, row] as const),
    );
    return {
      ...ledger,
      ...doc,
      revisionId: str(doc.revisionId, ledger.revisionId),
      status: doc.status === "draft" || doc.status === "published" ? doc.status : ledger.status,
      publishedAt: str(doc.publishedAt, ledger.publishedAt),
      savedAt: filed(doc.savedAt, str(doc.publishedAt, ledger.savedAt)),
      restoredFrom: str(doc.restoredFrom, ""),
      note: str(doc.note, ledger.note),
      profile: hydrateProfile(ledger.profile, doc.profile),
      claims: [
        ...ledger.claims.map((seed) => hydrateClaim(seed, claimsById.get(seed.id))),
        ...extraClaims.map((claim) =>
          hydrateClaim(
            {
              ...claim,
              surfaces: surfaces(claim.surfaces, ["exhibit"]),
              sourceUrl: claim.sourceUrl ?? "",
              linkedProject: claim.linkedProject ?? "",
              archived: claim.archived ?? false,
            },
            claim,
          ),
        ),
      ],
      projects: [
        ...ledger.projects.map((seed) => hydrateProject(seed, projectsBySlug.get(seed.slug))),
        ...extraProjects.map((project) => hydrateProject(project, project)),
      ],
      aspirations: Array.isArray(doc.aspirations)
        ? aspirations
            .filter((item) => item?.id)
            .map((item) => {
              const seed = ledger.aspirations.find((row) => row.id === item.id);
              return hydrateAspiration(seed ?? item, item);
            })
        : ledger.aspirations,
      experience: [
        ...ledger.experience.map((seed) => hydrateExperience(seed, experienceById.get(seed.id))),
        ...extraExperience.map((row) => hydrateExperience(row, row)),
      ],
      education: [
        ...ledger.education.map((seed) => hydrateEducation(seed, educationById.get(seed.id))),
        ...extraEducation.map((row) => hydrateEducation(row, row)),
      ],
      chess: ledger.chess.map((seed) => hydrateChessNote(seed, chessById.get(seed.id))),
      chessPgn: filed(doc.chessPgn, ledger.chessPgn),
      lab: hydrateLab(ledger.lab, doc.lab),
    };
  } catch {
    return fallbackDocument(input, ledger);
  }
}
