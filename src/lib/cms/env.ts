const POSTGRES_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

export type PostgresUrlKey = (typeof POSTGRES_KEYS)[number];

function isPostgresUrl(value: string | undefined): value is string {
  return Boolean(value && /^(postgres|postgresql):\/\//i.test(value));
}

/** Marketplace Supabase sets POSTGRES_URL. SUPABASE_URL is the HTTPS API and is not a database. */
export function postgresUrlSource(
  env: NodeJS.ProcessEnv = process.env,
): PostgresUrlKey | null {
  for (const key of POSTGRES_KEYS) {
    if (isPostgresUrl(env[key])) return key;
  }
  return null;
}

export function postgresUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const key = postgresUrlSource(env);
  return key ? env[key] : undefined;
}

export function postgresNeedsSsl(url: string): boolean {
  return /sslmode=|neon|supabase/i.test(url);
}
