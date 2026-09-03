import type { CmsClaim, SiteDocument } from "@/lib/cms/types";
import { resumeData } from "@/lib/data";

export const REQUIRED_CLAIM_IDS = [
  "setelDefects",
  "monashRetrieval",
  "leadThroughput",
  "gateC",
  "veridianUptime",
] as const;

export const HERO_REQUIRED_FIELDS = [
  "method",
  "source",
  "denominator",
  "environment",
  "date",
] as const;

function present(value: string): boolean {
  return value.trim().length > 0;
}

/** Required packet for a homepage proof card. Blank fields fail; “Unfiled …” counts as filed. */
export function claimHeroReady(claim: CmsClaim): string[] {
  const missing: string[] = [];
  if (!present(claim.method)) missing.push("method");
  if (!present(claim.source)) missing.push("source");
  if (!present(claim.denominator)) missing.push("denominator");
  if (!present(claim.environment)) missing.push("environment");
  if (!present(claim.date)) missing.push("date");
  if (!present(claim.baseline) && !present(claim.caveat)) missing.push("baseline or caveat");
  if (!present(claim.sample) && !present(claim.caveat)) missing.push("sample or caveat");
  return missing;
}

export function claimEvidenceReady(claim: CmsClaim): string[] {
  const missing: string[] = [];
  if (claim.kind === "evaluation" || claim.kind === "benchmark") {
    if (!present(claim.baseline) && !present(claim.caveat)) missing.push("baseline or caveat");
    if (!present(claim.environment)) missing.push("environment");
    if (!present(claim.caveat)) missing.push("limitations");
  }
  return missing;
}

export function projectSchemaReady(project: {
  constraint: string;
  rejected: string;
  judgment: string;
}): string[] {
  const missing: string[] = [];
  if (!project.constraint.trim()) missing.push("constraint");
  if (!project.rejected.trim()) missing.push("considered/rejected");
  if (!project.judgment.trim()) missing.push("decision");
  return missing;
}

export const LEDGER_PROJECT_SLUGS = new Set(resumeData.projects.map((project) => project.slug));
export const LEDGER_EXPERIENCE_IDS = new Set(
  resumeData.experience.map((job) => job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")),
);

const DATE = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function wordCount(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function validateDocument(doc: SiteDocument): string[] {
  const errors: string[] = [];
  if (!doc.profile.dek) errors.push("Profile role line is required.");
  if (!doc.profile.tagline) errors.push("Profile tagline is required.");
  if (doc.profile.dek.length > 240) errors.push("Profile role line is too long.");
  const recruiterWords = wordCount(doc.profile.recruiterBio);
  if (recruiterWords < 35 || recruiterWords > 45) {
    errors.push(`Recruiter biography is ${recruiterWords} words; it must be 35–45.`);
  }
  const followerWords = wordCount(doc.profile.followerBio);
  if (followerWords < 100 || followerWords > 140) {
    errors.push(`Follower biography is ${followerWords} words; it must be 100–140.`);
  }
  const ids = new Set<string>();
  for (const claim of doc.claims) {
    if (ids.has(claim.id)) errors.push(`Duplicate claim id ${claim.id}.`);
    ids.add(claim.id);
    if (claim.date && !DATE.test(claim.date)) {
      errors.push(`${claim.id} date must be YYYY, YYYY-MM, or YYYY-MM-DD.`);
    }
    if (claim.heroEligible) {
      const missing = claimHeroReady(claim);
      if (missing.length) {
        errors.push(`${claim.id} is marked heroEligible but missing ${missing.join(", ")}.`);
      }
    }
    if (claim.heroEligible && claim.surfaces && !claim.surfaces.includes("home")) {
      errors.push(`${claim.id} is heroEligible but not allowed on home.`);
    }
    const epistemic = claimEvidenceReady(claim);
    if (epistemic.length) {
      errors.push(`${claim.id} is a ${claim.kind} claim missing ${epistemic.join(", ")}.`);
    }
  }
  for (const id of REQUIRED_CLAIM_IDS) {
    const row = doc.claims.find((claim) => claim.id === id);
    if (!row) {
      errors.push(`Required claim ${id} is missing. Homepage, Opening Preparation, and the résumé still cite it.`);
    } else if (row.archived) {
      errors.push(`Required claim ${id} cannot be archived.`);
    }
  }
  const slugs = new Set<string>();
  for (const project of doc.projects) {
    if (!project.slug || !SLUG.test(project.slug)) {
      errors.push(`Invalid project slug ${project.slug || "(empty)"}.`);
    }
    if (slugs.has(project.slug)) errors.push(`Duplicate project slug ${project.slug}.`);
    slugs.add(project.slug);
  }
  return errors;
}

export function heroPublishBlocked(doc: SiteDocument): string[] {
  return validateDocument(doc).filter(
    (error) => error.includes("heroEligible") || error.includes("Required claim") || error.includes("date must"),
  );
}
