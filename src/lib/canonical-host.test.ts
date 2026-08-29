import { describe, expect, it } from "vitest";
import { APEX_HOST, wwwToApex } from "./canonical-host";

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
});
