import { describe, expect, it } from "vitest";
import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "@/lib/security-headers";

describe("security headers", () => {
  it("ships CSP, nosniff, referrer, frame, and permissions policy", () => {
    const keys = SECURITY_HEADERS.map((row) => row.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "X-Frame-Options",
        "Permissions-Policy",
      ]),
    );
    expect(CONTENT_SECURITY_POLICY).toMatch(/frame-ancestors 'none'/);
    expect(SECURITY_HEADERS.find((row) => row.key === "X-Content-Type-Options")?.value).toBe("nosniff");
    expect(SECURITY_HEADERS.find((row) => row.key === "X-Frame-Options")?.value).toBe("DENY");
    expect(SECURITY_HEADERS.find((row) => row.key === "Referrer-Policy")?.value).toBe(
      "strict-origin-when-cross-origin",
    );
  });
});
