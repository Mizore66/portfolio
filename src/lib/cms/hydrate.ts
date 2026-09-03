import { ledgerDocument } from "@/lib/cms/ledger";
import type { CmsAspiration, CmsClaim, CmsProjectCopy, CmsProfile, SiteDocument } from "@/lib/cms/types";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function hydrateClaim(seed: CmsClaim, row: Partial<CmsClaim> | undefined): CmsClaim {
  if (!row) return { ...seed, archived: seed.archived ?? false, sourceUrl: seed.sourceUrl ?? "" };
  return {
    ...seed,
    ...row,
    id: seed.id,
    archived: bool(row.archived, seed.archived ?? false),
    heroEligible: bool(row.heroEligible, seed.heroEligible),
    surfaces: Array.isArray(row.surfaces) ? row.surfaces : seed.surfaces,
    denominator: str(row.denominator, seed.denominator),
    source: str(row.source, seed.source),
    sourceUrl: str(row.sourceUrl, seed.sourceUrl),
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
  };
}

/** Fill missing rows/flags from the TypeScript ledger so older revisions stay editable. */
export function hydrateDocument(doc: SiteDocument): SiteDocument {
  const ledger = ledgerDocument();
  const claimsById = new Map(doc.claims.map((claim) => [claim.id, claim]));
  const extraClaims = doc.claims.filter((claim) => !ledger.claims.some((seed) => seed.id === claim.id));
  const projectsBySlug = new Map(doc.projects.map((project) => [project.slug, project]));
  const extraProjects = doc.projects.filter(
    (project) => !ledger.projects.some((seed) => seed.slug === project.slug),
  );
  return {
    ...doc,
    savedAt: str(doc.savedAt, doc.publishedAt),
    restoredFrom: str(doc.restoredFrom, ""),
    profile: hydrateProfile(ledger.profile, doc.profile),
    claims: [
      ...ledger.claims.map((seed) => hydrateClaim(seed, claimsById.get(seed.id))),
      ...extraClaims.map((claim) => hydrateClaim({ ...claim, sourceUrl: claim.sourceUrl ?? "" }, claim)),
    ],
    projects: [
      ...ledger.projects.map((seed) => hydrateProject(seed, projectsBySlug.get(seed.slug))),
      ...extraProjects.map((project) => hydrateProject(project, project)),
    ],
    aspirations: Array.isArray(doc.aspirations)
      ? doc.aspirations.map((item) => {
          const seed = ledger.aspirations.find((row) => row.id === item.id);
          return hydrateAspiration(seed ?? item, item);
        })
      : ledger.aspirations,
  };
}
