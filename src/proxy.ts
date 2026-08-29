import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { APEX_HOST, wwwToApex } from "@/lib/canonical-host";

/** 301 www → apex so canonical, og:url, and the masthead dateline agree. */
export function proxy(request: NextRequest) {
  const dest = wwwToApex(request.nextUrl, request.headers.get("host") ?? "");
  if (dest) return NextResponse.redirect(dest, 301);
  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/",
      has: [{ type: "host", value: `www.${APEX_HOST}` }],
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: `www.${APEX_HOST}` }],
    },
  ],
};
