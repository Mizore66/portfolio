import { documentDiff } from "@/lib/cms/diff";
import { claimHeroReady, validateDocument } from "@/lib/cms/validate";
import type { CmsClaim, SiteDocument } from "@/lib/cms/types";

/** One visible rule for homepage proof-card evidence. */
export const HERO_EVIDENCE_RULE =
  "A homepage proof card needs how it was measured, an evidence source, a denominator or sample size, an environment, and a measurement date. It also needs a comparison baseline or a public caveat, and a sample/evaluation set or a public caveat. Write “Unfiled” rather than leaving a required field blank. Incomplete drafts may be saved; Preview and Publish stay blocked until the packet is complete.";

export type DraftStatusKey = "none" | "match" | "dirty";

export type DraftStatus = {
  key: DraftStatusKey;
  label: string;
  changes: number;
};

export function draftStatus(published: SiteDocument, draft: SiteDocument | null): DraftStatus {
  if (!draft) return { key: "none", label: "No draft", changes: 0 };
  const changes = documentDiff(published, draft).length;
  if (changes === 0) {
    return { key: "match", label: "Draft matches live", changes: 0 };
  }
  return {
    key: "dirty",
    label: `Draft has ${changes} unpublished change${changes === 1 ? "" : "s"}`,
    changes,
  };
}

export function draftHealth(doc: SiteDocument) {
  const heroMissing = doc.claims.filter(
    (claim) => claim.heroEligible && !claim.archived && claimHeroReady(claim).length > 0,
  );
  const undated = doc.claims.filter((claim) => !claim.archived && !claim.date.trim());
  const errors = validateDocument(doc);
  return {
    heroMissing,
    undated,
    errors,
    blocking: errors.length > 0,
  };
}

export function claimCompleteness(claim: CmsClaim): { label: string; tone: "ok" | "warn" | "bad" } {
  if (claim.date && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(claim.date)) {
    return { label: "Invalid date", tone: "bad" };
  }
  if (claim.heroEligible) {
    const missing = claimHeroReady(claim);
    if (missing.length) return { label: `Missing ${missing[0]}`, tone: "bad" };
    return { label: "Complete", tone: "ok" };
  }
  if (!claim.source.trim()) return { label: "Missing source", tone: "warn" };
  if (!claim.date.trim()) return { label: "Missing date", tone: "warn" };
  return { label: "Complete", tone: "ok" };
}

export function revisionInstant(row: {
  revisionId: string;
  publishedAt?: string;
  savedAt?: string;
}): string {
  if (row.savedAt && Number.isFinite(Date.parse(row.savedAt))) return row.savedAt;
  const stamped = row.revisionId.match(/^(?:draft|pub)-(\d+)$/);
  if (stamped) return new Date(Number(stamped[1])).toISOString();
  if (row.publishedAt && Number.isFinite(Date.parse(row.publishedAt))) return row.publishedAt;
  return "";
}

export function formatLocalTime(iso: string, timeZone = "Asia/Kuala_Lumpur"): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(then));
}

export function defaultRevisionNote(paths: string[]): string {
  if (!paths.length) return "";
  const heads = [...new Set(paths.map((path) => path.split(".")[0] ?? path))];
  const shown = heads.slice(0, 4).join(", ");
  return `Updated ${shown}${heads.length > 4 ? "…" : ""}`;
}

export function changedSurfaces(paths: string[]): string[] {
  const surfaces = new Set<string>();
  for (const path of paths) {
    if (path.startsWith("profile") || path.startsWith("aspirations") || path === "note") {
      surfaces.add("Homepage");
    }
    if (path.startsWith("claims") || path.startsWith("profile")) {
      surfaces.add("Résumé");
      surfaces.add("Homepage");
    }
    if (path.startsWith("projects")) {
      surfaces.add("Project pages");
      surfaces.add("Homepage");
      surfaces.add("Sitemap");
    }
  }
  if (paths.length) surfaces.add("Sitemap");
  return [...surfaces];
}
