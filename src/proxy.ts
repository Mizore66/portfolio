import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { wwwToApex } from "@/lib/canonical-host";
import { SESSION_COOKIE, verifySessionMac } from "@/lib/cms/session-mac";
import { contentSecurityPolicy, createNonce } from "@/lib/csp";
import { applySecurityHeaders } from "@/lib/security-headers";

const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=600";

/** 301 www → apex so canonical, og:url, and the masthead dateline agree.
 *  Host is checked in the handler: Next's matcher parser requires string
 *  literals, and `has[].value` templates fail the compile. */
export async function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = contentSecurityPolicy(nonce);

  function finish(response: NextResponse) {
    applySecurityHeaders(response);
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  function forward() {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    return finish(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  const dest = wwwToApex(request.nextUrl, request.headers.get("host") ?? "");
  if (dest) return finish(NextResponse.redirect(dest, 301));

  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") || path.startsWith("/api/cms-health")) {
    const response = (() => {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-nonce", nonce);
      requestHeaders.set("Content-Security-Policy", csp);
      const next = NextResponse.next({ request: { headers: requestHeaders } });
      next.headers.set("Cache-Control", "private, no-store");
      next.headers.set("X-Robots-Tag", "noindex, nofollow");
      return next;
    })();
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

  const response = forward();
  if (
    !path.startsWith("/_next/") &&
    !path.startsWith("/print-edition") &&
    !/\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$/i.test(path)
  ) {
    response.headers.set("Cache-Control", PUBLIC_CACHE);
  }
  return response;
}

export const config = {
  matcher: "/:path*",
};
