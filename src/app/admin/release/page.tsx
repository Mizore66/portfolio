import { AdminFrame } from "@/app/admin/layout";
import { AdminDirtyForm } from "@/components/admin/AdminForm";
import { enablePreviewAction, publishAction } from "@/lib/cms/actions";
import { groupedDocumentDiff } from "@/lib/cms/diff";
import { changedSurfaces, draftHealth, draftStatus, formatLocalTime } from "@/lib/cms/health";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";
import { claimHeroReady } from "@/lib/cms/validate";

export default async function ReleaseReview() {
  const [draft, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const status = draftStatus(published, draft);
  const health = draftHealth(draft);
  const groups = groupedDocumentDiff(published, draft);
  const surfaces = changedSurfaces(groups.flatMap((group) => group.rows.map((row) => row.path)));
  const urls = [
    "/",
    "/opening-preparation",
    "/print-edition",
    "/print-edition?paper=a4",
    "/sitemap.xml",
    "/lab/learned-evaluator",
    ...draft.projects.filter((project) => !project.archived).map((project) => `/projects/${project.slug}`),
  ];
  return (
    <AdminFrame title="Release review">
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Publish writes one revision across homepage, project pages, résumé, sitemap, and structured data. Rollback is
        restore-and-publish from History.
      </p>
      <p className="mt-3 font-display text-[18px]">{status.label}</p>
      {health.blocking ? (
        <ul className="admin-error mt-4 list-disc pl-5">
          {health.heroMissing.map((claim) => (
            <li key={claim.id}>
              {claim.id}: missing {claimHeroReady(claim).join(", ")}.
            </li>
          ))}
          {health.errors
            .filter((error) => !health.heroMissing.some((claim) => error.includes(claim.id)))
            .map((error) => (
              <li key={error}>{error}</li>
            ))}
        </ul>
      ) : (
        <p className="mt-3 font-display text-[16px] text-book-blue">Schema checks passed.</p>
      )}
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Changed entities</p>
      <ul className="mt-2 grid gap-1">
        {groups.length ? (
          groups.map((group) => (
            <li key={group.id} className="font-display text-[16px]">
              {group.heading} · {group.rows.length} field{group.rows.length === 1 ? "" : "s"}
            </li>
          ))
        ) : (
          <li className="font-mono text-[12px] text-faded">No unpublished entity changes.</li>
        )}
      </ul>
      <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Affected surfaces</p>
      <p className="mt-2 font-display text-[16px]">{surfaces.join(", ") || "None"}</p>
      <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">URLs to inspect after publish</p>
      <ul className="mt-2 grid gap-1">
        {urls.map((href) => (
          <li key={href}>
            <a href={href} className="text-book-blue underline">
              {href}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[12px] text-faded">
        Current published revision {published.revisionId}
        {published.savedAt ? ` · ${formatLocalTime(published.savedAt)}` : ""}.
      </p>
      <AdminDirtyForm expectedRevisionId={draft.revisionId} returnTo="/admin/release">
        <input type="hidden" name="confirmPublish" value="1" />
        <p className="mt-6 flex flex-wrap gap-3">
          <button formAction={enablePreviewAction} className="masthead-chip" type="submit">
            Preview draft
          </button>
          <button
            formAction={publishAction}
            className="masthead-chip masthead-chip-primary"
            disabled={health.blocking || status.key !== "dirty"}
          >
            Publish release
          </button>
        </p>
      </AdminDirtyForm>
    </AdminFrame>
  );
}
