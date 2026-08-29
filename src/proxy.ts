import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { wwwToApex } from "@/lib/canonical-host";

/** 301 www → apex so canonical, og:url, and the masthead dateline agree.
 *  Host is checked in the handler: Next's matcher parser requires string
 *  literals, and `has[].value` templates fail the compile. */
export function proxy(request: NextRequest) {
  const dest = wwwToApex(request.nextUrl, request.headers.get("host") ?? "");
  if (dest) return NextResponse.redirect(dest, 301);
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
