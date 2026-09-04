import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, scriptSrcOf } from "@/lib/csp";
import { SECURITY_HEADERS } from "@/lib/security-headers";

describe("security headers", () => {
  it("ships nosniff, referrer, frame, and permissions policy; CSP is per-request", () => {
    const keys = SECURITY_HEADERS.map((row) => row.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "X-Content-Type-Options",
        "Referrer-Policy",
        "X-Frame-Options",
        "Permissions-Policy",
        "Strict-Transport-Security",
      ]),
    );
    expect(keys).not.toContain("Content-Security-Policy");
    expect(SECURITY_HEADERS.find((row) => row.key === "X-Content-Type-Options")?.value).toBe("nosniff");
    expect(SECURITY_HEADERS.find((row) => row.key === "X-Frame-Options")?.value).toBe("DENY");
    expect(SECURITY_HEADERS.find((row) => row.key === "Referrer-Policy")?.value).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(SECURITY_HEADERS.find((row) => row.key === "Strict-Transport-Security")?.value).toMatch(/max-age=/);
  });

  it("drops production unsafe-eval and script unsafe-inline in favour of nonce plus wasm-unsafe-eval", () => {
    const prod = contentSecurityPolicy("abc123", false);
    const script = scriptSrcOf(prod);
    expect(script).toContain("'nonce-abc123'");
    expect(script).toContain("'wasm-unsafe-eval'");
    expect(script.includes("'unsafe-eval'")).toBe(false);
    expect(script.includes("'unsafe-inline'")).toBe(false);
    expect(prod).toMatch(/style-src 'self' 'unsafe-inline'/);
    expect(prod).toMatch(/frame-ancestors 'none'/);

    const dev = contentSecurityPolicy("devnonce", true);
    expect(scriptSrcOf(dev).includes("'unsafe-eval'")).toBe(true);
    expect(scriptSrcOf(dev)).toContain("'wasm-unsafe-eval'");
  });
});
