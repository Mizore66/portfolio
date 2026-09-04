import { AdminFrame } from "@/components/admin/AdminFrame";
import { RestoreToDraftButton } from "@/components/admin/DangerActions";
import { getRevision } from "@/lib/cms/store";
import { notFound } from "next/navigation";

export default async function SnapshotPreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getRevision(decodeURIComponent(id));
  if (!doc) notFound();
  return (
    <AdminFrame title="Snapshot preview">
      <p className="font-mono text-[12px] text-faded">
        {doc.status} · {doc.revisionId} · {doc.note}
      </p>
      <p className="mt-4 max-w-[62ch] font-display text-[18px]">{doc.profile.dek}</p>
      <p className="mt-2 max-w-[62ch] font-display text-[16px] text-faded">{doc.profile.availability}</p>
      <ul className="mt-6 grid gap-2">
        {doc.claims.filter((claim) => claim.heroEligible).map((claim) => (
          <li key={claim.id} className="border-2 border-ink p-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em]">{claim.id}</p>
            <p className="mt-1 font-display text-[16px]">{claim.display}</p>
            <p className="mt-1 font-mono text-[12px] text-faded">{claim.method || "—"}</p>
          </li>
        ))}
      </ul>
      <RestoreToDraftButton revisionId={doc.revisionId} />
    </AdminFrame>
  );
}
