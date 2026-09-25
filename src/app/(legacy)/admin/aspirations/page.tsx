import { AdminFrame } from "@/components/admin/AdminFrame";
import { AdminActions, AdminDirtyForm, EditorSearch, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";

export default async function AspirationsEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Aspirations"
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
        Active aspirations feed the contact band. Create, duplicate, reorder, or delete rows here. If none are
        active, the profile availability line is used.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/aspirations">
        <input type="hidden" name="aspirations-present" value="1" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Order</p>
        <ReorderList name="asp-order" ids={doc.aspirations.map((item) => item.id)} />
        <EditorSearch>
          {doc.aspirations.map((item) => (
            <details key={item.id} className="border-2 border-ink p-4" open>
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                {item.id}
                {item.active ? " · active" : " · inactive"}
              </summary>
              <fieldset className="mt-4 grid gap-3 border-0 p-0">
                <legend className="sr-only">{item.id}</legend>
                <label>
                  Label
                  <input name={`asp-${item.id}-label`} defaultValue={item.label} />
                </label>
                <label>
                  Start
                  <input name={`asp-${item.id}-start`} defaultValue={item.start} />
                </label>
                <label>
                  End (blank while active)
                  <input name={`asp-${item.id}-end`} defaultValue={item.end} />
                </label>
                <label className="normal-case tracking-normal">
                  <input type="checkbox" name={`asp-${item.id}-active`} defaultChecked={item.active} /> Active
                </label>
                <p className="flex flex-wrap gap-2">
                  <button type="submit" className="masthead-chip" name="asp-duplicate" value={item.id} formAction={saveDraftAction}>
                    Duplicate
                  </button>
                  <button type="submit" className="masthead-chip" name="asp-delete" value={item.id} formAction={saveDraftAction}>
                    Delete
                  </button>
                </p>
              </fieldset>
            </details>
          ))}
        </EditorSearch>
        <label>
          New aspiration id
          <input name="asp-new-id" placeholder="kebab-or-camel id" />
        </label>
        <p>
          <button type="submit" name="asp-create" value="1" className="masthead-chip" formAction={saveDraftAction}>
            Create aspiration
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
