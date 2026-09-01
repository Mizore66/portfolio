import { AdminFrame } from "@/app/admin/layout";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { getDraftDocument } from "@/lib/cms/store";

export default async function ProfileEditor() {
  const doc = await getDraftDocument();
  const p = doc.profile;
  return (
    <AdminFrame title="Profile">
      <form className="admin-form">
        <label>
          Role line
          <input name="dek" defaultValue={p.dek} />
        </label>
        <label>
          Tagline
          <input name="tagline" defaultValue={p.tagline} />
        </label>
        <label>
          Desks
          <textarea name="desksLine" defaultValue={p.desksLine} />
        </label>
        <label>
          How I work
          <textarea name="howIWork" defaultValue={p.howIWork} />
        </label>
        <label>
          Availability
          <input name="availability" defaultValue={p.availability} />
        </label>
        <label>
          Recruiter biography (35–45 words)
          <textarea name="recruiterBio" defaultValue={p.recruiterBio} />
        </label>
        <label>
          Follower biography (100–140 words)
          <textarea name="followerBio" defaultValue={p.followerBio} rows={6} />
        </label>
        <label>
          Location
          <input name="location" defaultValue={p.location} />
        </label>
        <label>
          Publish note
          <input name="note" defaultValue={doc.note} />
        </label>
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
