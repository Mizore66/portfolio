import { AdminFrame } from "@/app/admin/layout";
import { ChessLinePreview } from "@/components/admin/ChessLinePreview";
import { AdminActions, AdminDirtyForm, EditorSearch, MediaPicker } from "@/components/admin/AdminForm";
import { annotatedMainlinePgn, compiledMainlinePgn, pgnMatchesRepertoire } from "@/lib/cms/chess-notes";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { editorBar } from "@/lib/cms/editor-state";
import { getDraftDocument, getPublishedDocument, listMediaBlobs } from "@/lib/cms/store";
import { issueChapters } from "@/lib/opening/tree";

const KINDS = [
  ["", "None"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["project", "Project"],
  ["lab", "Lab"],
  ["outlook", "Outlook"],
] as const;

export default async function ChessEditor({
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
  const expectedPgn = compiledMainlinePgn();
  const pgnOk = pgnMatchesRepertoire(doc.chessPgn || expectedPgn);
  const career = new Set(issueChapters().map((node) => node.id));
  return (
    <AdminFrame
      title="Chess line"
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
        PGN comments overlay annotations by mainline SAN. The public scoresheet tree stays the compiled Italian Game —
        changing a SAN is rejected. White career moves may be marked featured. Each note should point at one Experience,
        Education, Project, Lab, or Outlook record.
      </p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/chess">
        <input type="hidden" name="chess-present" value="1" />
        <label>
          Mainline PGN
          <textarea name="chess-pgn" defaultValue={doc.chessPgn || expectedPgn} rows={4} />
        </label>
        <p className={pgnOk ? "font-mono text-[12px] text-faded" : "admin-error"}>
          {pgnOk
            ? "Legal mainline. {comments} after a SAN are imported onto that move’s annotation when the box below is checked."
            : "This PGN does not match the compiled Italian Game mainline."}
        </p>
        <label className="flex-row items-center gap-2 normal-case tracking-normal">
          <input type="checkbox" name="chess-import-comments" />
          On save, copy {"{comments}"} from this PGN onto the matching annotations
        </label>
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Export with current annotations</p>
        <pre className="overflow-x-auto border-2 border-ink p-3 font-mono text-[12px] leading-relaxed">
          {annotatedMainlinePgn(doc.chess)}
        </pre>
        <ChessLinePreview nodeIds={doc.chess.map((note) => note.id)} />
        <EditorSearch>
          {doc.chess.map((note) => (
            <details key={note.id} className="border-2 border-ink p-4" open={career.has(note.id)}>
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                {note.id}
                {note.featured ? " · featured" : ""}
                {note.entityKind ? ` · ${note.entityKind}` : ""}
              </summary>
              <fieldset className="mt-4 grid gap-3 border-0 p-0">
                <legend className="sr-only">{note.id}</legend>
                <label>
                  Literal résumé sentence
                  <textarea name={`chess-${note.id}-fact`} defaultValue={note.fact} rows={3} />
                </label>
                <label>
                  Annotation
                  <textarea name={`chess-${note.id}-commentary`} defaultValue={note.commentary} rows={3} />
                </label>
                <label>
                  Linked entity kind
                  <select name={`chess-${note.id}-entityKind`} defaultValue={note.entityKind}>
                    {KINDS.map(([value, label]) => (
                      <option key={value || "none"} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Linked entity id
                  <input name={`chess-${note.id}-entityId`} defaultValue={note.entityId} />
                </label>
                <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                  Experience and education ids are the CMS row ids. Projects use the slug. Lab is
                  learned-evaluator. Outlook may be blank.
                </p>
                <label>
                  Optional plate
                  <MediaPicker
                    name={`chess-${note.id}-mediaPathname`}
                    defaultValue={note.mediaPathname}
                    assets={media}
                    valueKind="pathname"
                  />
                </label>
                <label className="flex-row items-center gap-2 normal-case tracking-normal">
                  <input type="checkbox" name={`chess-${note.id}-featured`} defaultChecked={note.featured} />
                  Featured White career highlight
                </label>
              </fieldset>
            </details>
          ))}
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
