import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { getDraftDocument } from "@/lib/cms/store";

export default async function ProfileEditor() {
  const doc = await getDraftDocument();
  const p = doc.profile;
  return (
    <AdminFrame title="Profile">
      <AdminDirtyForm>
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
        <AdminActions save={saveDraftAction} publish={publishAction} />
      </AdminDirtyForm>
    </AdminFrame>
  );
}
