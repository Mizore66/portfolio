import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm, ApparatusRows, EditorSearch, MediaPicker, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument, listMediaBlobs } from "@/lib/cms/store";
import { LEDGER_PROJECT_SLUGS, projectSchemaReady } from "@/lib/cms/validate";

export default async function ProjectsEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published, media] = await Promise.all([getDraftDocument(), getPublishedDocument(), listMediaBlobs()]);
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
        New projects start archived and unpublished. Ledger exhibits compiled from TypeScript can be archived, not
        permanently deleted. CMS-created projects can be deleted while they remain unpublished. Patent drawings still
        compile from the TypeScript ledger.
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
                    Display publication date
                    <input name={`project-${project.slug}-date`} defaultValue={project.date} />
                  </label>
                  <label>
                    Category
                    <input name={`project-${project.slug}-category`} defaultValue={project.category} />
                  </label>
                  <label>
                    Technologies
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
                  <label>
                    Case-study takeaways (one per line)
                    <textarea name={`project-${project.slug}-bullets`} defaultValue={project.bullets} rows={4} />
                  </label>
                  <label>
                    Description
                    <textarea name={`project-${project.slug}-description`} defaultValue={project.description} />
                  </label>
                  <label>
                    Article image
                    <MediaPicker name={`project-${project.slug}-plate`} defaultValue={project.plate} assets={media} />
                  </label>
                  <label>
                    Caption
                    <input name={`project-${project.slug}-plateCaption`} defaultValue={project.plateCaption} />
                  </label>
                  <label>
                    Image description
                    <input name={`project-${project.slug}-plateAlt`} defaultValue={project.plateAlt} />
                  </label>
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    Describe information that is not already in the caption.
                  </p>
                  <label>
                    Apparatus name
                    <input name={`project-${project.slug}-apparatusName`} defaultValue={project.apparatusName} />
                  </label>
                  <label>
                    Apparatus runtime
                    <input name={`project-${project.slug}-apparatusRuntime`} defaultValue={project.apparatusRuntime} />
                  </label>
                  <ApparatusRows
                    name={`project-${project.slug}-apparatusPath`}
                    defaultValue={project.apparatusPath}
                    legend="Main request path"
                  />
                  <ApparatusRows
                    name={`project-${project.slug}-apparatusBeside`}
                    defaultValue={project.apparatusBeside}
                    legend="Supporting components"
                  />
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    Supporting components do not sit on the synchronous request path.
                  </p>
                  <label className="flex-row items-center gap-2 normal-case tracking-normal">
                    <input
                      type="checkbox"
                      name={`project-${project.slug}-archived`}
                      defaultChecked={project.archived}
                    />
                    Archive this exhibit
                  </label>
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    {LEDGER_PROJECT_SLUGS.has(project.slug)
                      ? "Removes this project from the homepage, public route, Opening Preparation references, résumé, and sitemap after publish. The TypeScript ledger keeps a copy, so this row cannot be permanently deleted."
                      : "Removes this project from the homepage, public route, Opening Preparation references, résumé, and sitemap after publish. Unpublished CMS-only rows can be deleted."}
                  </p>
                  <p className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="masthead-chip"
                      name="project-duplicate"
                      value={project.slug}
                      formAction={saveDraftAction}
                    >
                      Duplicate
                    </button>
                    {!LEDGER_PROJECT_SLUGS.has(project.slug) ? (
                      <button
                        type="submit"
                        className="masthead-chip"
                        name="project-delete"
                        value={project.slug}
                        formAction={saveDraftAction}
                      >
                        Delete
                      </button>
                    ) : null}
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
          Create project
          <input name="project-new-title" placeholder="Title — a unique slug is generated" />
        </label>
        <p>
          <button type="submit" name="project-create" value="1" className="masthead-chip" formAction={saveDraftAction}>
            Create project
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
