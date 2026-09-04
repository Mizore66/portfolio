import { AdminFrame } from "@/components/admin/AdminFrame";
import { AdminActions, AdminDirtyForm } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";

export default async function LabEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Laboratory"
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
        Copy overlays the Gate C lab article and homepage teaser. Elo, WDL, and SPRT lines stay compiled from the
        match report. The headline and teaser must keep “underperformed PeSTO”. Colophon body editing is on{" "}
        <a href="/admin/articles">Articles</a>.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/lab">
        <input type="hidden" name="lab-present" value="1" />
        <label>
          Headline
          <textarea name="lab-hed" defaultValue={doc.lab.hed} rows={3} />
        </label>
        <label>
          Dek
          <textarea name="lab-dek" defaultValue={doc.lab.dek} rows={3} />
        </label>
        <label>
          Homepage teaser
          <textarea name="lab-teaser" defaultValue={doc.lab.teaser} rows={3} />
        </label>
        <label>
          Search / social description
          <textarea name="lab-meta" defaultValue={doc.lab.meta} rows={3} />
        </label>
        <label>
          Result joke
          <input name="lab-resultJoke" defaultValue={doc.lab.resultJoke} />
        </label>
        <label>
          Hypothesis heading
          <input name="lab-hypothesisHed" defaultValue={doc.lab.hypothesisHed} />
        </label>
        <label>
          Hypothesis
          <textarea name="lab-hypothesis" defaultValue={doc.lab.hypothesis} rows={5} />
        </label>
        <label>
          Experiment heading
          <input name="lab-experimentHed" defaultValue={doc.lab.experimentHed} />
        </label>
        <label>
          Experiment
          <textarea name="lab-experiment" defaultValue={doc.lab.experiment} rows={5} />
        </label>
        <label>
          What failed heading
          <input name="lab-failedHed" defaultValue={doc.lab.failedHed} />
        </label>
        <label>
          What failed
          <textarea name="lab-failed" defaultValue={doc.lab.failed} rows={5} />
        </label>
        <label>
          What I learned heading
          <input name="lab-learnedHed" defaultValue={doc.lab.learnedHed} />
        </label>
        <label>
          What I learned
          <textarea name="lab-learned" defaultValue={doc.lab.learned} rows={5} />
        </label>
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
