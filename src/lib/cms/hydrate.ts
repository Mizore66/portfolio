import { ledgerDocument } from "@/lib/cms/ledger";
import type { CmsAspiration, CmsClaim, CmsProjectCopy, CmsProfile, SiteDocument } from "@/lib/cms/types";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function hydrateClaim(seed: CmsClaim, row: Partial<CmsClaim> | undefined): CmsClaim {
  if (!row) return { ...seed, archived: seed.archived ?? false };
  return {
    ...seed,
    ...row,
    id: seed.id,
    archived: bool(row.archived, seed.archived ?? false),
    heroEligible: bool(row.heroEligible, seed.heroEligible),
    surfaces: Array.isArray(row.surfaces) ? row.surfaces : seed.surfaces,
  };
}

function hydrateProject(seed: CmsProjectCopy, row: Partial<CmsProjectCopy> | undefined): CmsProjectCopy {
  if (!row) return { ...seed, archived: seed.archived ?? false };
  return {
    ...seed,
    ...row,
    slug: seed.slug,
    archived: bool(row.archived, seed.archived ?? false),
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
  const aspById = new Map(doc.aspirations.map((item) => [item.id, item]));
  const extraAsp = doc.aspirations.filter((item) => !ledger.aspirations.some((seed) => seed.id === item.id));
  return {
    ...doc,
    profile: hydrateProfile(ledger.profile, doc.profile),
    claims: [
      ...ledger.claims.map((seed) => hydrateClaim(seed, claimsById.get(seed.id))),
      ...extraClaims.map((claim) => hydrateClaim(claim, claim)),
    ],
    projects: [
      ...ledger.projects.map((seed) => hydrateProject(seed, projectsBySlug.get(seed.slug))),
      ...extraProjects.map((project) => hydrateProject(project, project)),
    ],
    aspirations: [
      ...ledger.aspirations.map((seed) => hydrateAspiration(seed, aspById.get(seed.id))),
      ...extraAsp.map((item) => hydrateAspiration(item, item)),
    ],
  };
}
