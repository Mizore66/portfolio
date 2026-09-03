import { headers } from "next/headers";

/** Reject cross-origin POSTs. Missing Origin is allowed (same-origin server-action tests). */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error("Cross-origin mutation rejected.");
  }
  if (url.host !== host) {
    throw new Error("Cross-origin mutation rejected.");
  }
}
