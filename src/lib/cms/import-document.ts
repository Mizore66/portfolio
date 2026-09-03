import { hydrateDocument } from "@/lib/cms/hydrate";
import { ledgerDocument } from "@/lib/cms/ledger";
import type { SiteDocument } from "@/lib/cms/types";

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export type ImportResult = { ok: true; doc: SiteDocument } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function looksLikeDocument(value: unknown): value is SiteDocument {
  if (!isRecord(value)) return false;
  return isRecord(value.profile) && Array.isArray(value.claims);
}

export function parseImportedDocument(raw: string): ImportResult {
  if (raw.length > MAX_IMPORT_BYTES) {
    return { ok: false, error: "Import is larger than 2 MB." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file is not JSON." };
  }
  let candidate: unknown = parsed;
  if (isRecord(parsed) && !looksLikeDocument(parsed)) {
    candidate = parsed.draft ?? parsed.published;
  }
  if (!looksLikeDocument(candidate)) {
    return { ok: false, error: "JSON needs a document with profile and claims." };
  }
  const ledger = ledgerDocument();
  const hydrated = hydrateDocument({
    ...ledger,
    ...candidate,
    profile: { ...ledger.profile, ...candidate.profile },
    claims: candidate.claims,
    aspirations: Array.isArray(candidate.aspirations) ? candidate.aspirations : ledger.aspirations,
    projects: Array.isArray(candidate.projects) ? candidate.projects : ledger.projects,
    experience: Array.isArray(candidate.experience) ? candidate.experience : ledger.experience,
    education: Array.isArray(candidate.education) ? candidate.education : ledger.education,
    note: typeof candidate.note === "string" && candidate.note ? candidate.note : "Imported JSON",
    revisionId: "import",
    status: "draft",
    publishedAt: ledger.publishedAt,
  });
  return { ok: true, doc: hydrated };
}
