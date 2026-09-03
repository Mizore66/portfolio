import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { originMatchesHost } from "@/lib/cms/origin";
import { postgresNeedsSsl, postgresUrl, postgresUrlSource } from "@/lib/cms/env";
import { clientIpFrom, nextAttempt, rateLimitKey } from "@/lib/cms/auth-store";
import { applyFormToDocument } from "@/lib/cms/form";
import { parseImportedDocument } from "@/lib/cms/import-document";
import { ledgerDocument } from "@/lib/cms/ledger";
import { overlayProject } from "@/lib/cms/overlay";
import { documentDiff, groupedDocumentDiff } from "@/lib/cms/diff";
import { claimHeroReady, validateDocument } from "@/lib/cms/validate";
import { parseSessionToken } from "@/lib/cms/session-mac";
import { resumeData } from "@/lib/data";

describe("cms ledger", () => {
  it("seeds claims from the TypeScript registry", () => {
    const doc = ledgerDocument();
    expect(doc.status).toBe("published");
    expect(doc.profile.dek).toMatch(/ML infrastructure and data-intensive systems/);
    expect(doc.claims.some((claim) => claim.id === "gateC" && claim.heroEligible)).toBe(true);
    expect(doc.publishedAt.startsWith("2026-09-03")).toBe(true);
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

  it("refuses to drop a required claim or invent a project slug", () => {
    const doc = ledgerDocument();
    const missing = { ...doc, claims: doc.claims.filter((claim) => claim.id !== "setelDefects") };
    expect(validateDocument(missing).join(" ")).toMatch(/setelDefects/);
    const ghost = {
      ...doc,
      projects: [{ slug: "not-a-project", purpose: "", impact: "", why: "", judgment: "", constraint: "", limitation: "", example: "", rejected: "", retrospective: "", archived: false }],
    };
    expect(validateDocument(ghost).join(" ")).toMatch(/Unknown project slug/);
    const dated = {
      ...doc,
      claims: doc.claims.map((claim) => (claim.id === "gateC" ? { ...claim, date: "3 Sept" } : claim)),
    };
    expect(validateDocument(dated).join(" ")).toMatch(/YYYY/);
    const archivedRequired = {
      ...doc,
      claims: doc.claims.map((claim) => (claim.id === "setelDefects" ? { ...claim, archived: true } : claim)),
    };
    expect(validateDocument(archivedRequired).join(" ")).toMatch(/cannot be archived/);
  });

  it("seeds project copy from the résumé ledger", () => {
    const doc = ledgerDocument();
    expect(doc.projects.some((p) => p.slug === "veridian" && p.purpose.length > 20)).toBe(true);
    expect(doc.claims.every((c) => c.archived === false)).toBe(true);
  });

  it("does not clear hero eligibility when a profile form is posted", () => {
    const published = ledgerDocument();
    const form = new FormData();
    form.set("profile-present", "1");
    form.set("dek", "Draft dek");
    form.set("tagline", published.profile.tagline);
    form.set("desksLine", published.profile.desksLine);
    form.set("howIWork", published.profile.howIWork);
    form.set("availability", published.profile.availability);
    form.set("recruiterBio", published.profile.recruiterBio);
    form.set("followerBio", published.profile.followerBio);
    form.set("location", published.profile.location);
    const next = applyFormToDocument(form, published);
    expect(next.profile.dek).toBe("Draft dek");
    expect(next.claims.find((c) => c.id === "setelDefects")?.heroEligible).toBe(true);
  });

  it("groups diffs by claim and overlays archived projects", () => {
    const published = ledgerDocument();
    const draft = {
      ...published,
      claims: published.claims.map((c) => (c.id === "gateC" ? { ...c, caveat: "Draft caveat" } : c)),
      projects: published.projects.map((p) => (p.slug === "veridian" ? { ...p, purpose: "Draft purpose" } : p)),
    };
    const groups = groupedDocumentDiff(published, draft);
    expect(groups.some((g) => g.heading === "Claim · gateC")).toBe(true);
    expect(groups.some((g) => g.heading === "Project · veridian")).toBe(true);
    expect(overlayProject(resumeData.projects[0]!, published)?.slug).toBe(resumeData.projects[0]!.slug);
    const hidden = overlayProject(
      resumeData.projects[0]!,
      {
        ...published,
        projects: published.projects.map((p) =>
          p.slug === resumeData.projects[0]!.slug ? { ...p, archived: true } : p,
        ),
      },
    );
    expect(hidden).toBeNull();
  });

  it("imports an export wrapper into a hydrated draft", () => {
    const published = ledgerDocument();
    const raw = JSON.stringify({
      exportedAt: "2026-09-03T00:00:00.000Z",
      published: { ...published, profile: { ...published.profile, dek: "Imported dek" } },
    });
    const parsed = parseImportedDocument(raw);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.doc.profile.dek).toBe("Imported dek");
      expect(parsed.doc.projects.some((p) => p.slug === "veridian")).toBe(true);
    }
    expect(parseImportedDocument("{not json").ok).toBe(false);
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

describe("cms backend selection", () => {
  it("prefers postgres, then blob, and treats Vercel file fallback as read-only", async () => {
    const { cmsBackendKind, cmsStoreStatus } = await import("@/lib/cms/backend");
    expect(cmsBackendKind({ POSTGRES_URL: "postgres://x" })).toBe("postgres");
    expect(cmsBackendKind({ BLOB_READ_WRITE_TOKEN: "blob_x" })).toBe("blob");
    expect(cmsBackendKind({})).toBe("file");
    expect(cmsStoreStatus({ VERCEL: "1" }).writable).toBe(false);
    expect(cmsStoreStatus({ VERCEL: "1", BLOB_READ_WRITE_TOKEN: "blob_x" }).writable).toBe(true);
    expect(cmsStoreStatus({}).writable).toBe(true);
  });
});

describe("cms health probe", () => {
  it("fails promotion when Vercel has fallen back to a non-writable file store", async () => {
    const src = readFileSync(join(process.cwd(), "src/app/api/cms-health/route.ts"), "utf8");
    expect(src).toMatch(/status: ok \? 200 : 503/);
    expect(src).toMatch(/cmsStoreStatus/);
  });
});

describe("cms origin", () => {
  it("rejects a cross-origin mutation host", () => {
    expect(originMatchesHost(null, "anasqumhiyeh.dev")).toBe(true);
    expect(originMatchesHost("https://anasqumhiyeh.dev", "anasqumhiyeh.dev")).toBe(true);
    expect(originMatchesHost("https://evil.example", "anasqumhiyeh.dev")).toBe(false);
    expect(originMatchesHost("not-a-url", "anasqumhiyeh.dev")).toBe(false);
  });
});

describe("cms login rate limit", () => {
  it("keys attempts by IP and route so one network cannot lock the owner out", () => {
    expect(rateLimitKey("1.1.1.1", "login")).not.toBe(rateLimitKey("8.8.8.8", "login"));
    expect(rateLimitKey("1.1.1.1", "login")).toBe("login:1.1.1.1");
    const headers = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(clientIpFrom(headers)).toBe("203.0.113.9");
    let row = nextAttempt(undefined, 0);
    for (let i = 0; i < 7; i++) row = nextAttempt(row.row, 0);
    expect(row.ok).toBe(true);
    expect(nextAttempt(row.row, 0).ok).toBe(false);
  });
});

describe("cms session token", () => {
  it("rejects the old expiry-only MAC shape", () => {
    expect(parseSessionToken("12345.abc")).toBeNull();
    expect(parseSessionToken("12345.nonce.mac")).toEqual({
      expiresAt: 12345,
      nonce: "nonce",
      mac: "mac",
    });
  });
});

describe("cms ledger caveats", () => {
  it("gives every hero claim a caveat or baseline", () => {
    const doc = ledgerDocument();
    const setel = doc.claims.find((c) => c.id === "setelDefects")!;
    expect(setel.caveat).toMatch(/not claimed as coverage/i);
    const slm = doc.claims.find((c) => c.id === "slmInference")!;
    expect(slm.caveat).toMatch(/Not claimed as a measured throughput/);
  });
});
