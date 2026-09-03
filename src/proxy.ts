import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { wwwToApex } from "@/lib/canonical-host";
import { SESSION_COOKIE, verifySessionMac } from "@/lib/cms/session-mac";

/** 301 www → apex so canonical, og:url, and the masthead dateline agree.
 *  Host is checked in the handler: Next's matcher parser requires string
 *  literals, and `has[].value` templates fail the compile. */
export async function proxy(request: NextRequest) {
  const dest = wwwToApex(request.nextUrl, request.headers.get("host") ?? "");
  if (dest) return NextResponse.redirect(dest, 301);

  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    if (path === "/admin/login" || path.startsWith("/admin/login/")) {
      return response;
    }
    const ok = await verifySessionMac(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      const login = new URL("/admin/login", request.url);
      const redirect = NextResponse.redirect(login);
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
