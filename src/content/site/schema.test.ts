import { describe, expect, it } from "vitest";
import { projectBySlug } from "./index";
import { personSchema, projectSchema, serializeJsonLd, websiteSchema } from "./schema";

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
  it("describes a public project as source code with its repository", () => {
    expect(projectSchema(projectBySlug("faultline")!)).toMatchObject({
      "@type": "SoftwareSourceCode",
      name: "FaultLine",
      codeRepository: "https://github.com/Mizore66/faultline",
      url: "https://anasqumhiyeh.dev/projects/faultline",
      author: { "@type": "Person", name: "Anas Tarek Qumhiyeh" },
      dateCreated: "2026-07",
    });
  });
  it("describes a project without a public repo as a creative work", () => {
    const v = projectSchema(projectBySlug("veridian")!);
    expect(v["@type"]).toBe("CreativeWork");
    expect(v).not.toHaveProperty("codeRepository");
  });
});
