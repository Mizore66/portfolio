import { documentDiff } from "@/lib/cms/diff";
import { changedSurfaces, draftHealth, draftStatus } from "@/lib/cms/health";
import type { SiteDocument } from "@/lib/cms/types";

export function editorBar(published: SiteDocument, draft: SiteDocument) {
  const status = draftStatus(published, draft);
  const health = draftHealth(draft);
  const rows = documentDiff(published, draft);
  return {
    canPublish: status.key === "dirty" && !health.blocking,
    changeCount: status.changes,
    changeSummary: rows.map((row) => row.path),
    surfaces: changedSurfaces(rows.map((row) => row.path)),
    blockedReason: health.blocking ? health.errors[0] : undefined,
    expectedRevisionId: draft.revisionId,
  };
}
