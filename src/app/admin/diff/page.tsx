import { AdminFrame } from "@/app/admin/layout";
import { documentDiff } from "@/lib/cms/diff";
import { getCmsState } from "@/lib/cms/store";

export default async function DiffEditor() {
  const state = await getCmsState();
  const published = state.published ?? state.ledger;
  const draft = state.draft ?? published;
  const rows = documentDiff(published, draft);
  return (
    <AdminFrame title="Draft vs published">
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Fields that differ between the live plate and the draft in hand.
      </p>
      {rows.length === 0 ? (
        <p className="mt-6 font-mono text-[12px] text-faded">Draft matches published.</p>
      ) : (
        <table className="mt-6 w-full font-mono text-[12px] text-ink">
          <thead>
            <tr className="text-left text-faded">
              <th className="font-normal">Field</th>
              <th className="font-normal">Published</th>
              <th className="font-normal">Draft</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.path} className="align-top">
                <th scope="row" className="py-2 pr-3 font-normal text-faded">
                  {row.path}
                </th>
                <td className="py-2 pr-3">{row.from || "—"}</td>
                <td className="py-2">{row.to || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminFrame>
  );
}
