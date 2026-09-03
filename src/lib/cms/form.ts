import { LEDGER_EXPERIENCE_IDS, LEDGER_PROJECT_SLUGS, REQUIRED_CLAIM_IDS } from "@/lib/cms/validate";
import type { ClaimKind, CmsAspiration, CmsClaim, CmsEducation, CmsExperience, CmsProjectCopy, SiteDocument } from "@/lib/cms/types";

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

function blankProject(slug: string): CmsProjectCopy {
  return {
    slug,
    title: "New exhibit",
    subtitle: "",
    date: "",
    category: "ML / data systems",
    tech: "",
    github: "",
    seoTitle: "",
    seoDescription: "",
    purpose: "",
    impact: "",
    why: "",
    judgment: "",
    constraint: "",
    limitation: "",
    example: "",
    rejected: "",
    retrospective: "",
    bullets: "",
    description: "",
    plate: "",
    plateCaption: "",
    plateAlt: "",
    apparatusName: "",
    apparatusRuntime: "",
    apparatusPath: "",
    apparatusBeside: "",
    archived: true,
  };
}

function blankAspiration(id: string): CmsAspiration {
  return { id, label: "New aspiration", active: false, start: "", end: "" };
}

function blankExperience(id: string): CmsExperience {
  return {
    id,
    employer: "New employer",
    role: "Role",
    type: "Contract",
    period: "",
    tech: "",
    ownership: "",
    bullets: "",
    impact: "",
    archived: true,
  };
}

