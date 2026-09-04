import { AdminFrame } from "@/components/admin/AdminFrame";
import { AdminActions, AdminDirtyForm, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { LEDGER_REDIRECT_IDS } from "@/lib/cms/redirects";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";

export default async function RedirectsEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Redirects"
      status={
        q.invalid ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : q.saved ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft saved.
          </p>
        ) : q.error ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : null
      }
    >
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Path-to-path only. Sources and targets must start with a single slash. /admin, /_next, protocol-relative, and
        off-origin URLs are rejected. /about and /archive stay on the ledger so those desks cannot vanish.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/redirects">
        <input type="hidden" name="redirects-present" value="1" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Order</p>
        <ReorderList name="redirect-order" ids={doc.redirects.map((row) => row.id)} />
        {doc.redirects.map((row) => (
          <details key={row.id} className="border-2 border-ink p-4" open>
            <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
              {row.from} → {row.to}
              {row.enabled ? "" : " · off"}
            </summary>
            <fieldset className="mt-4 grid gap-3 border-0 p-0">
              <legend className="sr-only">{row.id}</legend>
              <label>
                From
                <input name={`redirect-${row.id}-from`} defaultValue={row.from} />
              </label>
              <label>
                To
                <input name={`redirect-${row.id}-to`} defaultValue={row.to} />
              </label>
              <label>
                Status
                <select name={`redirect-${row.id}-status`} defaultValue={String(row.status)}>
                  <option value="308">308 permanent</option>
                  <option value="301">301 permanent</option>
                  <option value="307">307 temporary</option>
                  <option value="302">302 temporary</option>
                </select>
              </label>
              <label className="flex-row items-center gap-2 normal-case tracking-normal">
                <input type="checkbox" name={`redirect-${row.id}-enabled`} defaultChecked={row.enabled} />
                Enabled
              </label>
              {LEDGER_REDIRECT_IDS.has(row.id) ? (
                <p className="font-mono text-[12px] text-faded">Ledger route. Disable it rather than deleting it.</p>
              ) : (
                <button type="submit" name="redirect-delete" value={row.id} className="masthead-chip">
                  Delete
                </button>
              )}
            </fieldset>
          </details>
        ))}
        <fieldset className="border-2 border-ink p-4">
          <legend className="font-mono text-[12px] uppercase tracking-[0.14em]">New redirect</legend>
          <label>
            Id
            <input name="redirect-new-id" />
          </label>
          <label>
            From
            <input name="redirect-new-from" placeholder="/old-path" />
          </label>
          <label>
            To
            <input name="redirect-new-to" placeholder="/#work" />
          </label>
          <button type="submit" name="redirect-create" value="1" className="masthead-chip">
            Add redirect
          </button>
        </fieldset>
        <label>
          Revision note
          <input name="note" defaultValue={doc.note} />
        </label>
        <AdminActions
          save={saveDraftAction}
          publish={publishAction}
          canPublish={bar.canPublish}
          changeCount={bar.changeCount}
          changeSummary={bar.changeSummary}
          surfaces={bar.surfaces}
          blockedReason={bar.blockedReason}
        />
      </AdminDirtyForm>
    </AdminFrame>
  );
}
