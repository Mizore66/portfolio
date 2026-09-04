/** Per-request CSP. Next reads `Content-Security-Policy` on the request for `'nonce-…'`. */

export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin);
}

export function contentSecurityPolicy(
  nonce: string,
  isDev = process.env.NODE_ENV === "development",
): string {
  const script = [
    "'self'",
    `'nonce-${nonce}'`,
    "'wasm-unsafe-eval'",
    "https://va.vercel-scripts.com",
  ];
  if (isDev) script.push("'unsafe-eval'");
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${script.join(" ")}`,
    // React `style={{}}` becomes a style attribute. A style-src nonce would ignore
    // 'unsafe-inline' (CSP3) and break those attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com",
    "font-src 'self' data:",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
}

export function scriptSrcOf(csp: string): string {
  return csp.match(/script-src ([^;]+)/)?.[1] ?? "";
}
