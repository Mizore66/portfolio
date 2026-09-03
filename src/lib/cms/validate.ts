import type { CmsClaim, SiteDocument } from "@/lib/cms/types";
import { resumeData } from "@/lib/data";

export const REQUIRED_CLAIM_IDS = [
  "setelDefects",
  "monashRetrieval",
  "leadThroughput",
  "gateC",
  "veridianUptime",
] as const;

export function claimHeroReady(claim: CmsClaim): string[] {
  const missing: string[] = [];
  if (!claim.method) missing.push("method");
  if (!claim.baseline && !claim.caveat) missing.push("baseline or caveat");
  if (!claim.sample && !claim.caveat) missing.push("sample or caveat");
  if (!claim.environment) missing.push("environment");
  if (!claim.date) missing.push("date");
  return missing;
}

export function claimEvidenceReady(claim: CmsClaim): string[] {
  const missing: string[] = [];
  if (claim.kind === "evaluation" || claim.kind === "benchmark") {
    if (!claim.baseline && !claim.caveat) missing.push("baseline or caveat");
    if (!claim.environment) missing.push("environment");
    if (!claim.caveat) missing.push("limitations");
  }
  return missing;
}

export function validateDocument(doc: SiteDocument): string[] {
  const errors: string[] = [];
  if (!doc.profile.dek) errors.push("Profile role line is required.");
  if (!doc.profile.tagline) errors.push("Profile tagline is required.");
  const ids = new Set<string>();
  for (const claim of doc.claims) {
    if (ids.has(claim.id)) errors.push(`Duplicate claim id ${claim.id}.`);
    ids.add(claim.id);
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
  const knownSlugs = new Set(resumeData.projects.map((p) => p.slug));
  const slugs = new Set<string>();
  for (const project of doc.projects) {
    if (!knownSlugs.has(project.slug)) {
      errors.push(`Unknown project slug ${project.slug}.`);
    }
    if (slugs.has(project.slug)) errors.push(`Duplicate project slug ${project.slug}.`);
    slugs.add(project.slug);
  }
  return errors;
}
