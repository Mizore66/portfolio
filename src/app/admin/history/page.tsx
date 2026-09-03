import { AdminFrame } from "@/app/admin/layout";
import { restoreAndPublishAction, restoreRevisionAction } from "@/lib/cms/actions";
import { getCmsState, HISTORY_CAP } from "@/lib/cms/store";
import { formatRelativeTime } from "@/lib/filed";

export default async function HistoryEditor({
  searchParams,
}: {
  searchParams: Promise<{ restored?: string; published?: string; error?: string; q?: string; status?: string }>;
}) {
  const q = await searchParams;
  const state = await getCmsState();
  const query = (q.q ?? "").trim().toLowerCase();
  const status = q.status === "draft" || q.status === "published" ? q.status : "";
  const rows = state.revisions.filter((row) => {
    if (status && row.status !== status) return false;
    if (!query) return true;
    const hay = `${row.revisionId} ${row.note} ${row.status} ${row.publishedAt}`.toLowerCase();
    return hay.includes(query);
  });
  return (
    <AdminFrame title="Version history">
      {q.restored ? <p className="font-display text-[16px] text-book-blue" role="status">Restored into draft.</p> : null}
      {q.published ? <p className="font-display text-[16px] text-book-blue" role="status">Restored and published.</p> : null}
      {q.error ? <p className="admin-error">{q.error}</p> : null}
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Every save and publish keeps a snapshot. The desk keeps the most recent {HISTORY_CAP} revisions;
        older plates are dropped. Restore copies a snapshot into draft; publish to put it on the public plate.
      </p>
      <form className="admin-form mt-6" method="get">
        <label>
          Search
          <input name="q" defaultValue={q.q ?? ""} placeholder="revision, note, date" />
        </label>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <p>
          <button type="submit" className="masthead-chip">
            Filter
          </button>
        </p>
      </form>
      <ol className="mt-6 grid gap-3">
        {state.revisions.length === 0 ? (
          <li className="font-mono text-[12px] text-faded">No snapshots yet. The TypeScript ledger is the fallback.</li>
        ) : rows.length === 0 ? (
          <li className="font-mono text-[12px] text-faded">No revisions match that filter.</li>
        ) : (
          rows.map((row) => (
            <li key={row.revisionId} className="border-2 border-ink p-4">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
                {row.status} · {row.revisionId}
              </p>
              <p className="mt-2 font-display text-[16px]">
                {formatRelativeTime(row.publishedAt || row.revisionId.replace(/^draft-/, ""))}
                <span className="ml-2 font-mono text-[12px] text-faded">
                  {row.publishedAt ? row.publishedAt.slice(0, 10) : ""}
                </span>
              </p>
              <p className="mt-1 font-mono text-[12px] text-faded">{row.note}</p>
              <form action={restoreRevisionAction} className="mt-3">
                <input type="hidden" name="revisionId" value={row.revisionId} aria-hidden="true" />
                <button type="submit" className="masthead-chip">
                  Restore to draft
                </button>
              </form>
              <form action={restoreAndPublishAction} className="mt-2">
                <input type="hidden" name="revisionId" value={row.revisionId} aria-hidden="true" />
                <button type="submit" className="masthead-chip masthead-chip-primary">
                  Restore and publish
                </button>
              </form>
            </li>
          ))
        )}
      </ol>
    </AdminFrame>
  );
}
