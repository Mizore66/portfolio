import type { CmsClaim, SiteDocument } from "@/lib/cms/types";

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
    const epistemic = claimEvidenceReady(claim);
    if (epistemic.length) {
      errors.push(`${claim.id} is a ${claim.kind} claim missing ${epistemic.join(", ")}.`);
    }
  }
  return errors;
}
