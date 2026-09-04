import { pgnMatchesRepertoire } from "@/lib/cms/chess-notes";
import { LEDGER_REDIRECT_IDS, isRedirectStatus, isSafeRedirectPath, normalizeRedirectFrom } from "@/lib/cms/redirects";
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

export function present(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
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

function wordCount(value: string | undefined | null): number {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text.split(/\s+/).length : 0;
}

export function validateDocument(doc: SiteDocument): string[] {
  const errors: string[] = [];
  const profile = doc.profile ?? ({} as SiteDocument["profile"]);
  if (!profile.dek) errors.push("Profile role line is required.");
  if (!profile.tagline) errors.push("Profile tagline is required.");
  if ((profile.dek ?? "").length > 240) errors.push("Profile role line is too long.");
  const recruiterWords = wordCount(profile.recruiterBio);
  if (recruiterWords < 35 || recruiterWords > 45) {
    errors.push(`Recruiter biography is ${recruiterWords} words; it must be 35–45.`);
  }
  const followerWords = wordCount(profile.followerBio);
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
  if (doc.chessPgn && !pgnMatchesRepertoire(doc.chessPgn)) {
    errors.push("Chess PGN must keep the Italian Game mainline already compiled on Opening Preparation.");
  }
  if (doc.lab?.hed && !/underperformed PeSTO/.test(doc.lab.hed)) {
    errors.push("Lab headline must keep “underperformed PeSTO” so Gate C cannot be rewritten as a win.");
  }
  if (doc.lab?.teaser && !/underperformed PeSTO/.test(doc.lab.teaser)) {
    errors.push("Lab teaser must keep “underperformed PeSTO” so Gate C cannot be rewritten as a win.");
  }
  const projectSlugs = new Set(doc.projects.map((project) => project.slug));
  const claimIdSet = new Set(doc.claims.map((claim) => claim.id));
  for (const claim of doc.claims) {
    if (claim.linkedProject && !projectSlugs.has(claim.linkedProject)) {
      errors.push(`${claim.id} linked project ${claim.linkedProject} is missing.`);
    }
  }
  for (const project of doc.projects) {
    for (const id of project.claimIds ?? []) {
      if (!claimIdSet.has(id)) errors.push(`${project.slug} references missing claim ${id}.`);
    }
  }
  const froms = new Set<string>();
  for (const row of doc.redirects ?? []) {
    if (!row.id.trim()) errors.push("Redirect is missing an id.");
    if (!isSafeRedirectPath(row.from, "from")) {
      errors.push(`Redirect ${row.id} source must be a same-origin path, not /admin or protocol-relative.`);
    }
    if (!isSafeRedirectPath(row.to, "to")) {
      errors.push(`Redirect ${row.id} target must be a same-origin path, not /admin or an external URL.`);
    }
    if (!isRedirectStatus(row.status)) errors.push(`Redirect ${row.id} status is not 301, 302, 307, or 308.`);
    const key = normalizeRedirectFrom(row.from);
    if (froms.has(key)) errors.push(`Duplicate redirect from ${row.from}.`);
    froms.add(key);
  }
  for (const id of LEDGER_REDIRECT_IDS) {
    if (!(doc.redirects ?? []).some((row) => row.id === id)) {
      errors.push(`Required redirect ${id} is missing.`);
    }
  }
  return errors;
}

export function heroPublishBlocked(doc: SiteDocument): string[] {
  return validateDocument(doc).filter(
    (error) => error.includes("heroEligible") || error.includes("Required claim") || error.includes("date must"),
  );
}
