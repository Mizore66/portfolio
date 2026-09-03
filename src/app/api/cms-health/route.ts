import { cmsStoreStatus } from "@/lib/cms/backend";

export const dynamic = "force-dynamic";

/** Promotion probe: 503 when a Vercel deploy has fallen back to a non-writable file store. */
export async function GET() {
  const status = cmsStoreStatus();
  const ok = status.writable;
  return Response.json(
    {
      ok,
      backend: status.backend,
      durable: status.durable,
      writable: status.writable,
      production: status.production,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
