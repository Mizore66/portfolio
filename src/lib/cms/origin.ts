import { headers } from "next/headers";

export function originMatchesHost(origin: string | null, host: string | null): boolean {
  if (!origin) return true;
  if (!host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Reject cross-origin POSTs. Missing Origin is allowed (same-origin server-action tests). */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!originMatchesHost(origin, host)) {
    throw new Error("Cross-origin mutation rejected.");
  }
}
