import type { CmsClaim, CmsProjectCopy, SiteDocument } from "@/lib/cms/types";
import { PROJECT_COPY_KEYS } from "@/lib/cms/types";
import { companyAnchor } from "@/lib/anchors";
import { resumeData } from "@/lib/data";
import { HERO_PROOF } from "@/lib/metrics";
import type { Apparatus, ApparatusLayer } from "@/lib/opening/types";

const COPY_KEYS = PROJECT_COPY_KEYS;

export function liveClaims(doc: SiteDocument): CmsClaim[] {
  return doc.claims.filter((claim) => !claim.archived);
}

export function liveProjects(doc: SiteDocument): CmsProjectCopy[] {
  return doc.projects.filter((project) => !project.archived);
}

export function isProjectArchived(slug: string, doc: SiteDocument): boolean {
  return doc.projects.some((project) => project.slug === slug && project.archived);
}

export function parseApparatusLayers(text: string): ApparatusLayer[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+[—–|-]\s+/);
      const name = (parts[0] ?? "").trim();
      const role = parts.slice(1).join(" — ").trim();
      return { name, role: role || name };
    })
    .filter((layer) => layer.name);
}

function overlayApparatus<T extends { slug: string }>(project: T, copy: CmsProjectCopy): Apparatus | undefined {
  const current =
    "apparatus" in project && project.apparatus && typeof project.apparatus === "object"
      ? (project.apparatus as Apparatus)
      : undefined;
  if (
    !copy.apparatusName.trim() &&
    !copy.apparatusRuntime.trim() &&
    !copy.apparatusPath.trim() &&
    !copy.apparatusBeside.trim()
  ) {
    return current;
  }
  return {
    name: copy.apparatusName.trim() || current?.name || copy.title || project.slug,
    runtime: copy.apparatusRuntime.trim() || current?.runtime,
    path: copy.apparatusPath.trim() ? parseApparatusLayers(copy.apparatusPath) : (current?.path ?? []),
    beside: copy.apparatusBeside.trim() ? parseApparatusLayers(copy.apparatusBeside) : current?.beside,
    forks: current?.forks,
  };
}

export function exhibitFromCopy(copy: CmsProjectCopy) {
  const bullets = copy.bullets
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    slug: copy.slug,
    name: copy.title || copy.slug,
    subtitle: copy.subtitle,
    purpose: copy.purpose,
    date: copy.date,
    tech: copy.tech.split(",").map((part) => part.trim()).filter(Boolean),
    bullets: bullets.length ? bullets : [copy.purpose || "Exhibit filed from the CMS."],
    impact: copy.impact,
    why: copy.why,
    constraint: copy.constraint,
    limitation: copy.limitation,
    example: copy.example,
    rejected: copy.rejected,
    retrospective: copy.retrospective,
    github: copy.github,
    plate: copy.plate,
    plateCaption: copy.plateCaption,
    plateAlt: copy.plateAlt,
    description: copy.description || copy.seoDescription || copy.purpose,
    judgment: copy.judgment,
    meta: copy.seoDescription || copy.purpose,
    seoTitle: copy.seoTitle,
    category: copy.category,
    apparatus: {
      name: copy.apparatusName || copy.title || copy.slug,
      runtime: copy.apparatusRuntime,
      path: parseApparatusLayers(copy.apparatusPath),
      beside: parseApparatusLayers(copy.apparatusBeside),
    } satisfies Apparatus,
  };
}

export type CmsExhibit = ReturnType<typeof exhibitFromCopy>;

export function overlayProject<T extends { slug: string }>(project: T, doc: SiteDocument): T | null {
  const copy = doc.projects.find((row) => row.slug === project.slug);
  if (copy?.archived) return null;
  if (!copy) return project;
  const patch: Record<string, unknown> = {};
  for (const key of COPY_KEYS) {
    const value = String(copy[key] ?? "").trim();
    if (value) patch[key] = value;
  }
  if (copy.title.trim()) patch.name = copy.title.trim();
  if (copy.subtitle.trim()) patch.subtitle = copy.subtitle.trim();
  if (copy.date.trim()) patch.date = copy.date.trim();
  if (copy.github.trim()) patch.github = copy.github.trim();
  if (copy.tech.trim()) {
    patch.tech = copy.tech.split(",").map((part) => part.trim()).filter(Boolean);
  }
  if (copy.seoDescription.trim()) patch.meta = copy.seoDescription.trim();
  if (copy.seoTitle.trim()) patch.seoTitle = copy.seoTitle.trim();
  if (copy.category.trim()) patch.category = copy.category.trim();
  if (copy.plate.trim()) patch.plate = copy.plate.trim();
  if (copy.plateCaption.trim()) patch.plateCaption = copy.plateCaption.trim();
  if (copy.plateAlt.trim()) patch.plateAlt = copy.plateAlt.trim();
  if (copy.description.trim()) patch.description = copy.description.trim();
  if (copy.bullets.trim()) {
    patch.bullets = copy.bullets.split("\n").map((line) => line.trim()).filter(Boolean);
  }
  const apparatus = overlayApparatus(project, copy);
  if (apparatus) patch.apparatus = apparatus;
  return { ...project, ...patch };
}

