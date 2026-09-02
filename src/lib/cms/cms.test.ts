import { describe, expect, it } from "vitest";
import { postgresNeedsSsl, postgresUrl, postgresUrlSource } from "@/lib/cms/env";
import { ledgerDocument } from "@/lib/cms/ledger";
import { documentDiff } from "@/lib/cms/diff";
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

  it("accepts the seeded ledger and refuses evaluation claims without environment", () => {
    const doc = ledgerDocument();
    expect(validateDocument(doc)).toEqual([]);
    const broken = {
      ...doc,
      claims: doc.claims.map((claim) =>
        claim.id === "veridianUptime" ? { ...claim, environment: "", caveat: "" } : claim,
      ),
    };
    expect(validateDocument(broken).join(" ")).toMatch(/veridianUptime/);
  });

  it("diffs draft profile copy against published", () => {
    const published = ledgerDocument();
    const draft = {
      ...published,
      profile: { ...published.profile, dek: "Draft dek" },
    };
    const rows = documentDiff(published, draft);
    expect(rows.some((row) => row.path === "profile.dek" && row.to === "Draft dek")).toBe(true);
  });
});

describe("cms postgres env", () => {
  it("prefers POSTGRES_URL from Marketplace Supabase and ignores SUPABASE_URL", () => {
    const env = {
      SUPABASE_URL: "https://abcd.supabase.co",
      POSTGRES_URL: "postgres://user:pass@db.abcd.supabase.co:6543/postgres",
    };
    expect(postgresUrlSource(env)).toBe("POSTGRES_URL");
    expect(postgresUrl(env)).toMatch(/^postgres:\/\//);
    expect(postgresNeedsSsl(postgresUrl(env)!)).toBe(true);
  });

  it("does not treat an HTTPS SUPABASE_URL as a database", () => {
    const env = { DATABASE_URL: "https://abcd.supabase.co", SUPABASE_URL: "https://abcd.supabase.co" };
    expect(postgresUrlSource(env)).toBeNull();
    expect(postgresUrl(env)).toBeUndefined();
  });
});
