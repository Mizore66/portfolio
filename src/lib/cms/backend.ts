import { postgresUrl, type EnvBag } from "@/lib/cms/env";

export type CmsBackendKind = "postgres" | "blob" | "file";

export function blobToken(env: EnvBag = process.env): string | undefined {
  const token = env.BLOB_READ_WRITE_TOKEN;
  return token && token.trim() ? token : undefined;
}

export function isVercelRuntime(env: EnvBag = process.env): boolean {
  return env.VERCEL === "1";
}

export function cmsBackendKind(env: EnvBag = process.env): CmsBackendKind {
  if (postgresUrl(env)) return "postgres";
  if (blobToken(env)) return "blob";
  return "file";
}

export function cmsStoreStatus(env: EnvBag = process.env): {
  backend: CmsBackendKind;
  durable: boolean;
  writable: boolean;
  production: boolean;
} {
  const backend = cmsBackendKind(env);
  const durable = backend === "postgres" || backend === "blob";
  const vercel = isVercelRuntime(env);
  return {
    backend,
    durable,
    writable: durable || !vercel,
    production: env.VERCEL_ENV === "production",
  };
}
