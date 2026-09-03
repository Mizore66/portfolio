import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm } from "@/components/admin/AdminForm";
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
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/aspirations">
        <input type="hidden" name="aspirations-present" value="1" />
        {doc.aspirations.map((item) => (
          <fieldset key={item.id} className="border-2 border-ink p-4">
            <legend className="px-2 font-mono text-[12px] uppercase tracking-[0.14em]">{item.id}</legend>
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
          </fieldset>
        ))}
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
