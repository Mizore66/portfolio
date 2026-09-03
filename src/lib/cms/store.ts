import { cookies } from "next/headers";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { cmsBackendKind, cmsStoreStatus } from "@/lib/cms/backend";
import { postgresNeedsSsl, postgresUrl } from "@/lib/cms/env";
import { CMS_UNWRITABLE, CmsStoreError } from "@/lib/cms/errors";
import { hydrateDocument } from "@/lib/cms/hydrate";
import { ledgerDocument } from "@/lib/cms/ledger";
import { PREVIEW_COOKIE, SESSION_COOKIE, verifySession } from "@/lib/cms/session";
import type { CmsStoreFile, SiteDocument } from "@/lib/cms/types";

const FILE = join(process.cwd(), "data", "cms.json");
const BLOB_PATH = "cms/store.json";
const STORE_ID = "site";
export const HISTORY_CAP = 40;

function emptyStore(): CmsStoreFile {
  return { draft: null, published: null, revisions: [], audit: [] };
}

function asStore(raw: unknown): CmsStoreFile {
  if (!raw || typeof raw !== "object") return emptyStore();
  const row = raw as Partial<CmsStoreFile>;
  return {
    draft: row.draft ?? null,
    published: row.published ?? null,
    revisions: Array.isArray(row.revisions) ? row.revisions : [],
    audit: Array.isArray(row.audit) ? row.audit : [],
  };
}

