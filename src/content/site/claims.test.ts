import { describe, expect, it } from "vitest";
import { CLAIMS } from "./claims";
import { IDENTITY } from "./identity";
import { getClaim } from "./index";
import { EVIDENCE_LABEL } from "./types";

describe("claims ledger", () => {
  it("has unique ids", () => {
    const ids = CLAIMS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("gives every claim a known evidence type, owner and date", () => {
    for (const c of CLAIMS) {
      expect(EVIDENCE_LABEL[c.type], c.id).toBeTruthy();
      expect(c.owner.length, c.id).toBeGreaterThan(0);
      expect(c.date, c.id).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
    }
  });
  it("keeps +45% with Monash, +35% with GraphRAG, and −50% with Monash", () => {
    expect(getClaim("monashRetrieval").owner).toMatch(/Monash/);
    expect(getClaim("monashRetrieval").display).toMatch(/\+45%/);
    expect(getClaim("graphragRetrieval").owner).toBe("Multi-Agent GraphRAG");
    expect(getClaim("graphragRetrieval").display).toMatch(/\+35%/);
    expect(getClaim("slmLatency").owner).toMatch(/Monash/);
  });
  it("marks the staging Go service as a capability, not production", () => {
    expect(getClaim("derivGoService").type).toBe("capability");
    expect(getClaim("derivGoService").context).toMatch(/staging/);
  });
  it("throws on an unknown claim id", () => {
    expect(() => getClaim("nope")).toThrow(/Unknown claim/);
  });
});

describe("identity", () => {
  it("leads with the chosen statement and no metric in it", () => {
    expect(IDENTITY.heroHeadline).toBe("I like systems that have to survive measurement.");
    expect(IDENTITY.heroHeadline).not.toMatch(/\d/);
  });
  it("publishes the phone as a dialable tel value", () => {
    expect(IDENTITY.phone.tel).toBe("+601112983246");
    expect(IDENTITY.phone.display).toBe("+60 11-12983-246");
  });
  it("names both relocation countries explicitly", () => {
    expect(IDENTITY.status.join(" ")).toMatch(/Singapore or Australia/);
  });
});
