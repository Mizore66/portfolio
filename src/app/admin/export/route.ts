import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/cms/session";
import { getCmsState } from "@/lib/cms/store";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  const jar = await cookies();
  const ok = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login", SITE_URL));
  }
  const state = await getCmsState();
  const payload = {
    exportedAt: new Date().toISOString(),
    backend: state.backend,
    published: state.published ?? state.ledger,
    draft: state.draft,
    revisions: state.revisions,
    audit: state.audit,
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="opening-preparation-cms.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
