import type { CmsMediaAsset, SiteDocument } from "@/lib/cms/types";

function plateMatches(plate: string, asset: CmsMediaAsset): boolean {
  if (!plate.trim() || (!asset.pathname && !asset.url)) return false;
  if (plate === asset.url || plate === asset.pathname) return true;
  if (asset.url && (asset.url.endsWith(plate) || plate.endsWith(asset.url))) return true;
  if (asset.pathname && (plate.endsWith(asset.pathname) || plate.includes(asset.pathname))) return true;
  return false;
}

function valueMentionsAsset(value: unknown, asset: CmsMediaAsset): boolean {
  if (typeof value === "string") return plateMatches(value, asset);
  if (Array.isArray(value)) return value.some((item) => valueMentionsAsset(item, asset));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => valueMentionsAsset(item, asset));
  }
  return false;
}

export type TypedMediaRef = { label: string; value: string };

/** Claim ↔ project ↔ media edges first; string scan is the fallback. */
export function typedMediaRefs(doc: SiteDocument): TypedMediaRef[] {
  const refs: TypedMediaRef[] = [];
  for (const project of doc.projects ?? []) {
    if (project.plateMedia?.trim()) refs.push({ label: `/projects/${project.slug}`, value: project.plateMedia });
    if (project.plate?.trim()) refs.push({ label: `/projects/${project.slug}`, value: project.plate });
  }
  for (const claim of doc.claims ?? []) {
    if (claim.mediaPathname?.trim()) refs.push({ label: `claim:${claim.id}`, value: claim.mediaPathname });
  }
  for (const note of doc.chess ?? []) {
    if (note.mediaPathname?.trim()) refs.push({ label: `chess:${note.id}`, value: note.mediaPathname });
  }
  for (const article of doc.articles ?? []) {
    if (article.plateMedia?.trim()) refs.push({ label: `article:${article.slug}`, value: article.plateMedia });
    if (article.plate?.trim()) refs.push({ label: `article:${article.slug}`, value: article.plate });
  }
  return refs;
}

export function mediaUsedBy(asset: CmsMediaAsset, docs: SiteDocument[]): string[] {
  const refs = new Set<string>();
  for (const doc of docs) {
    for (const edge of typedMediaRefs(doc)) {
      if (plateMatches(edge.value, asset)) refs.add(edge.label);
    }
    if (valueMentionsAsset(doc.profile, asset)) refs.add("Homepage");
    for (const project of doc.projects ?? []) {
      if (valueMentionsAsset(project, asset)) refs.add(`/projects/${project.slug}`);
    }
    for (const claim of doc.claims ?? []) {
      if (valueMentionsAsset(claim, asset)) refs.add(`claim:${claim.id}`);
    }
    for (const note of doc.chess ?? []) {
      if (valueMentionsAsset(note, asset)) refs.add(`chess:${note.id}`);
    }
    for (const article of doc.articles ?? []) {
      if (valueMentionsAsset(article, asset)) refs.add(`article:${article.slug}`);
    }
  }
  if (asset.usage.trim()) refs.add(asset.usage.trim());
  return [...refs];
}
