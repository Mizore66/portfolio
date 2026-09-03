import { AdminFrame } from "@/app/admin/layout";
import { importDocumentAction, uploadMediaAction } from "@/lib/cms/actions";
import { cmsStoreStatus } from "@/lib/cms/backend";
import { postgresUrlSource } from "@/lib/cms/env";
import { getPublishedDocument, listMediaBlobs } from "@/lib/cms/store";

export default async function SettingsEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; uploaded?: string }>;
}) {
  const q = await searchParams;
  const published = await getPublishedDocument();
  const status = cmsStoreStatus();
  const media = await listMediaBlobs();
  return (
    <AdminFrame title="Site settings">
      {q.error ? <p className="admin-error">{q.error}</p> : null}
      {q.uploaded ? (
        <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
          Media uploaded.
        </p>
      ) : null}
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
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Import</dt>
          <dd className="mt-2">
            <form action={importDocumentAction} className="admin-form">
              <label>
                JSON file
                <input type="file" name="payload" accept="application/json,.json" />
              </label>
              <label>
                Or paste JSON
                <textarea name="json" rows={6} />
              </label>
              <p>
                <button type="submit" className="masthead-chip">
                  Import into draft
                </button>
              </p>
            </form>
            <p className="mt-2 max-w-[62ch] font-display text-[15px] text-faded">
              Import lands in draft only. Publish from the editor after you have read the diff.
            </p>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Media</dt>
          <dd className="mt-2 font-display text-[16px]">
            {process.env.BLOB_READ_WRITE_TOKEN ? (
              <>
                <form action={uploadMediaAction} className="admin-form">
                  <label>
                    Upload image or file
                    <input type="file" name="media" required />
                  </label>
                  <p>
                    <button type="submit" className="masthead-chip">
                      Upload to Blob
                    </button>
                  </p>
                </form>
                {media.length ? (
                  <ul className="mt-3 space-y-2 font-mono text-[12px]">
                    {media.map((item) => (
                      <li key={item.pathname}>
                        <a href={item.url} className="text-book-blue underline" target="_blank" rel="noreferrer">
                          {item.pathname}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-faded">No media objects yet.</p>
                )}
              </>
            ) : (
              "Set BLOB_READ_WRITE_TOKEN for uploads. Do not use a local uploads folder on Vercel."
            )}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Database</dt>
          <dd className="mt-1 font-display text-[16px]">
            {postgresUrlSource()
              ? `${postgresUrlSource()} present. Drafts, history, and published revisions write to Postgres.`
              : status.backend === "blob"
                ? "No Postgres URL. Drafts persist to a private Vercel Blob object. Marketplace Supabase sets POSTGRES_URL; SUPABASE_URL is not a database."
                : "No Postgres URL and no Blob token. This environment falls back to data/cms.json, which is read-only on Vercel."}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Health</dt>
          <dd className="mt-1 font-display text-[16px]">
            <code>/api/cms-health</code> returns 503 when a Vercel deploy has no writable store.
          </dd>
        </div>
      </dl>
    </AdminFrame>
  );
}
