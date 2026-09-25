import { describe, expect, it } from "vitest";
import { EDUCATION } from "./education";
import { getClaim } from "./index";
import { RETRIEVAL_SPLIT, ROLES } from "./roles";
import { SKILLS } from "./skills";

describe("roles", () => {
  it("keeps the legacy and new fragment ids", () => {
    expect(ROLES.map((r) => r.id)).toEqual([
      "deriv",
      "skribble-lab",
      "monash-university",
      "western-digital",
      "setel",
      "petronas",
    ]);
  });
  it("is sorted newest first with exactly one current role", () => {
    const starts = ROLES.map((r) => r.start);
    expect([...starts].sort().reverse()).toEqual(starts);
    expect(ROLES.filter((r) => r.end === null).map((r) => r.id)).toEqual(["deriv"]);
  });
  it("only references claims that exist", () => {
    for (const r of ROLES) for (const id of r.claimIds) expect(() => getClaim(id), `${r.id}:${id}`).not.toThrow();
  });
  it("condenses Western Digital, Setel and Petronas as earlier experience", () => {
    expect(ROLES.filter((r) => r.earlier).map((r) => r.id)).toEqual(["western-digital", "setel", "petronas"]);
  });
  it("prints the +45% / +35% split under Monash", () => {
    const monash = ROLES.find((r) => r.id === "monash-university");
    expect(monash?.note).toBe(RETRIEVAL_SPLIT);
    expect(RETRIEVAL_SPLIT).toMatch(/\+45%.*\+35%/);
  });
});

describe("education", () => {
  it("uses the confirmed grades and honours", () => {
    expect(EDUCATION.wam).toBe("81.8");
    expect(EDUCATION.cgpa).toBe("3.78");
    expect(EDUCATION.graduated).toBe("2026-04");
    expect(EDUCATION.honours).toEqual(["First Class Honours", "Best Graduate Award", "Dean's List"]);
  });
});

describe("skills", () => {
  it("lists Go first among languages", () => {
    expect(SKILLS[0]).toMatchObject({ label: "Languages" });
    expect(SKILLS[0].items[0]).toBe("Go");
  });
});
