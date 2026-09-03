import { describe, expect, it } from "vitest";
import { BROADSHEET, OPENING_NODES } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import { INFORMANT, informantTitle } from "./informant";

describe("informant glyphs", () => {
  it("titles every symbol that appears on the scoresheet", () => {
    for (const node of OPENING_NODES) {
      if (!node.sym) continue;
      expect(informantTitle(node.sym), node.id).toBeTruthy();
    }
    expect(INFORMANT["!!"]).toMatch(/brilliant/i);
    expect(INFORMANT["∞"]).toMatch(/unclear/i);
  });
});

describe("biography register", () => {
  it("treats May 2026 as graduated, not upcoming", () => {
    expect(resumeData.education.graduation).toBe("May 2026");
    expect(BROADSHEET.dek).toMatch(/Software engineer building payment/);
    expect(resumeData.targetRoles).toMatch(/fintech, ML infrastructure/);
    expect(OPENING_NODES.find((n) => n.id === "e4")?.fact).toMatch(/Graduated May 2026/);
    expect(OPENING_NODES.find((n) => n.id === "e4")?.fact).toMatch(/First Class Honours/);
    expect(OPENING_NODES.find((n) => n.id === "start")?.fact).not.toMatch(/Graduating/i);
    expect(OPENING_NODES.find((n) => n.id === "start")?.fact).not.toMatch(/Seeking/i);
    expect(BROADSHEET.closer).toMatch(/next move writes/);
    expect(BROADSHEET.closer).not.toMatch(/next line I want to play/);
    expect(SITE_URL).toBe("https://anasqumhiyeh.dev");
    expect(SITE_HOST).toBe("anasqumhiyeh.dev");
    expect(BROADSHEET.availability).toMatch(/Open to software engineering roles/);
    expect(BROADSHEET.availability).not.toMatch(/MYT/);
    expect(BROADSHEET.graduateNote).toMatch(/Graduate and junior/);
    expect(BROADSHEET.engineDown).toMatch(/Refresh, or trust the annotator/);
    expect(BROADSHEET.colophon).toMatch(/LEARNED as the masthead eval/);
    expect(BROADSHEET.colophon).not.toMatch(/in training/i);
  });

  it("keeps British English in the public facts", () => {
    const blob = OPENING_NODES.map((n) => `${n.fact} ${n.commentary} ${n.impression?.caption ?? ""}`).join("\n");
    expect(blob).not.toMatch(/licenses/);
    expect(blob).toMatch(/licences/);
    expect(resumeData.education.degree).toMatch(/Specialisation/);
    expect(resumeData.education.degree).toMatch(/Honours/);
  });
});
