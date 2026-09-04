import { AdminFrame } from "@/components/admin/AdminFrame";
import { deleteMediaAction, importDocumentAction, replaceMediaAction, updateMediaAction, uploadMediaAction } from "@/lib/cms/actions";
import { cmsStoreStatus } from "@/lib/cms/backend";
import { postgresUrlSource } from "@/lib/cms/env";
import { formatLocalTime } from "@/lib/cms/health";
import { mediaUsedBy } from "@/lib/cms/media-usage";
import { getDraftDocument, getPublishedDocument, listMediaBlobs } from "@/lib/cms/store";

export default async function SettingsEditor({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    uploaded?: string;
    updated?: string;
    deleted?: string;
    replaced?: string;
    q?: string;
  }>;
}) {
  const q = await searchParams;
  const [published, draft, media] = await Promise.all([
    getPublishedDocument(),
    getDraftDocument(),
    listMediaBlobs(),
  ]);
  const status = cmsStoreStatus();
  const needle = (q.q ?? "").trim().toLowerCase();
  const shown = needle
    ? media.filter((item) => `${item.pathname} ${item.alt} ${item.caption} ${item.usage}`.toLowerCase().includes(needle))
    : media;
  return (
    <AdminFrame title="Site settings">
      {q.error ? <p className="admin-error">{q.error}</p> : null}
      {q.uploaded ? (
        <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
          File uploaded.
        </p>
      ) : null}
      {q.updated ? (
        <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
          Media details saved.
        </p>
      ) : null}
      {q.replaced ? (
        <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
          File replaced.
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
            invalidates every open session. Optional MFA: set <code>ADMIN_TOTP_SECRET</code> (base32) to require an
            authenticator code at sign-in. There is one owner and no recovery mailbox.
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
          <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Media library</dt>
          <dd className="mt-2 font-display text-[16px]">
            {process.env.BLOB_READ_WRITE_TOKEN ? (
              <>
                <form action={uploadMediaAction} className="admin-form">
                  <label>
                    File
                    <input type="file" name="media" required />
                  </label>
                  <label>
                    Alt text
                    <input name="alt" />
                  </label>
                  <label>
                    Caption
                    <input name="caption" />
                  </label>
                  <label>
                    Usage
                    <input name="usage" placeholder="Where this file is referenced" />
                  </label>
                  <label>
                    Focal point
                    <input name="focalPoint" defaultValue="50% 50%" />
                  </label>
                  <p>
                    <button type="submit" className="masthead-chip">
                      Upload file
                    </button>
                  </p>
                </form>
                {media.length ? (
                  <>
                    <form className="admin-form mt-4" method="get">
                      <label>
                        Search library
                        <input name="q" defaultValue={q.q ?? ""} />
                      </label>
                      <p>
                        <button type="submit" className="masthead-chip">
                          Filter
                        </button>
                      </p>
                    </form>
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {shown.map((item) => {
                      const usedBy = mediaUsedBy(item, [draft, published]);
                      return (
                      <li key={item.pathname} className="border-2 border-ink p-3">
                        {item.contentType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(item.pathname) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.alt || ""} className="mb-2 max-h-32 w-auto" />
                        ) : null}
                        <p className="font-mono text-[12px]">
                          <a href={item.url} className="text-book-blue underline" target="_blank" rel="noreferrer">
                            {item.pathname}
                          </a>
                        </p>
                        <p className="font-mono text-[12px] text-faded">
                          {item.contentType || "file"} · {item.size ? `${Math.round(item.size / 1024)} KB` : "size unknown"}{" "}
                          · {formatLocalTime(item.uploadedAt)}
                        </p>
                        {usedBy.length ? (
                          <p className="mt-2 font-mono text-[12px] text-faded">Used by {usedBy.join(" · ")}</p>
                        ) : (
                          <p className="mt-2 font-mono text-[12px] text-faded">
                            Not referenced by a claim, project plate, chess note, or article.
                          </p>
                        )}
                        <form action={updateMediaAction} className="admin-form mt-3">
                          <input type="hidden" name="pathname" value={item.pathname} />
                          <label>
                            Alt text
                            <input name="alt" defaultValue={item.alt} />
                          </label>
                          <label>
                            Caption
                            <input name="caption" defaultValue={item.caption} />
                          </label>
                          <label>
                            Usage
                            <input name="usage" defaultValue={item.usage} />
                          </label>
                          <label>
                            Focal point
                            <input name="focalPoint" defaultValue={item.focalPoint || "50% 50%"} />
                          </label>
                          <p className="flex flex-wrap gap-2">
                            <button type="submit" className="masthead-chip">
                              Save details
                            </button>
                          </p>
                        </form>
                        <form action={replaceMediaAction} className="admin-form mt-2">
                          <input type="hidden" name="pathname" value={item.pathname} />
                          <label>
                            Replace file
                            <input type="file" name="media" required />
                          </label>
                          <p>
                            <button type="submit" className="masthead-chip">
                              Replace file
                            </button>
                          </p>
                        </form>
                        <form action={deleteMediaAction} className="mt-2">
                          <input type="hidden" name="pathname" value={item.pathname} />
                          <button type="submit" className="masthead-chip" disabled={usedBy.length > 0}>
                            {usedBy.length ? "Delete protected while in use" : "Delete"}
                          </button>
                        </form>
                      </li>
                      );
                    })}
                    </ul>
                    {!shown.length ? (
                      <p className="mt-2 text-faded">No files match that search.</p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-faded">
                    No files yet. Upload an image or document, then add alt text and usage.
                  </p>
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
