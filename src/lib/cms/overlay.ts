import type { CmsClaim, CmsProjectCopy, SiteDocument } from "@/lib/cms/types";
import { PROJECT_COPY_KEYS } from "@/lib/cms/types";
import { HERO_PROOF } from "@/lib/metrics";

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
  return { ...project, ...patch };
}

export function overlayProjects<T extends { slug: string }>(projects: readonly T[], doc: SiteDocument): T[] {
  return projects.map((project) => overlayProject(project, doc)).filter((row): row is T => row !== null);
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
