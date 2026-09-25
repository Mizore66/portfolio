import { AdminFrame } from "@/components/admin/AdminFrame";
import { AdminActions, AdminDirtyForm, EditorSearch, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { LEDGER_EXPERIENCE_IDS } from "@/lib/cms/validate";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";

export default async function ExperienceEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Experience"
      status={
        q.saved ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft saved.
          </p>
        ) : q.error ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : null
      }
    >
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        These rows generate the homepage Experience band, JSON-LD workplace facts, and the résumé. Ledger employers
        can be archived, not permanently deleted. New rows start archived until you publish them.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/experience">
        <input type="hidden" name="experience-present" value="1" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Order</p>
        <ReorderList name="exp-order" ids={doc.experience.map((row) => row.id)} />
        <EditorSearch>
          {doc.experience.map((row) => (
            <details key={row.id} className="border-2 border-ink p-4" open={!row.archived}>
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                {row.employer || row.id}
                {row.archived ? " · archived" : ""}
              </summary>
              <fieldset className="mt-4 grid gap-3 border-0 p-0">
                <legend className="sr-only">{row.id}</legend>
                <label>
                  Employer
                  <input name={`exp-${row.id}-employer`} defaultValue={row.employer} />
                </label>
                <label>
                  Role
                  <input name={`exp-${row.id}-role`} defaultValue={row.role} />
                </label>
                <label>
                  Type
                  <input name={`exp-${row.id}-type`} defaultValue={row.type} />
                </label>
                <label>
                  Dates
                  <input name={`exp-${row.id}-period`} defaultValue={row.period} />
                </label>
                <label>
                  Technologies
                  <input name={`exp-${row.id}-tech`} defaultValue={row.tech} />
                </label>
                <label>
                  Ownership boundary
                  <textarea name={`exp-${row.id}-ownership`} defaultValue={row.ownership} />
                </label>
                <label>
                  Outcomes (one bullet per line)
                  <textarea name={`exp-${row.id}-bullets`} defaultValue={row.bullets} rows={5} />
                </label>
                <label>
                  Impact line
                  <input name={`exp-${row.id}-impact`} defaultValue={row.impact} />
                </label>
                <label className="normal-case tracking-normal">
                  <input type="checkbox" name={`exp-${row.id}-archived`} defaultChecked={row.archived} /> Archive
                </label>
                <p className="flex flex-wrap gap-2">
                  <button type="submit" className="masthead-chip" name="exp-duplicate" value={row.id} formAction={saveDraftAction}>
                    Duplicate
                  </button>
                  {!LEDGER_EXPERIENCE_IDS.has(row.id) ? (
                    <button type="submit" className="masthead-chip" name="exp-delete" value={row.id} formAction={saveDraftAction}>
                      Delete draft row
                    </button>
                  ) : null}
                </p>
              </fieldset>
            </details>
          ))}
        </EditorSearch>
        <label>
          Employer for a new role
          <input name="exp-new-employer" placeholder="Employer" />
        </label>
        <label>
          Role
          <input name="exp-new-role" placeholder="Role title" />
        </label>
        <p>
          <button type="submit" name="exp-create" value="1" className="masthead-chip" formAction={saveDraftAction}>
            Create experience
          </button>
        </p>
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
