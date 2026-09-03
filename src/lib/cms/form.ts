import type { SiteDocument } from "@/lib/cms/types";

function on(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function text(formData: FormData, name: string, fallback: string): string {
  const value = formData.get(name);
  return value == null ? fallback : String(value);
}

/** Merge a sectioned editor POST onto the current document. Missing sections stay as they are. */
export function applyFormToDocument(formData: FormData, current: SiteDocument): SiteDocument {
  const profile = formData.has("profile-present")
    ? {
        ...current.profile,
        dek: text(formData, "dek", current.profile.dek),
        tagline: text(formData, "tagline", current.profile.tagline),
        desksLine: text(formData, "desksLine", current.profile.desksLine),
        howIWork: text(formData, "howIWork", current.profile.howIWork),
        availability: text(formData, "availability", current.profile.availability),
        recruiterBio: text(formData, "recruiterBio", current.profile.recruiterBio),
        followerBio: text(formData, "followerBio", current.profile.followerBio),
        location: text(formData, "location", current.profile.location),
      }
    : current.profile;

  const claims = formData.has("claims-present")
    ? current.claims.map((claim) => ({
        ...claim,
        display: text(formData, `claim-${claim.id}-display`, claim.display),
        method: text(formData, `claim-${claim.id}-method`, claim.method),
        baseline: text(formData, `claim-${claim.id}-baseline`, claim.baseline),
        sample: text(formData, `claim-${claim.id}-sample`, claim.sample),
        environment: text(formData, `claim-${claim.id}-environment`, claim.environment),
        date: text(formData, `claim-${claim.id}-date`, claim.date),
        caveat: text(formData, `claim-${claim.id}-caveat`, claim.caveat),
        heroEligible: on(formData, `claim-${claim.id}-hero`),
        archived: on(formData, `claim-${claim.id}-archived`),
      }))
    : current.claims;

  const aspirations = formData.has("aspirations-present")
    ? current.aspirations.map((item) => ({
        ...item,
        label: text(formData, `asp-${item.id}-label`, item.label),
        active: on(formData, `asp-${item.id}-active`),
        start: text(formData, `asp-${item.id}-start`, item.start),
        end: text(formData, `asp-${item.id}-end`, item.end),
      }))
    : current.aspirations;

  const projects = formData.has("projects-present")
    ? current.projects.map((project) => ({
        ...project,
        purpose: text(formData, `project-${project.slug}-purpose`, project.purpose),
        impact: text(formData, `project-${project.slug}-impact`, project.impact),
        why: text(formData, `project-${project.slug}-why`, project.why),
        judgment: text(formData, `project-${project.slug}-judgment`, project.judgment),
        constraint: text(formData, `project-${project.slug}-constraint`, project.constraint),
        limitation: text(formData, `project-${project.slug}-limitation`, project.limitation),
        example: text(formData, `project-${project.slug}-example`, project.example),
        archived: on(formData, `project-${project.slug}-archived`),
      }))
    : current.projects;

  return {
    ...current,
    note: text(formData, "note", current.note),
    profile,
    claims,
    aspirations,
    projects,
  };
}
