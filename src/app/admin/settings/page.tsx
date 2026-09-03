import { AdminFrame } from "@/app/admin/layout";
import { postgresUrlSource } from "@/lib/cms/env";
import { getPublishedDocument } from "@/lib/cms/store";

export default async function SettingsEditor() {
  const published = await getPublishedDocument();
  return (
    <AdminFrame title="Site settings">
      <dl className="grid gap-4">
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Published at</dt>
          <dd className="mt-1 font-display text-[18px]">{published.publishedAt.slice(0, 10)}</dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Passphrase</dt>
          <dd className="mt-1 max-w-[62ch] font-display text-[16px] leading-snug text-ink">
            Store only <code>ADMIN_PASSWORD_HASH</code> (Argon2id). Run <code>npm run cms:hash</code> locally,
            paste the hash into Vercel, and delete any plaintext <code>ADMIN_PASSWORD</code>. Rotating the hash
            invalidates every open session.
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Revision</dt>
          <dd className="mt-1 font-display text-[18px]">{published.revisionId}</dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Backup</dt>
          <dd className="mt-1 font-display text-[16px]">
            <a href="/admin/export" className="text-book-blue underline decoration-2 underline-offset-4">
              Export JSON
            </a>
          </dd>
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
            {postgresUrlSource()
              ? `${postgresUrlSource()} present. Published revisions write to Postgres. SUPABASE_URL is the HTTPS API and is ignored.`
              : "No Postgres URL. Vercel Marketplace Supabase sets POSTGRES_URL; SUPABASE_URL is not a database. This environment falls back to data/cms.json."}
          </dd>
        </div>
      </dl>
    </AdminFrame>
  );
}
