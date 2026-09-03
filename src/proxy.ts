import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { wwwToApex } from "@/lib/canonical-host";
import { SESSION_COOKIE, verifySessionMac } from "@/lib/cms/session-mac";
import { applySecurityHeaders } from "@/lib/security-headers";

const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=600";

function finish(response: NextResponse) {
  return applySecurityHeaders(response);
}

/** 301 www → apex so canonical, og:url, and the masthead dateline agree.
 *  Host is checked in the handler: Next's matcher parser requires string
 *  literals, and `has[].value` templates fail the compile. */
export async function proxy(request: NextRequest) {
  const dest = wwwToApex(request.nextUrl, request.headers.get("host") ?? "");
  if (dest) return finish(NextResponse.redirect(dest, 301));

  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") || path.startsWith("/api/cms-health")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    if (path === "/admin/login" || path.startsWith("/admin/login/") || path.startsWith("/api/cms-health")) {
      return finish(response);
    }
    const ok = await verifySessionMac(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      const login = new URL("/admin/login", request.url);
      const redirect = NextResponse.redirect(login);
      redirect.headers.set("Cache-Control", "private, no-store");
      return finish(redirect);
    }
    return finish(response);
  }

  const response = NextResponse.next();
  if (
    !path.startsWith("/_next/") &&
    !path.startsWith("/print-edition") &&
    !/\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$/i.test(path)
  ) {
    response.headers.set("Cache-Control", PUBLIC_CACHE);
  }
  return finish(response);
}

export const config = {
  matcher: "/:path*",
};
