import { describe, expect, it } from "vitest";
import { personSchema, serializeJsonLd, websiteSchema } from "./schema";

describe("JSON-LD", () => {
  it("describes the person with current role, phone and alumni", () => {
    const p = personSchema();
    expect(p).toMatchObject({
      "@type": "Person",
      name: "Anas Tarek Qumhiyeh",
      alternateName: "Anas Qumhiyeh",
      jobTitle: "AI Engineer",
      telephone: "+601112983246",
      email: "mailto:anasqumhiyeh@gmail.com",
      worksFor: { "@type": "Organization", name: "Deriv" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Monash University" },
    });
    expect(p.sameAs).toEqual(["https://github.com/Mizore66", "https://linkedin.com/in/anasqumhiyeh"]);
  });
  it("describes the website", () => {
    expect(websiteSchema()).toMatchObject({ "@type": "WebSite", name: "Anas Qumhiyeh" });
  });
  it("escapes < so content can never close the script tag", () => {
    const out = serializeJsonLd({ x: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ x: "</script><script>alert(1)</script>" });
  });
});
