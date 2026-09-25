import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { APEX_HOST, canonicalRedirect, VERCEL_ALIAS_HOST, wwwToApex } from "./canonical-host";

describe("wwwToApex", () => {
  it("rewrites www to the masthead host over https", () => {
    const dest = wwwToApex(
      new URL("http://www.anasqumhiyeh.dev/projects/veridian?move=d4"),
      "www.anasqumhiyeh.dev",
    );
    expect(dest?.href).toBe("https://anasqumhiyeh.dev/projects/veridian?move=d4");
    expect(dest?.hostname).toBe(APEX_HOST);
  });

  it("leaves apex, localhost, and preview hosts alone", () => {
    expect(wwwToApex(new URL("https://anasqumhiyeh.dev/"), "anasqumhiyeh.dev")).toBeNull();
    expect(wwwToApex(new URL("http://localhost:3000/"), "localhost:3000")).toBeNull();
    expect(wwwToApex(new URL("https://portfolio.vercel.app/"), "portfolio.vercel.app")).toBeNull();
  });

  it("keeps the proxy matcher a string Next can parse at compile time", () => {
    const src = readFileSync(join(process.cwd(), "src/proxy.ts"), "utf8");
    expect(src).toMatch(/matcher:\s*"\/:path\*"/);
    expect(src).not.toMatch(/value:\s*`/);
  });
});

describe("canonicalRedirect", () => {
  it("sends www and the production vercel.app alias to the apex, path and query kept", () => {
    for (const host of [`www.${APEX_HOST}`, VERCEL_ALIAS_HOST]) {
      const dest = canonicalRedirect(new URL(`https://${host}/projects/veridian?path=ml`), host);
      expect(dest?.href, host).toBe("https://anasqumhiyeh.dev/projects/veridian?path=ml");
    }
  });

  it("leaves the apex, localhost and every preview deployment alone", () => {
    expect(canonicalRedirect(new URL("https://anasqumhiyeh.dev/"), "anasqumhiyeh.dev")).toBeNull();
    expect(canonicalRedirect(new URL("http://localhost:3000/"), "localhost:3000")).toBeNull();
    const preview = "portfolio-lgxkhumdk-mizore66s-projects.vercel.app";
    expect(canonicalRedirect(new URL(`https://${preview}/`), preview)).toBeNull();
  });
});
