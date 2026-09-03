import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { getDraftDocument } from "@/lib/cms/store";
import { resumeData } from "@/lib/data";

export default async function ProjectsEditor() {
  const doc = await getDraftDocument();
  return (
    <AdminFrame title="Projects">
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Purpose, impact, and the case-study paragraphs overlay the public exhibits. Archive hides a
        filing from Selected work, the sitemap, and the exhibit URL. Structure (dates, plates, apparatus)
        still compiles from the TypeScript ledger.
      </p>
      <AdminDirtyForm>
        <input type="hidden" name="projects-present" value="1" />
        {doc.projects.map((project, index) => {
          const named = resumeData.projects.find((row) => row.slug === project.slug);
          return (
            <details key={project.slug} className="border-2 border-ink p-4" open={index < 3 && !project.archived}>
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                {project.slug}
                {named ? ` · ${named.name}` : ""}
                {project.archived ? " · archived" : ""}
              </summary>
              <fieldset className="mt-4 grid gap-3 border-0 p-0">
                <legend className="sr-only">{project.slug}</legend>
                <label>
                  Purpose
                  <textarea name={`project-${project.slug}-purpose`} defaultValue={project.purpose} />
                </label>
                <label>
                  Impact
                  <input name={`project-${project.slug}-impact`} defaultValue={project.impact} />
                </label>
                <label>
                  Why
                  <textarea name={`project-${project.slug}-why`} defaultValue={project.why} />
                </label>
                <label>
                  Judgment
                  <textarea name={`project-${project.slug}-judgment`} defaultValue={project.judgment} />
                </label>
                <label>
                  Constraint
                  <textarea name={`project-${project.slug}-constraint`} defaultValue={project.constraint} />
                </label>
                <label>
                  Limitation
                  <textarea name={`project-${project.slug}-limitation`} defaultValue={project.limitation} />
                </label>
                <label>
                  Example
                  <textarea name={`project-${project.slug}-example`} defaultValue={project.example} />
                </label>
                <label className="flex-row items-center gap-2 normal-case tracking-normal">
                  <input
                    type="checkbox"
                    name={`project-${project.slug}-archived`}
                    defaultChecked={project.archived}
                  />
                  Archive (unpublish this exhibit)
                </label>
              </fieldset>
            </details>
          );
        })}
        <label>
          Publish note
          <input name="note" defaultValue={doc.note} />
        </label>
        <AdminActions save={saveDraftAction} publish={publishAction} />
      </AdminDirtyForm>
    </AdminFrame>
  );
}
