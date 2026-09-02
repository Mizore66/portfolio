import { AdminFrame } from "@/app/admin/layout";
import { restoreRevisionAction } from "@/lib/cms/actions";
import { getCmsState } from "@/lib/cms/store";

export default async function HistoryEditor({
  searchParams,
}: {
  searchParams: Promise<{ restored?: string; error?: string }>;
}) {
  const q = await searchParams;
  const state = await getCmsState();
  return (
    <AdminFrame title="Version history">
      {q.restored ? <p className="font-display text-[16px] text-book-blue">Restored into draft.</p> : null}
      {q.error ? <p className="admin-error">{q.error}</p> : null}
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Every save and publish keeps a snapshot. Restore copies a snapshot into draft; publish to put it on the
        public plate.
      </p>
      <ol className="mt-6 grid gap-3">
        {state.revisions.length === 0 ? (
          <li className="font-mono text-[12px] text-faded">No snapshots yet. The TypeScript ledger is the fallback.</li>
        ) : (
          state.revisions.map((row) => (
            <li key={row.revisionId} className="border-2 border-ink p-4">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
                {row.status} · {row.revisionId}
              </p>
              <p className="mt-2 font-display text-[16px]">{row.publishedAt.slice(0, 19)}</p>
              <p className="mt-1 font-mono text-[12px] text-faded">{row.note}</p>
              <form action={restoreRevisionAction} className="mt-3">
                <input type="hidden" name="revisionId" value={row.revisionId} />
                <button type="submit" className="masthead-chip">
                  Restore to draft
                </button>
              </form>
            </li>
          ))
        )}
      </ol>
    </AdminFrame>
  );
}
