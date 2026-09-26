import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canonicalRedirect } from "@/lib/canonical-host";
import { contentSecurityPolicy, createNonce } from "@/lib/csp";
import { applySecurityHeaders } from "@/lib/security-headers";

/** Files that carry no nonce and may be cached normally. */
const ASSET = /^\/(?:_next\/|engine\/|work\/)|\/(?:opengraph-image|icon)[^/]*$|\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|wasm|bin|json|txt|xml)$/i;

/**
 * Brief §4.7 and §5: a per-request CSP nonce, the security headers, and permanent redirects from
 * www and the production vercel.app alias to the apex. The host is checked here because Next's
 * matcher parser needs string literals.
 */
export function proxy(request: NextRequest) {
  const dest = canonicalRedirect(request.nextUrl, request.headers.get("host") ?? "");
  if (dest) return applySecurityHeaders(NextResponse.redirect(dest, 308));

  const path = request.nextUrl.pathname;
  if (ASSET.test(path)) return applySecurityHeaders(NextResponse.next());

  const nonce = createNonce();
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  // A page carrying a nonce must never come back from a shared cache with a stale nonce (Appendix C item 1).
  if (!path.startsWith("/print-edition")) response.headers.set("Cache-Control", "private, no-cache");
  return applySecurityHeaders(response);
}

export const config = {
  matcher: "/:path*",
};
