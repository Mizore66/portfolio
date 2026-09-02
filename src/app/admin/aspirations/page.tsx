import { AdminFrame } from "@/app/admin/layout";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { getDraftDocument } from "@/lib/cms/store";

export default async function AspirationsEditor() {
  const doc = await getDraftDocument();
  return (
    <AdminFrame title="Aspirations">
      <form className="admin-form">
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
        <p className="flex flex-wrap gap-3">
          <button formAction={saveDraftAction} className="masthead-chip">
            Save draft
          </button>
          <button formAction={publishAction} className="masthead-chip masthead-chip-primary">
            Publish
          </button>
        </p>
      </form>
    </AdminFrame>
  );
}
