import { describe, expect, it } from "vitest";
import { ledgerDocument } from "@/lib/cms/ledger";
import { claimHeroReady, validateDocument } from "@/lib/cms/validate";

describe("cms ledger", () => {
  it("seeds claims from the TypeScript registry", () => {
    const doc = ledgerDocument();
    expect(doc.status).toBe("published");
    expect(doc.profile.dek).toMatch(/building ML infrastructure/);
    expect(doc.claims.some((claim) => claim.id === "gateC" && claim.heroEligible)).toBe(true);
    expect(doc.publishedAt.startsWith("2026-09-01")).toBe(true);
  });

  it("refuses hero eligibility without method and environment", () => {
    const doc = ledgerDocument();
    const broken = {
      ...doc,
      claims: doc.claims.map((claim) =>
        claim.id === "gateC" ? { ...claim, method: "", environment: "", heroEligible: true } : claim,
      ),
    };
    expect(claimHeroReady(broken.claims.find((c) => c.id === "gateC")!).length).toBeGreaterThan(0);
    expect(validateDocument(broken).join(" ")).toMatch(/gateC/);
  });
});
