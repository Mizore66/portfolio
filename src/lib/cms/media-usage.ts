import type { CmsMediaAsset, SiteDocument } from "@/lib/cms/types";

function plateMatches(plate: string, asset: CmsMediaAsset): boolean {
  if (!plate.trim() || !asset.pathname && !asset.url) return false;
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

export function mediaUsedBy(asset: CmsMediaAsset, docs: SiteDocument[]): string[] {
  const refs = new Set<string>();
  for (const doc of docs) {
    if (valueMentionsAsset(doc.profile, asset)) refs.add("Homepage");
    for (const project of doc.projects ?? []) {
      if (valueMentionsAsset(project, asset)) refs.add(`/projects/${project.slug}`);
    }
    for (const claim of doc.claims ?? []) {
      if (valueMentionsAsset(claim, asset)) refs.add(`claim:${claim.id}`);
    }
  }
  if (asset.usage.trim()) refs.add(asset.usage.trim());
  return [...refs];
}
