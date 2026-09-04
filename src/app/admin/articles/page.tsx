import { AdminFrame } from "@/components/admin/AdminFrame";
import { AdminActions, AdminDirtyForm, MediaPicker } from "@/components/admin/AdminForm";
import { overlayArticle } from "@/lib/cms/articles";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument, listMediaBlobs } from "@/lib/cms/store";

export default async function ArticlesEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published, media] = await Promise.all([
    getDraftDocument(),
    getPublishedDocument(),
    listMediaBlobs(),
  ]);
  const bar = editorBar(published, doc);
  const colophon = overlayArticle("colophon", doc);
  return (
    <AdminFrame
      title="Articles"
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
        Colophon copy overlays the compiled receipt. Perft node counts stay compiled. Gate C numbers and the lab
        article still live on Laboratory — Elo, WDL, and SPRT cannot be rewritten here.
      </p>
      <p className="mt-2 max-w-[62ch] font-display text-[15px] text-faded">
        Lab body editing is on <a href="/admin/lab">Laboratory</a>.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/articles">
        <input type="hidden" name="articles-present" value="1" />
        <label>
          Kicker
          <input name="article-colophon-kicker" defaultValue={colophon.kicker} />
        </label>
        <label>
          How this paper was set
          <textarea name="article-colophon-body" defaultValue={colophon.body} rows={8} />
        </label>
        <label>
          Honesty kicker
          <input name="article-colophon-honestyKicker" defaultValue={colophon.honestyKicker} />
        </label>
        <label>
          Honesty
          <textarea name="article-colophon-honesty" defaultValue={colophon.honesty} rows={3} />
        </label>
        <label>
          Witnesses kicker
          <input name="article-colophon-witnessKicker" defaultValue={colophon.witnessKicker} />
        </label>
        <label>
          Witnesses
          <textarea name="article-colophon-witnesses" defaultValue={colophon.witnesses} rows={4} />
        </label>
        <label>
          Inventor plate
          <MediaPicker
            name="article-colophon-plate"
            mediaName="article-colophon-plateMedia"
            defaultValue={colophon.plate}
            defaultMedia={colophon.plateMedia}
            assets={media}
          />
        </label>
        <label>
          Caption
          <input name="article-colophon-plateCaption" defaultValue={colophon.plateCaption} />
        </label>
        <label>
          Image description
          <input name="article-colophon-plateAlt" defaultValue={colophon.plateAlt} />
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
