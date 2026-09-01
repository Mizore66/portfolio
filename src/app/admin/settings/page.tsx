import { AdminFrame } from "@/app/admin/layout";
import { getPublishedDocument } from "@/lib/cms/store";

export default async function SettingsEditor() {
  const published = await getPublishedDocument();
  return (
    <AdminFrame title="Site settings">
      <dl className="grid gap-4">
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Published at</dt>
          <dd className="mt-1 font-display text-[18px]">{published.publishedAt}</dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Revision</dt>
          <dd className="mt-1 font-display text-[18px]">{published.revisionId}</dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Media</dt>
          <dd className="mt-1 font-display text-[16px]">
            {process.env.BLOB_READ_WRITE_TOKEN
              ? "Vercel Blob token present."
              : "Set BLOB_READ_WRITE_TOKEN for uploads. Do not use a local uploads folder on Vercel."}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Database</dt>
          <dd className="mt-1 font-display text-[16px]">
            {process.env.DATABASE_URL
              ? "DATABASE_URL present. Published revisions write to Postgres."
              : "No DATABASE_URL. This environment uses data/cms.json; Vercel production should use Postgres."}
          </dd>
        </div>
      </dl>
    </AdminFrame>
  );
}