function blankEducation(id: string): CmsEducation {
  return {
    id,
    institution: "New institution",
    qualification: "",
    honours: "",
    grades: "",
    dates: "",
    location: "",
    archived: false,
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function uniqueCopyId(base: string, taken: (id: string) => boolean): string {
  let nextId = `${base}-copy`;
  let n = 2;
  while (taken(nextId)) {
    nextId = `${base}-copy-${n}`;
    n += 1;
  }
  return nextId;
}

function sortByOrder<T>(rows: T[], order: string, id: (row: T) => string): T[] {
  if (!order) return rows;
  const ids = order.split(",").map((part) => part.trim()).filter(Boolean);
  return [...rows].sort((a, b) => {
    const ai = ids.indexOf(id(a));
    const bi = ids.indexOf(id(b));
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
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

  let aspirations = formData.has("aspirations-present")
    ? current.aspirations.map((item) => ({
        ...item,
        label: text(formData, `asp-${item.id}-label`, item.label),
        active: on(formData, `asp-${item.id}-active`),
        start: text(formData, `asp-${item.id}-start`, item.start),
        end: text(formData, `asp-${item.id}-end`, item.end),
      }))
    : current.aspirations;

  if (formData.has("aspirations-present")) {
    const createAsp = slugify(text(formData, "asp-new-id", ""));
    if (formData.get("asp-create") === "1" && createAsp && !aspirations.some((item) => item.id === createAsp)) {
      aspirations = [...aspirations, blankAspiration(createAsp)];
    }
    const duplicateAsp = String(formData.get("asp-duplicate") ?? "");
    if (duplicateAsp) {
      const src = aspirations.find((item) => item.id === duplicateAsp);
      if (src) {
        const nextId = uniqueCopyId(src.id, (id) => aspirations.some((item) => item.id === id));
        aspirations = [...aspirations, { ...src, id: nextId, active: false }];
      }
    }
    const deleteAsp = String(formData.get("asp-delete") ?? "");
    if (deleteAsp) {
      aspirations = aspirations.filter((item) => item.id !== deleteAsp);
    }
    aspirations = sortByOrder(aspirations, text(formData, "asp-order", ""), (item) => item.id);
  }

  let experience = formData.has("experience-present")
    ? (current.experience ?? []).map((row) => ({
        ...row,
        employer: text(formData, `exp-${row.id}-employer`, row.employer),
        role: text(formData, `exp-${row.id}-role`, row.role),
        type: text(formData, `exp-${row.id}-type`, row.type),
        period: text(formData, `exp-${row.id}-period`, row.period),
        tech: text(formData, `exp-${row.id}-tech`, row.tech),
        ownership: text(formData, `exp-${row.id}-ownership`, row.ownership),
        bullets: text(formData, `exp-${row.id}-bullets`, row.bullets),
        impact: text(formData, `exp-${row.id}-impact`, row.impact),
        archived: on(formData, `exp-${row.id}-archived`),
      }))
    : (current.experience ?? []);

  if (formData.has("experience-present")) {
    const createExp = slugify(text(formData, "exp-new-id", "") || text(formData, "exp-new-employer", "")).toLowerCase();
    if (formData.get("exp-create") === "1" && createExp && !experience.some((row) => row.id === createExp)) {
      const created = blankExperience(createExp);
      created.employer = text(formData, "exp-new-employer", created.employer);
      created.role = text(formData, "exp-new-role", created.role);
      experience = [...experience, created];
    }
    const duplicateExp = String(formData.get("exp-duplicate") ?? "");
    if (duplicateExp) {
      const src = experience.find((row) => row.id === duplicateExp);
      if (src) {
        const nextId = uniqueCopyId(src.id, (id) => experience.some((row) => row.id === id));
        experience = [...experience, { ...src, id: nextId, archived: true }];
      }
    }
    const deleteExp = String(formData.get("exp-delete") ?? "");
    if (deleteExp && !LEDGER_EXPERIENCE_IDS.has(deleteExp)) {
      experience = experience.filter((row) => row.id !== deleteExp);
    }
    if (deleteExp && LEDGER_EXPERIENCE_IDS.has(deleteExp)) {
      experience = experience.map((row) => (row.id === deleteExp ? { ...row, archived: true } : row));
    }
    experience = sortByOrder(experience, text(formData, "exp-order", ""), (row) => row.id);
  }

  let education = formData.has("education-present")
    ? (current.education ?? []).map((row) => ({
        ...row,
        institution: text(formData, `edu-${row.id}-institution`, row.institution),
        qualification: text(formData, `edu-${row.id}-qualification`, row.qualification),
        honours: text(formData, `edu-${row.id}-honours`, row.honours),
        grades: text(formData, `edu-${row.id}-grades`, row.grades),
        dates: text(formData, `edu-${row.id}-dates`, row.dates),
        location: text(formData, `edu-${row.id}-location`, row.location),
        archived: on(formData, `edu-${row.id}-archived`),
      }))
    : (current.education ?? []);

  if (formData.has("education-present")) {
    const createEdu = slugify(text(formData, "edu-new-id", "") || text(formData, "edu-new-institution", "")).toLowerCase();
    if (formData.get("edu-create") === "1" && createEdu && !education.some((row) => row.id === createEdu)) {
      const created = blankEducation(createEdu);
      created.institution = text(formData, "edu-new-institution", created.institution);
      education = [...education, created];
    }
    const duplicateEdu = String(formData.get("edu-duplicate") ?? "");
    if (duplicateEdu) {
      const src = education.find((row) => row.id === duplicateEdu);
      if (src) {
        const nextId = uniqueCopyId(src.id, (id) => education.some((row) => row.id === id));
        education = [...education, { ...src, id: nextId, archived: true }];
      }
    }
    const deleteEdu = String(formData.get("edu-delete") ?? "");
    if (deleteEdu && deleteEdu !== "monash-beng") {
      education = education.filter((row) => row.id !== deleteEdu);
    }
    education = sortByOrder(education, text(formData, "edu-order", ""), (row) => row.id);
  }

  let projects = formData.has("projects-present")
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
        bullets: text(formData, `project-${project.slug}-bullets`, project.bullets),
        description: text(formData, `project-${project.slug}-description`, project.description),
        plate: text(formData, `project-${project.slug}-plate`, project.plate),
        plateCaption: text(formData, `project-${project.slug}-plateCaption`, project.plateCaption),
        plateAlt: text(formData, `project-${project.slug}-plateAlt`, project.plateAlt),
        apparatusName: text(formData, `project-${project.slug}-apparatusName`, project.apparatusName),
        apparatusRuntime: text(formData, `project-${project.slug}-apparatusRuntime`, project.apparatusRuntime),
        apparatusPath: text(formData, `project-${project.slug}-apparatusPath`, project.apparatusPath),
        apparatusBeside: text(formData, `project-${project.slug}-apparatusBeside`, project.apparatusBeside),
        archived: on(formData, `project-${project.slug}-archived`),
      }))
    : current.projects;

  if (formData.has("projects-present")) {
    const createTitle = text(formData, "project-new-title", "");
    const createSlug = slugify(text(formData, "project-new-slug", "") || createTitle).toLowerCase();
    if (formData.get("project-create") === "1" && createSlug && !projects.some((project) => project.slug === createSlug)) {
      projects = [...projects, { ...blankProject(createSlug), title: createTitle || "New exhibit" }];
    }
    const duplicateSlug = String(formData.get("project-duplicate") ?? "");
    if (duplicateSlug) {
      const src = projects.find((project) => project.slug === duplicateSlug);
      if (src) {
        const nextId = uniqueCopyId(src.slug, (id) => projects.some((project) => project.slug === id)).toLowerCase();
        projects = [...projects, { ...src, slug: nextId, title: `${src.title} copy`, archived: true }];
      }
    }
    const deleteSlug = String(formData.get("project-delete") ?? "");
    if (deleteSlug && !LEDGER_PROJECT_SLUGS.has(deleteSlug)) {
      projects = projects.filter((project) => project.slug !== deleteSlug);
    }
    projects = sortByOrder(projects, text(formData, "project-order", ""), (project) => project.slug);
  }

  return {
    ...current,
    note: text(formData, "note", current.note),
    profile,
    claims,
    aspirations,
    projects,
    experience,
    education,
  };
}

export function expectedRevisionIdFrom(formData: FormData): string {
  return String(formData.get("expectedRevisionId") ?? "");
}

export function projectField(project: CmsProjectCopy, key: keyof CmsProjectCopy): string {
  return String(project[key] ?? "");
}
