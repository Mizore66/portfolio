import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { postgresNeedsSsl, postgresUrl } from "@/lib/cms/env";

export const RATE_WINDOW_MS = 15 * 60 * 1000;
export const RATE_MAX = 8;

export type RateRow = { n: number; reset: number };

type AuthFile = {
  sessions: { id: string; expiresAt: number }[];
  limits: { key: string; n: number; reset: number }[];
};

const FILE = join(process.cwd(), "data", "cms-auth.json");
const memorySessions = new Map<string, number>();
const memoryLimits = new Map<string, RateRow>();

function emptyAuth(): AuthFile {
  return { sessions: [], limits: [] };
}

export function clientIpFrom(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || h.get("x-vercel-forwarded-for")?.trim() || "local";
}

export function rateLimitKey(ip: string, route: string): string {
  return `${route}:${ip}`;
}

export function nextAttempt(row: RateRow | undefined, now: number): { ok: boolean; row: RateRow } {
  if (!row || row.reset < now) return { ok: true, row: { n: 1, reset: now + RATE_WINDOW_MS } };
  if (row.n >= RATE_MAX) return { ok: false, row };
  return { ok: true, row: { n: row.n + 1, reset: row.reset } };
}

function durableStore(): boolean {
  return Boolean(postgresUrl()) || process.env.VERCEL !== "1";
}

async function withPostgres<T>(fn: (sql: import("postgres").Sql) => Promise<T>): Promise<T | null> {
  const url = postgresUrl();
  if (!url) return null;
  const postgres = (await import("postgres")).default;
  const sql = postgres(url, { max: 1, ssl: postgresNeedsSsl(url) ? "require" : false });
  try {
    await sql`
      create table if not exists cms_sessions (
        id text primary key,
        expires_at timestamptz not null
      )
    `;
    await sql`
      create table if not exists cms_rate_limits (
        key text primary key,
        n int not null,
        reset_at timestamptz not null
      )
    `;
    return await fn(sql);
  } finally {
    await sql.end({ timeout: 2 });
  }
}

async function readAuthFile(): Promise<AuthFile> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as AuthFile;
  } catch {
    return emptyAuth();
  }
}

async function writeAuthFile(store: AuthFile) {
  await mkdir(dirname(FILE), { recursive: true });
  const now = Date.now();
  store.sessions = store.sessions.filter((row) => row.expiresAt > now);
  store.limits = store.limits.filter((row) => row.reset > now);
  await writeFile(FILE, JSON.stringify(store, null, 2));
}

export async function putSession(id: string, expiresAt: number): Promise<boolean> {
  const fromDb = await withPostgres(async (sql) => {
    await sql`
      insert into cms_sessions (id, expires_at)
      values (${id}, ${new Date(expiresAt).toISOString()})
      on conflict (id) do update set expires_at = excluded.expires_at
    `;
    return true;
  }).catch(() => null);
  if (fromDb) return true;
  if (!durableStore()) {
    memorySessions.set(id, expiresAt);
    return true;
  }
  try {
    const store = await readAuthFile();
    store.sessions = store.sessions.filter((row) => row.id !== id);
    store.sessions.push({ id, expiresAt });
    await writeAuthFile(store);
    return true;
  } catch {
    memorySessions.set(id, expiresAt);
    return true;
  }
}

export async function sessionExists(id: string): Promise<boolean> {
  const now = Date.now();
  const fromDb = await withPostgres(async (sql) => {
    const rows = await sql<{ id: string }[]>`
      select id from cms_sessions
      where id = ${id} and expires_at > now()
      limit 1
    `;
    return rows.length > 0;
  }).catch(() => null);
  if (fromDb !== null) return fromDb;
  if (memorySessions.has(id)) {
    const exp = memorySessions.get(id)!;
    if (exp > now) return true;
    memorySessions.delete(id);
  }
  try {
    const store = await readAuthFile();
    return store.sessions.some((row) => row.id === id && row.expiresAt > now);
  } catch {
    return false;
  }
}

export async function revokeSession(id: string): Promise<void> {
  await withPostgres(async (sql) => {
    await sql`delete from cms_sessions where id = ${id}`;
    return true;
  }).catch(() => null);
  memorySessions.delete(id);
  try {
    const store = await readAuthFile();
    store.sessions = store.sessions.filter((row) => row.id !== id);
    await writeAuthFile(store);
  } catch {
    /* local file is best-effort */
  }
}

export async function consumeRateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  const fromDb = await withPostgres(async (sql) => {
    const rows = await sql<{ n: number; reset_at: Date }[]>`
      select n, reset_at from cms_rate_limits where key = ${key} limit 1
    `;
    const existing = rows[0]
      ? { n: rows[0].n, reset: new Date(rows[0].reset_at).getTime() }
      : undefined;
    const next = nextAttempt(existing, now);
    await sql`
      insert into cms_rate_limits (key, n, reset_at)
      values (${key}, ${next.row.n}, ${new Date(next.row.reset).toISOString()})
      on conflict (key) do update set n = excluded.n, reset_at = excluded.reset_at
    `;
    return next.ok;
  }).catch(() => null);
  if (fromDb !== null) return fromDb;

  const mem = nextAttempt(memoryLimits.get(key), now);
  memoryLimits.set(key, mem.row);
  if (!durableStore()) return mem.ok;
  try {
    const store = await readAuthFile();
    const existing = store.limits.find((row) => row.key === key);
    const next = nextAttempt(existing, now);
    store.limits = store.limits.filter((row) => row.key !== key);
    store.limits.push({ key, ...next.row });
    await writeAuthFile(store);
    return next.ok;
  } catch {
    return mem.ok;
  }
}

export function nonceRequired(): boolean {
  return Boolean(postgresUrl()) || process.env.VERCEL !== "1";
}