export function overlayProjects<T extends { slug: string }>(projects: readonly T[], doc: SiteDocument): T[] {
  const fromLedger = projects.map((project) => overlayProject(project, doc)).filter((row): row is T => row !== null);
  const known = new Set(projects.map((project) => project.slug));
  const extras = liveProjects(doc)
    .filter((copy) => !known.has(copy.slug))
    .map((copy) => exhibitFromCopy(copy) as unknown as T);
  const bySlug = new Map([...fromLedger, ...extras].map((row) => [row.slug, row]));
  const ordered: T[] = [];
  const seen = new Set<string>();
  for (const copy of liveProjects(doc)) {
    const row = bySlug.get(copy.slug);
    if (row) {
      ordered.push(row);
      seen.add(copy.slug);
    }
  }
  for (const row of fromLedger) {
    if (!seen.has(row.slug)) ordered.push(row);
  }
  return ordered;
}

export function resolveExhibit(slug: string, doc: SiteDocument) {
  const filed = resumeData.projects.find((project) => project.slug === slug);
  if (filed) return overlayProject(filed, doc);
  const copy = doc.projects.find((project) => project.slug === slug);
  if (!copy || copy.archived) return null;
  return exhibitFromCopy(copy);
}

export type HeroProofRow = {
  id: (typeof HERO_PROOF)[number]["id"];
  label: string;
  owner: string;
  note: string;
  kind: (typeof HERO_PROOF)[number]["kind"];
  method: string;
  baseline: string;
  sample: string;
  caveat: string;
  date: string;
};

export function heroProofRows(doc: SiteDocument): HeroProofRow[] {
  return HERO_PROOF.flatMap((item) => {
    const claim = doc.claims.find((row) => row.id === item.id);
    if (claim?.archived) return [];
    const label = claim?.id === "monashRetrieval" ? item.label : (claim?.display ?? item.label);
    return [
      {
        id: item.id,
        label,
        owner: item.owner,
        note: claim?.caveat || item.note,
        kind: item.kind,
        method: claim?.method ?? "",
        baseline: claim?.baseline ?? "",
        sample: claim?.sample ?? "",
        caveat: claim?.caveat ?? "",
        date: claim?.date ?? "",
      },
    ];
  });
}

export type OverlayJob = {
  title: string;
  type?: string;
  company: string;
  period: string;
  tech: string[];
  scope?: string;
  bullets: string[];
  impact: string;
};

export function overlayJobs(doc: SiteDocument): OverlayJob[] {
  const rows = Array.isArray(doc.experience) ? doc.experience.filter((row) => !row.archived) : [];
  if (!rows.length) return resumeData.experience.map((job) => ({ ...job }));
  const seeds = new Map(resumeData.experience.map((job) => [companyAnchor(job.company), job]));
  return rows.map((row) => {
    const seed = seeds.get(row.id);
    return {
      title: row.role || seed?.title || row.employer,
      type: row.type || ("type" in (seed ?? {}) ? seed?.type : undefined),
      company: row.employer || seed?.company || row.id,
      period: row.period || seed?.period || "",
      tech: row.tech
        ? row.tech.split(",").map((part) => part.trim()).filter(Boolean)
        : (seed?.tech ?? []),
      scope: row.ownership || ("scope" in (seed ?? {}) ? seed?.scope : undefined),
      bullets: row.bullets
        ? row.bullets.split("\n").map((line) => line.trim()).filter(Boolean)
        : (seed?.bullets ?? []),
      impact: row.impact || seed?.impact || "",
    };
  });
}

export function overlayEducation(doc: SiteDocument) {
  const seed = resumeData.education;
  const row = (doc.education ?? []).find((item) => !item.archived) ?? doc.education?.[0];
  if (!row) return seed;
  const wam = row.grades.match(/WAM\s+([\d.]+)/i)?.[1] ?? seed.wam;
  const cgpa = row.grades.match(/CGPA\s+([\d.]+)/i)?.[1] ?? seed.cgpa;
  return {
    school: row.institution || seed.school,
    location: row.location || seed.location,
    degree: row.qualification || seed.degree,
    honours: row.honours || seed.honours,
    graduation: row.dates || seed.graduation,
    wam,
    cgpa,
  };
}
