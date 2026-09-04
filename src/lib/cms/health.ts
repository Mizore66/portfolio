import { documentDiff } from "@/lib/cms/diff";
import { claimHeroReady, present, validateDocument } from "@/lib/cms/validate";
import type { CmsClaim, SiteDocument } from "@/lib/cms/types";

/** One visible rule for homepage proof-card evidence. */
export const HERO_EVIDENCE_RULE =
  "A homepage proof card needs how it was measured, an internal evidence record, a denominator or sample size, an environment, and a measurement date. It also needs a comparison baseline or a public caveat, and an evaluation set or a public caveat. Choose Filed, Confidential, or Not collected rather than leaving a required field blank. Incomplete drafts may be saved; Preview and Publish stay blocked until the packet is complete.";

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
  const undated = doc.claims.filter(
    (claim) => !claim.archived && !(typeof claim.date === "string" && claim.date.trim()),
  );
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
    if (missing.length === 1) return { label: `Missing ${missing[0]}`, tone: "bad" };
    if (missing.length) return { label: `${missing.length} required fields missing`, tone: "bad" };
    return { label: "Complete", tone: "ok" };
  }
  if (!present(claim.source)) return { label: "Missing source", tone: "warn" };
  if (!present(claim.date)) return { label: "Missing date", tone: "warn" };
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

export function formatLocalTime(iso: unknown, timeZone = "Asia/Kuala_Lumpur"): string {
  const raw =
    typeof iso === "string"
      ? iso
      : typeof iso === "number" && Number.isFinite(iso)
        ? new Date(iso).toISOString()
        : "";
  const then = Date.parse(raw);
  if (!Number.isFinite(then)) return raw || "Unknown time";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
      timeZoneName: "short",
    }).format(new Date(then));
  } catch {
    return new Date(then).toISOString();
  }
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
    if (path.startsWith("experience") || path.startsWith("education") || path.startsWith("chess")) {
      surfaces.add("Homepage");
      surfaces.add("Résumé");
      surfaces.add("Opening Preparation");
    }
    if (path.startsWith("lab")) {
      surfaces.add("Laboratory");
      surfaces.add("Homepage");
    }
    if (path.startsWith("articles")) {
      surfaces.add("Colophon");
    }
    if (path.startsWith("redirects")) {
      surfaces.add("Redirects");
    }
  }
  if (paths.length) surfaces.add("Sitemap");
  return [...surfaces];
}