async function readFileStore(): Promise<CmsStoreFile> {
  try {
    const raw = await readFile(FILE, "utf8");
    return asStore(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

async function writeFileStore(store: CmsStoreFile) {
  try {
    await mkdir(dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOENT") {
      throw new CmsStoreError(CMS_UNWRITABLE);
    }
    throw error;
  }
}

async function readStreamText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

async function readBlobStore(): Promise<CmsStoreFile | null> {
  try {
    const { get } = await import("@vercel/blob");
    const result = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return asStore(JSON.parse(await readStreamText(result.stream)));
  } catch {
    return null;
  }
}

async function writeBlobStore(store: CmsStoreFile) {
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATH, JSON.stringify(store), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

type Sql = Awaited<ReturnType<typeof openSql>>;

async function openSql() {
  const url = postgresUrl();
  if (!url) return null;
  const postgres = (await import("postgres")).default;
  return postgres(url, { max: 1, ssl: postgresNeedsSsl(url) ? "require" : false });
}

async function ensurePostgresTables(sql: NonNullable<Sql>) {
  await sql`
    create table if not exists cms_store (
      id text primary key,
      payload jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists cms_revisions (
      id text primary key,
      status text not null,
      document jsonb not null,
      note text,
      created_at timestamptz not null default now(),
      published_at timestamptz
    )
  `;
  await sql`
    create table if not exists cms_audit (
      id text primary key,
      action text not null,
      at timestamptz not null default now(),
      note text
    )
  `;
}

async function readPostgresStore(): Promise<CmsStoreFile | null> {
  const sql = await openSql();
  if (!sql) return null;
  try {
    await ensurePostgresTables(sql);
    const rows = await sql<{ payload: CmsStoreFile }[]>`
      select payload from cms_store where id = ${STORE_ID} limit 1
    `;
    if (rows[0]?.payload) return asStore(rows[0].payload);
    const published = await sql<{ document: SiteDocument }[]>`
      select document from cms_revisions
      where status = 'published'
      order by published_at desc
      limit 1
    `;
    const draft = await sql<{ document: SiteDocument }[]>`
      select document from cms_revisions
      where status = 'draft'
      order by created_at desc
      limit 1
    `;
    const history = await sql<{ document: SiteDocument }[]>`
      select document from cms_revisions
      order by created_at desc
      limit ${HISTORY_CAP}
    `;
    if (!published[0] && !draft[0]) return null;
    return {
      published: published[0]?.document ?? null,
      draft: draft[0]?.document ?? null,
      revisions: history.map((row) => row.document),
      audit: [],
    };
  } catch {
    return null;
  } finally {
    await sql.end({ timeout: 2 });
  }
}

async function writePostgresStore(store: CmsStoreFile, doc: SiteDocument, action: string) {
  const sql = await openSql();
  if (!sql) throw new CmsStoreError("Postgres URL is set but a connection could not be opened.");
  try {
    await ensurePostgresTables(sql);
    await sql`
      insert into cms_store (id, payload, updated_at)
      values (${STORE_ID}, ${sql.json(store as never)}, now())
      on conflict (id) do update set
        payload = excluded.payload,
        updated_at = now()
    `;
    await sql`
      insert into cms_revisions (id, status, document, note, published_at)
      values (
        ${doc.revisionId},
        ${doc.status},
        ${sql.json(doc as never)},
        ${doc.note},
        ${doc.status === "published" ? doc.publishedAt : null}
      )
      on conflict (id) do update set
        status = excluded.status,
        document = excluded.document,
        note = excluded.note,
        published_at = excluded.published_at
    `;
    await sql`
      insert into cms_audit (id, action, note)
      values (${`${action}-${doc.revisionId}`}, ${action}, ${doc.note})
      on conflict (id) do nothing
    `;
  } finally {
    await sql.end({ timeout: 2 });
  }
}

async function readStore(): Promise<CmsStoreFile> {
  const kind = cmsBackendKind();
  if (kind === "postgres") {
    return (await readPostgresStore()) ?? emptyStore();
  }
  if (kind === "blob") {
    return (await readBlobStore()) ?? emptyStore();
  }
  return readFileStore();
}

async function writeStore(store: CmsStoreFile, doc: SiteDocument, action: string) {
  const status = cmsStoreStatus();
  if (!status.writable) throw new CmsStoreError(CMS_UNWRITABLE);
  if (status.backend === "postgres") {
    await writePostgresStore(store, doc, action);
    return;
  }
  if (status.backend === "blob") {
    await writeBlobStore(store);
    return;
  }
  await writeFileStore(store);
}

export async function getPublishedDocument(): Promise<SiteDocument> {
  const store = await readStore();
  return hydrateDocument(store.published ?? ledgerDocument());
}

export async function getRenderableDocument(): Promise<SiteDocument> {
  const jar = await cookies();
  const preview = jar.get(PREVIEW_COOKIE)?.value === "1";
  const authed = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (preview && authed) return getDraftDocument();
  return getPublishedDocument();
}

export async function getRevision(id: string): Promise<SiteDocument | null> {
  const store = await readStore();
  const found = store.revisions.find((row) => row.revisionId === id) ?? null;
  return found ? hydrateDocument(found) : null;
}

export async function restoreRevision(id: string): Promise<SiteDocument> {
  const found = await getRevision(id);
  if (!found) throw new CmsStoreError("Revision not found.");
  return saveDraft({
    ...found,
    note: `Restored ${id}`,
  });
}

export async function getDraftDocument(): Promise<SiteDocument> {
  const store = await readStore();
  if (store.draft) return hydrateDocument(store.draft);
  return getPublishedDocument();
}

export async function getCmsState(): Promise<
  CmsStoreFile & {
    ledger: SiteDocument;
    backend: string;
    writable: boolean;
    durable: boolean;
  }
> {
  const store = await readStore();
  const status = cmsStoreStatus();
  return {
    ...store,
    published: store.published ? hydrateDocument(store.published) : null,
    draft: store.draft ? hydrateDocument(store.draft) : null,
    revisions: store.revisions.map((row) => hydrateDocument(row)),
    ledger: ledgerDocument(),
    backend: status.backend,
    writable: status.writable,
    durable: status.durable,
  };
}

function remember(store: CmsStoreFile, next: SiteDocument, action: string, at: string): CmsStoreFile {
  return {
    ...store,
    draft: next,
    published: action === "publish" ? next : store.published,
    revisions: [next, ...store.revisions.filter((row) => row.revisionId !== next.revisionId)].slice(0, HISTORY_CAP),
    audit: [{ at, action, note: next.note }, ...store.audit].slice(0, HISTORY_CAP),
  };
}

export async function saveDraft(doc: SiteDocument): Promise<SiteDocument> {
  const next: SiteDocument = {
    ...doc,
    revisionId: `draft-${Date.now()}`,
    status: "draft",
  };
  const store = remember(await readStore(), next, "draft", new Date().toISOString());
  await writeStore(store, next, "draft");
  return next;
}

export async function publishDocument(doc: SiteDocument): Promise<SiteDocument> {
  const next: SiteDocument = {
    ...doc,
    revisionId: `pub-${Date.now()}`,
    status: "published",
    publishedAt: new Date().toISOString(),
  };
  const store = remember(await readStore(), next, "publish", next.publishedAt);
  await writeStore(store, next, "publish");
  return next;
}

export async function listMediaBlobs(): Promise<{ pathname: string; url: string; uploadedAt: string }[]> {
  if (!cmsStoreStatus().durable && cmsBackendKind() !== "blob") {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: "cms/media/", limit: 40 });
    return result.blobs.map((blob) => ({
      pathname: blob.pathname,
      url: blob.url,
      uploadedAt: blob.uploadedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function uploadMediaBlob(file: File): Promise<{ pathname: string; url: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new CmsStoreError("Set BLOB_READ_WRITE_TOKEN before uploading media.");
  }
  const safe = file.name.replace(/[^\w.\-]+/g, "-").slice(0, 80) || "upload";
  const { put } = await import("@vercel/blob");
  const stored = await put(`cms/media/${Date.now()}-${safe}`, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || "application/octet-stream",
  });
  return { pathname: stored.pathname, url: stored.url };
}
