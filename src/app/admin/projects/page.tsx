import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm, EditorSearch, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";
import { projectSchemaReady } from "@/lib/cms/validate";

export default async function ProjectsEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Projects"
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
        Title, date, category, source, technologies, and SEO overlay the public exhibits. Archive hides a filing
        from Selected work, the sitemap, and the exhibit URL. Patent plates still compile from the TypeScript ledger.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/projects">
        <input type="hidden" name="projects-present" value="1" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Order</p>
        <ReorderList name="project-order" ids={doc.projects.map((project) => project.slug)} />
        <EditorSearch>
          {doc.projects.map((project, index) => {
            const missing = projectSchemaReady(project);
            return (
              <details key={project.slug} className="border-2 border-ink p-4" open={index < 2 && !project.archived}>
                <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                  {project.slug}
                  {project.title ? ` · ${project.title}` : ""}
                  {project.archived ? " · archived" : ""}
                  {missing.length ? " · incomplete" : " · complete"}
                </summary>
                <fieldset className="mt-4 grid gap-3 border-0 p-0">
                  <legend className="sr-only">{project.slug}</legend>
                  <label>
                    Title
                    <input name={`project-${project.slug}-title`} defaultValue={project.title} />
                  </label>
                  <label>
                    Subtitle
                    <input name={`project-${project.slug}-subtitle`} defaultValue={project.subtitle} />
                  </label>
                  <label>
                    Date
                    <input name={`project-${project.slug}-date`} defaultValue={project.date} />
                  </label>
                  <label>
                    Category
                    <input name={`project-${project.slug}-category`} defaultValue={project.category} />
                  </label>
                  <label>
                    Technologies (comma-separated)
                    <input name={`project-${project.slug}-tech`} defaultValue={project.tech} />
                  </label>
                  <label>
                    Source URL
                    <input name={`project-${project.slug}-github`} defaultValue={project.github} />
                  </label>
                  <label>
                    SEO title
                    <input name={`project-${project.slug}-seoTitle`} defaultValue={project.seoTitle} />
                  </label>
                  <label>
                    SEO / Open Graph description
                    <textarea name={`project-${project.slug}-seoDescription`} defaultValue={project.seoDescription} />
                  </label>
                  <label>
                    Problem
                    <textarea name={`project-${project.slug}-why`} defaultValue={project.why} />
                  </label>
                  <label>
                    Purpose
                    <textarea name={`project-${project.slug}-purpose`} defaultValue={project.purpose} />
                  </label>
                  <label>
                    Impact
                    <input name={`project-${project.slug}-impact`} defaultValue={project.impact} />
                  </label>
                  <label>
                    Decision and rationale
                    <textarea name={`project-${project.slug}-judgment`} defaultValue={project.judgment} />
                  </label>
                  <label>
                    Known limitations
                    <textarea name={`project-${project.slug}-limitation`} defaultValue={project.limitation} />
                  </label>
                  <label>
                    Constraint
                    <textarea name={`project-${project.slug}-constraint`} defaultValue={project.constraint} />
                  </label>
                  <label>
                    Concrete input/output example
                    <textarea name={`project-${project.slug}-example`} defaultValue={project.example} />
                  </label>
                  <label>
                    Alternatives considered and why rejected
                    <textarea name={`project-${project.slug}-rejected`} defaultValue={project.rejected} />
                  </label>
                  <label>
                    Retrospective: what I would change now
                    <textarea name={`project-${project.slug}-retrospective`} defaultValue={project.retrospective} />
                  </label>
                  <label className="flex-row items-center gap-2 normal-case tracking-normal">
                    <input
                      type="checkbox"
                      name={`project-${project.slug}-archived`}
                      defaultChecked={project.archived}
                    />
                    Archive this exhibit
                  </label>
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    Archiving removes the homepage card and the public exhibit URL in preview and after publish.
                    The TypeScript page file remains; restore the overlay to republish.
                  </p>
                  {missing.length ? (
                    <p className="admin-error">Missing case-study fields: {missing.join(", ")}</p>
                  ) : null}
                </fieldset>
              </details>
            );
          })}
        </EditorSearch>
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
