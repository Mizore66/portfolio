import { REQUIRED_CLAIM_IDS } from "@/lib/cms/validate";
import type { ClaimKind, CmsClaim, CmsProjectCopy, SiteDocument } from "@/lib/cms/types";

const KINDS: ClaimKind[] = ["production", "benchmark", "evaluation", "pipeline", "capability"];
const SURFACES: CmsClaim["surfaces"][number][] = ["home", "opening", "resume", "exhibit", "lab"];

function on(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

function text(formData: FormData, name: string, fallback: string): string {
  const value = formData.get(name);
  return value == null ? fallback : String(value);
}

function composedDate(formData: FormData, prefix: string, fallback: string): string {
  if (!formData.has(`${prefix}-year`)) return text(formData, `${prefix}-date`, fallback);
  const year = String(formData.get(`${prefix}-year`) ?? "").trim();
  if (!year) return "";
  const month = String(formData.get(`${prefix}-month`) ?? "").trim();
  const day = String(formData.get(`${prefix}-day`) ?? "").trim();
  if (!month) return year;
  if (!day) return `${year}-${month.padStart(2, "0")}`;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function claimKind(formData: FormData, id: string, fallback: ClaimKind): ClaimKind {
  const raw = text(formData, `claim-${id}-kind`, fallback);
  return KINDS.includes(raw as ClaimKind) ? (raw as ClaimKind) : fallback;
}

function claimSurfaces(formData: FormData, id: string, fallback: CmsClaim["surfaces"]): CmsClaim["surfaces"] {
  const next = SURFACES.filter((surface) => on(formData, `claim-${id}-surface-${surface}`));
  return next.length ? next : fallback;
}

function blankClaim(id: string): CmsClaim {
  return {
    id,
    display: "New claim",
    value: "",
    unit: "",
    kind: "capability",
    owner: "",
    method: "",
    baseline: "",
    sample: "",
    environment: "",
    date: "",
    caveat: "",
    denominator: "Unfiled.",
    source: "Unfiled.",
    sourceUrl: "",
    heroEligible: false,
    archived: false,
    surfaces: ["exhibit"],
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
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

  let claims = formData.has("claims-present")
    ? current.claims.map((claim) => ({
        ...claim,
        display: text(formData, `claim-${claim.id}-display`, claim.display),
        value: text(formData, `claim-${claim.id}-value`, claim.value),
        unit: text(formData, `claim-${claim.id}-unit`, claim.unit),
        kind: claimKind(formData, claim.id, claim.kind),
        owner: text(formData, `claim-${claim.id}-owner`, claim.owner),
        method: text(formData, `claim-${claim.id}-method`, claim.method),
        baseline: text(formData, `claim-${claim.id}-baseline`, claim.baseline),
        sample: text(formData, `claim-${claim.id}-sample`, claim.sample),
        environment: text(formData, `claim-${claim.id}-environment`, claim.environment),
        date: composedDate(formData, `claim-${claim.id}`, claim.date),
        caveat: text(formData, `claim-${claim.id}-caveat`, claim.caveat),
        denominator: text(formData, `claim-${claim.id}-denominator`, claim.denominator),
        source: text(formData, `claim-${claim.id}-source`, claim.source),
        sourceUrl: text(formData, `claim-${claim.id}-sourceUrl`, claim.sourceUrl),
        heroEligible: on(formData, `claim-${claim.id}-hero`),
        archived: on(formData, `claim-${claim.id}-archived`),
        surfaces: claimSurfaces(formData, claim.id, claim.surfaces),
      }))
    : current.claims;

  const createId = slugify(text(formData, "claim-new-id", ""));
  if (formData.get("claim-create") === "1" && createId && !claims.some((claim) => claim.id === createId)) {
    claims = [...claims, blankClaim(createId)];
  }
  const duplicateId = String(formData.get("claim-duplicate") ?? "");
  if (duplicateId) {
    const src = claims.find((claim) => claim.id === duplicateId);
    if (src) {
      let nextId = `${src.id}-copy`;
      let n = 2;
      while (claims.some((claim) => claim.id === nextId)) {
        nextId = `${src.id}-copy-${n}`;
        n += 1;
      }
      claims = [...claims, { ...src, id: nextId, heroEligible: false, archived: false }];
    }
  }
  const deleteId = String(formData.get("claim-delete") ?? "");
  if (deleteId && !(REQUIRED_CLAIM_IDS as readonly string[]).includes(deleteId)) {
    claims = claims.filter((claim) => claim.id !== deleteId);
  }
  const order = text(formData, "claim-order", "");
  if (order) {
    const ids = order.split(",").map((id) => id.trim()).filter(Boolean);
    claims = [...claims].sort((a, b) => {
      const ai = ids.indexOf(a.id);
      const bi = ids.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }

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
        title: text(formData, `project-${project.slug}-title`, project.title),
        subtitle: text(formData, `project-${project.slug}-subtitle`, project.subtitle),
        date: text(formData, `project-${project.slug}-date`, project.date),
        category: text(formData, `project-${project.slug}-category`, project.category),
        tech: text(formData, `project-${project.slug}-tech`, project.tech),
        github: text(formData, `project-${project.slug}-github`, project.github),
        seoTitle: text(formData, `project-${project.slug}-seoTitle`, project.seoTitle),
        seoDescription: text(formData, `project-${project.slug}-seoDescription`, project.seoDescription),
        purpose: text(formData, `project-${project.slug}-purpose`, project.purpose),
        impact: text(formData, `project-${project.slug}-impact`, project.impact),
        why: text(formData, `project-${project.slug}-why`, project.why),
        judgment: text(formData, `project-${project.slug}-judgment`, project.judgment),
        constraint: text(formData, `project-${project.slug}-constraint`, project.constraint),
        limitation: text(formData, `project-${project.slug}-limitation`, project.limitation),
        example: text(formData, `project-${project.slug}-example`, project.example),
        rejected: text(formData, `project-${project.slug}-rejected`, project.rejected),
        retrospective: text(formData, `project-${project.slug}-retrospective`, project.retrospective),
        archived: on(formData, `project-${project.slug}-archived`),
      }))
    : current.projects;

  const projectOrder = text(formData, "project-order", "");
  const orderedProjects = projectOrder
    ? [...projects].sort((a, b) => {
        const ids = projectOrder.split(",").map((id) => id.trim()).filter(Boolean);
        const ai = ids.indexOf(a.slug);
        const bi = ids.indexOf(b.slug);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
    : projects;

  return {
    ...current,
    note: text(formData, "note", current.note),
    profile,
    claims,
    aspirations,
    projects: orderedProjects,
  };
}

export function expectedRevisionIdFrom(formData: FormData): string {
  return String(formData.get("expectedRevisionId") ?? "");
}

export function projectField(project: CmsProjectCopy, key: keyof CmsProjectCopy): string {
  return String(project[key] ?? "");
}
