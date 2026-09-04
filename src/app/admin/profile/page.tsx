import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm, WordCount } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";

export default async function ProfileEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string; changes?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const p = doc.profile;
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Homepage and biography"
      status={
        q.invalid ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) :         q.saved ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft saved{q.changes ? ` · ${q.changes} unpublished changes.` : "."}
          </p>
        ) : q.error ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : null
      }
    >
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/profile">
        <input type="hidden" name="profile-present" value="1" />
        <label>
          Role line
          <input name="dek" defaultValue={p.dek} required maxLength={240} />
        </label>
        <label>
          Tagline
          <input name="tagline" defaultValue={p.tagline} required maxLength={160} />
        </label>
        <label>
          Homepage employer summary
          <textarea name="desksLine" defaultValue={p.desksLine} />
        </label>
        <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
          Appears as supporting employer copy. The identity-bridge sentence on the homepage is still the dedicated
          ownership line.
        </p>
        <label>
          Homepage working principle
          <textarea name="howIWork" defaultValue={p.howIWork} />
        </label>
        <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
          Used on the homepage working-principle line, not the role sentence.
        </p>
        <label>
          Availability (public role target)
          <input name="availability" defaultValue={p.availability} />
        </label>
        <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
          Dated Aspiration rows override this when one is marked active.
        </p>
        <label>
          Recruiter biography (35–45 words)
          <WordCount name="recruiterBio" defaultValue={p.recruiterBio} min={35} max={45} />
        </label>
        <label>
          Follower biography (100–140 words)
          <WordCount name="followerBio" defaultValue={p.followerBio} min={100} max={140} rows={6} />
        </label>
        <label>
          Location
          <input name="location" defaultValue={p.location} />
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
