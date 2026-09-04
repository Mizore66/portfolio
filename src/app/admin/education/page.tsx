import { AdminFrame } from "@/components/admin/AdminFrame";
import { AdminActions, AdminDirtyForm, EditorSearch, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";

export default async function EducationEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Education"
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
        Education rows generate the homepage Education band and the résumé. The Monash degree cannot be deleted; it
        can be archived only if another row is ready to replace it.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/education">
        <input type="hidden" name="education-present" value="1" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Order</p>
        <ReorderList name="edu-order" ids={doc.education.map((row) => row.id)} />
        <EditorSearch>
          {doc.education.map((row) => (
            <details key={row.id} className="border-2 border-ink p-4" open>
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                {row.institution || row.id}
                {row.archived ? " · archived" : ""}
              </summary>
              <fieldset className="mt-4 grid gap-3 border-0 p-0">
                <legend className="sr-only">{row.id}</legend>
                <label>
                  Institution
                  <input name={`edu-${row.id}-institution`} defaultValue={row.institution} />
                </label>
                <label>
                  Qualification
                  <textarea name={`edu-${row.id}-qualification`} defaultValue={row.qualification} />
                </label>
                <label>
                  Honours
                  <input name={`edu-${row.id}-honours`} defaultValue={row.honours} />
                </label>
                <label>
                  Grades
                  <input name={`edu-${row.id}-grades`} defaultValue={row.grades} />
                </label>
                <label>
                  Dates
                  <input name={`edu-${row.id}-dates`} defaultValue={row.dates} />
                </label>
                <label>
                  Location
                  <input name={`edu-${row.id}-location`} defaultValue={row.location} />
                </label>
                <label className="normal-case tracking-normal">
                  <input type="checkbox" name={`edu-${row.id}-archived`} defaultChecked={row.archived} /> Archive
                </label>
                <p className="flex flex-wrap gap-2">
                  <button type="submit" className="masthead-chip" name="edu-duplicate" value={row.id} formAction={saveDraftAction}>
                    Duplicate
                  </button>
                  {row.id !== "monash-beng" ? (
                    <button type="submit" className="masthead-chip" name="edu-delete" value={row.id} formAction={saveDraftAction}>
                      Delete
                    </button>
                  ) : null}
                </p>
              </fieldset>
            </details>
          ))}
        </EditorSearch>
        <label>
          Institution
          <input name="edu-new-institution" placeholder="Institution" />
        </label>
        <p>
          <button type="submit" name="edu-create" value="1" className="masthead-chip" formAction={saveDraftAction}>
            Create education
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
