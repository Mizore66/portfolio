import { cookies } from "next/headers";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { postgresNeedsSsl, postgresUrl } from "@/lib/cms/env";
import { ledgerDocument } from "@/lib/cms/ledger";
import { PREVIEW_COOKIE, SESSION_COOKIE, verifySession } from "@/lib/cms/session";
import type { CmsStoreFile, SiteDocument } from "@/lib/cms/types";

const FILE = join(process.cwd(), "data", "cms.json");

function emptyStore(): CmsStoreFile {
  return { draft: null, published: null, revisions: [], audit: [] };
}

async function readFileStore(): Promise<CmsStoreFile> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as CmsStoreFile;
  } catch {
    return emptyStore();
  }
}

async function writeFileStore(store: CmsStoreFile) {
  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2));
}

async function readPostgresPublished(): Promise<SiteDocument | null> {
  const url = postgresUrl();
  if (!url) return null;
  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(url, { max: 1, ssl: postgresNeedsSsl(url) ? "require" : false });
    try {
      const rows = await sql<SiteDocument[]>`
        select document from cms_revisions
        where status = 'published'
        order by published_at desc
        limit 1
      `;
      const row = rows[0] as unknown as { document?: SiteDocument } | SiteDocument | undefined;
      if (!row) return null;
      if ("document" in row && row.document) return row.document;
      return row as SiteDocument;
    } finally {
      await sql.end({ timeout: 2 });
    }
  } catch {
    return null;
  }
}

async function writePostgres(doc: SiteDocument, action: string) {
  const url = postgresUrl();
  if (!url) return false;
  const postgres = (await import("postgres")).default;
  const sql = postgres(url, { max: 1, ssl: postgresNeedsSsl(url) ? "require" : false });
  try {
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
    `;
    return true;
  } finally {
    await sql.end({ timeout: 2 });
  }
}

export async function getPublishedDocument(): Promise<SiteDocument> {
  const fromDb = await readPostgresPublished();
  if (fromDb) return fromDb;
  const store = await readFileStore();
  return store.published ?? ledgerDocument();
}

export async function getRenderableDocument(): Promise<SiteDocument> {
  const jar = await cookies();
  const preview = jar.get(PREVIEW_COOKIE)?.value === "1";
  const authed = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (preview && authed) return getDraftDocument();
  return getPublishedDocument();
}

export async function getRevision(id: string): Promise<SiteDocument | null> {
  const store = await readFileStore();
  return store.revisions.find((row) => row.revisionId === id) ?? null;
}

export async function restoreRevision(id: string): Promise<SiteDocument> {
  const found = await getRevision(id);
  if (!found) throw new Error("Revision not found.");
  return saveDraft({
    ...found,
    note: `Restored ${id}`,
  });
}

export async function getDraftDocument(): Promise<SiteDocument> {
  const store = await readFileStore();
  return store.draft ?? store.published ?? ledgerDocument();
}

export async function getCmsState(): Promise<CmsStoreFile & { ledger: SiteDocument; backend: string }> {
  const store = await readFileStore();
  return {
    ...store,
    ledger: ledgerDocument(),
    backend: postgresUrl() ? "postgres" : "file",
  };
}

export async function saveDraft(doc: SiteDocument): Promise<SiteDocument> {
  const next: SiteDocument = {
    ...doc,
    revisionId: `draft-${Date.now()}`,
    status: "draft",
  };
  const store = await readFileStore();
  store.draft = next;
  store.revisions = [next, ...store.revisions].slice(0, 40);
  store.audit.unshift({ at: new Date().toISOString(), action: "draft", note: next.note });
  await writeFileStore(store);
  await writePostgres(next, "draft").catch(() => false);
  return next;
}

export async function publishDocument(doc: SiteDocument): Promise<SiteDocument> {
  const next: SiteDocument = {
    ...doc,
    revisionId: `pub-${Date.now()}`,
    status: "published",
    publishedAt: new Date().toISOString(),
  };
  const store = await readFileStore();
  store.published = next;
  store.draft = next;
  store.revisions = [next, ...store.revisions].slice(0, 40);
  store.audit.unshift({ at: next.publishedAt, action: "publish", note: next.note });
  const url = postgresUrl();
  if (url) {
    const ok = await writePostgres(next, "publish");
    if (!ok) throw new Error("Publish did not land in Postgres.");
  }
  await writeFileStore(store);
  return next;
}
