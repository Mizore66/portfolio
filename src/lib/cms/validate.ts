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

export function validateDocument(doc: SiteDocument): string[] {
  const errors: string[] = [];
  if (!doc.profile.dek) errors.push("Profile role line is required.");
  if (!doc.profile.tagline) errors.push("Profile tagline is required.");
  for (const claim of doc.claims) {
    if (!claim.heroEligible) continue;
    const missing = claimHeroReady(claim);
    if (missing.length) {
      errors.push(`${claim.id} is marked heroEligible but missing ${missing.join(", ")}.`);
    }
  }
  return errors;
}
