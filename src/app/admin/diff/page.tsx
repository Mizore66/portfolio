import { AdminFrame } from "@/app/admin/layout";
import { groupedDocumentDiff, editorHrefForPath, wordDiff } from "@/lib/cms/diff";
import { getCmsState, getRevision } from "@/lib/cms/store";
import { ledgerDocument } from "@/lib/cms/ledger";

export default async function DiffEditor({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const q = await searchParams;
  const state = await getCmsState();
  const published = state.published ?? state.ledger;
  const draft = state.draft ?? published;
  const fromDoc =
    !q.from || q.from === "ledger"
      ? published
      : ((await getRevision(q.from)) ?? (q.from === published.revisionId ? published : ledgerDocument()));
  const toDoc =
    !q.to || q.to === "draft"
      ? draft
      : ((await getRevision(q.to)) ?? (q.to === draft.revisionId ? draft : draft));
  const groups = groupedDocumentDiff(fromDoc, toDoc);
  const comparing = Boolean(q.from || q.to);
  return (
    <AdminFrame title={comparing ? "Revision comparison" : "Draft vs published"}>
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        {comparing
          ? `Comparing ${fromDoc.revisionId} → ${toDoc.revisionId}.`
          : "Fields that differ between the live plate and the draft in hand, grouped by claim and project."}
      </p>
      <form className="admin-form mt-6" method="get">
        <label>
          From revision
          <input name="from" defaultValue={q.from ?? published.revisionId} />
        </label>
        <label>
          To revision
          <input name="to" defaultValue={q.to ?? draft.revisionId} />
        </label>
        <p>
          <button type="submit" className="masthead-chip">
            Compare
          </button>
        </p>
      </form>
      {groups.length === 0 ? (
        <p className="mt-6 font-mono text-[12px] text-faded">Draft matches published.</p>
      ) : (
        <div className="mt-6 grid gap-8">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`diff-${group.id}`}>
              <h2 id={`diff-${group.id}`} className="font-display text-[18px] text-ink">
                {group.heading}
              </h2>
              <table className="mt-3 w-full font-mono text-[12px] text-ink">
                <thead>
                  <tr className="text-left text-faded">
                    <th className="font-normal">Field</th>
                    <th className="font-normal">From</th>
                    <th className="font-normal">To</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.path} className="align-top">
                      <th scope="row" className="py-2 pr-3 font-normal text-faded">
                        {row.path}
                      </th>
                      <td className="py-2 pr-3">
                        {wordDiff(row.from, row.to)
                          .filter((mark) => mark.type !== "ins")
                          .map((mark, i) => (
                            <span key={`from-${row.path}-${i}`} className={mark.type === "del" ? "diff-del" : undefined}>
                              {mark.text}
                            </span>
                          ))}
                      </td>
                      <td className="py-2">
                        <a href={editorHrefForPath(row.path)} className="text-book-blue underline">
                          Edit
                        </a>{" "}
                        {wordDiff(row.from, row.to)
                          .filter((mark) => mark.type !== "del")
                          .map((mark, i) => (
                            <span key={`to-${row.path}-${i}`} className={mark.type === "ins" ? "diff-ins" : undefined}>
                              {mark.text}
                            </span>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </AdminFrame>
  );
}
