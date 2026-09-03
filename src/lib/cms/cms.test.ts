import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { originMatchesHost } from "@/lib/cms/origin";
import { postgresNeedsSsl, postgresUrl, postgresUrlSource } from "@/lib/cms/env";
import { clientIpFrom, nextAttempt, rateLimitKey } from "@/lib/cms/auth-store";
import { applyFormToDocument } from "@/lib/cms/form";
import { hydrateDocument } from "@/lib/cms/hydrate";
import { parseImportedDocument } from "@/lib/cms/import-document";
import { ledgerDocument } from "@/lib/cms/ledger";
import { overlayProject, overlayProjects, resolveExhibit } from "@/lib/cms/overlay";
import { documentDiff, groupedDocumentDiff, wordDiff } from "@/lib/cms/diff";
import { claimHeroReady, validateDocument } from "@/lib/cms/validate";
import { draftHealth, draftStatus, revisionInstant } from "@/lib/cms/health";
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

  it("refuses to drop a required claim and accepts a CMS-created project slug", () => {
    const doc = ledgerDocument();
    const missing = { ...doc, claims: doc.claims.filter((claim) => claim.id !== "setelDefects") };
    expect(validateDocument(missing).join(" ")).toMatch(/setelDefects/);
    const created = {
      ...doc,
      projects: [...doc.projects, { ...doc.projects[0]!, slug: "new-desk", title: "New desk", archived: true }],
    };
    expect(validateDocument(created)).toEqual([]);
    const invalid = {
      ...doc,
      projects: [{ ...doc.projects[0]!, slug: "Not A Project" }],
    };
    expect(validateDocument(invalid).join(" ")).toMatch(/Invalid project slug/);
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
  it("counts missing hero method on the draft health packet", () => {
    const published = ledgerDocument();
    expect(draftHealth(published).heroMissing).toHaveLength(0);
    const draft = {
      ...published,
      claims: published.claims.map((claim) =>
        claim.id === "gateC" ? { ...claim, method: "", heroEligible: true } : claim,
      ),
    };
    expect(claimHeroReady(draft.claims.find((c) => c.id === "gateC")!)).toContain("method");
    expect(draftHealth(draft).heroMissing.map((c) => c.id)).toContain("gateC");
    expect(draftHealth(draft).blocking).toBe(true);
    expect(validateDocument(draft).join(" ")).toMatch(/method/);
  });

  it("labels draft state from the diff, not an In hand stamp", () => {
    const published = ledgerDocument();
    expect(draftStatus(published, null).label).toBe("No draft");
    expect(draftStatus(published, published).label).toBe("Draft matches live");
    const draft = { ...published, profile: { ...published.profile, dek: "Changed dek" } };
    expect(draftStatus(published, draft).label).toMatch(/unpublished change/);
  });

  it("reads draft timestamps from the revision id, not the copied publishedAt", () => {
    const now = Date.now();
    expect(revisionInstant({ revisionId: `draft-${now}`, publishedAt: "2020-01-01T00:00:00.000Z" })).toBe(
      new Date(now).toISOString(),
    );
  });

  it("composes a measurement date from year/month/day parts", () => {
    const published = ledgerDocument();
    const form = new FormData();
    form.set("claims-present", "1");
    form.set("claim-gateC-year", "2026");
    form.set("claim-gateC-month", "09");
    form.set("claim-gateC-day", "03");
    const next = applyFormToDocument(form, published);
    expect(next.claims.find((c) => c.id === "gateC")?.date).toBe("2026-09-03");
  });

  it("gives every hero claim a caveat or baseline", () => {
    const doc = ledgerDocument();
    const setel = doc.claims.find((c) => c.id === "setelDefects")!;
    expect(setel.caveat).toMatch(/not claimed as coverage/i);
    const slm = doc.claims.find((c) => c.id === "slmInference")!;
    expect(slm.caveat).toMatch(/Not claimed as a measured throughput/);
    for (const claim of doc.claims.filter((row) => row.heroEligible)) {
      expect(claimHeroReady(claim), claim.id).toEqual([]);
    }
  });

  it("keeps a restored snapshot's note off the published-vs-draft diff", () => {
    const published = ledgerDocument();
    const snapshot = {
      ...published,
      note: "Snapshot note that must not rewrite Profile.note",
      profile: { ...published.profile, dek: "Older dek" },
    };
    const restored = { ...snapshot, note: published.note, restoredFrom: "pub-1" };
    const rows = documentDiff(published, restored);
    expect(rows.some((row) => row.path === "note")).toBe(false);
    expect(rows.some((row) => row.path === "profile.dek" && row.to === "Older dek")).toBe(true);
  });

  it("creates, duplicates, and deletes CMS aspirations and exhibits", () => {
    const published = ledgerDocument();
    const aspForm = new FormData();
    aspForm.set("aspirations-present", "1");
    aspForm.set("asp-new-id", "next-desk");
    aspForm.set("asp-create", "1");
    const withAsp = applyFormToDocument(aspForm, published);
    expect(withAsp.aspirations.some((item) => item.id === "next-desk")).toBe(true);

    const dupAsp = new FormData();
    dupAsp.set("aspirations-present", "1");
    dupAsp.set("asp-duplicate", "next-desk");
    const copiedAsp = applyFormToDocument(dupAsp, withAsp);
    expect(copiedAsp.aspirations.some((item) => item.id === "next-desk-copy")).toBe(true);

    const delLedgerAsp = new FormData();
    delLedgerAsp.set("aspirations-present", "1");
    delLedgerAsp.set("asp-delete", "swe-fintech-ml");
    const withoutLedgerAsp = applyFormToDocument(delLedgerAsp, published);
    expect(withoutLedgerAsp.aspirations.some((item) => item.id === "swe-fintech-ml")).toBe(false);
    expect(hydrateDocument(withoutLedgerAsp).aspirations.some((item) => item.id === "swe-fintech-ml")).toBe(false);

    const projectForm = new FormData();
    projectForm.set("projects-present", "1");
    projectForm.set("project-new-slug", "new-desk");
    projectForm.set("project-create", "1");
    const withProject = applyFormToDocument(projectForm, published);
    const created = withProject.projects.find((project) => project.slug === "new-desk");
    expect(created?.archived).toBe(true);
    expect(validateDocument(withProject)).toEqual([]);

    const dupProject = new FormData();
    dupProject.set("projects-present", "1");
    dupProject.set("project-duplicate", "veridian");
    const copiedProject = applyFormToDocument(dupProject, withProject);
    expect(copiedProject.projects.some((project) => project.slug === "veridian-copy")).toBe(true);

    const delLedger = new FormData();
    delLedger.set("projects-present", "1");
    delLedger.set("project-delete", "veridian");
    expect(applyFormToDocument(delLedger, copiedProject).projects.some((project) => project.slug === "veridian")).toBe(
      true,
    );

    const delCreated = new FormData();
    delCreated.set("projects-present", "1");
    delCreated.set("project-delete", "new-desk");
    expect(applyFormToDocument(delCreated, copiedProject).projects.some((project) => project.slug === "new-desk")).toBe(
      false,
    );
  });

  it("overlays apparatus layers and renders a CMS-only exhibit", () => {
    const published = ledgerDocument();
    const draft = {
      ...published,
      projects: [
        ...published.projects.map((project) =>
          project.slug === "veridian"
            ? { ...project, apparatusRuntime: "Cloud Run preview", apparatusPath: "MCP — intercepts Terraform" }
            : project,
        ),
        {
          ...published.projects[0]!,
          slug: "new-desk",
          title: "New desk",
          purpose: "A CMS-only filing.",
          archived: false,
          apparatusName: "New desk",
          apparatusPath: "Editor — writes copy",
        },
      ],
    };
    const veridian = overlayProject(resumeData.projects[0]!, draft);
    expect(veridian && "apparatus" in veridian ? veridian.apparatus.runtime : "").toBe("Cloud Run preview");
    const extras = overlayProjects(resumeData.projects, draft);
    expect(extras.some((project) => project.slug === "new-desk")).toBe(true);
    expect(resolveExhibit("new-desk", draft)?.name).toBe("New desk");
    expect(validateDocument(draft)).toEqual([]);
  });

  it("marks word-level insertions and deletions", () => {
    const marks = wordDiff("hello world", "hello there");
    expect(marks.some((mark) => mark.type === "del" && mark.text === "world")).toBe(true);
    expect(marks.some((mark) => mark.type === "ins" && mark.text === "there")).toBe(true);
  });
});

describe("cms totp", () => {
  it("accepts the current window when a secret is configured", async () => {
    const { totpCode, verifyTotp } = await import("@/lib/cms/totp");
    const secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
    const previous = process.env.ADMIN_TOTP_SECRET;
    process.env.ADMIN_TOTP_SECRET = secret;
    const at = Date.parse("2026-09-03T10:00:00.000Z");
    expect(verifyTotp(totpCode(secret, at), at)).toBe(true);
    expect(verifyTotp("000000", at)).toBe(false);
    expect(verifyTotp("not-a-code", at)).toBe(false);
    if (previous === undefined) delete process.env.ADMIN_TOTP_SECRET;
    else process.env.ADMIN_TOTP_SECRET = previous;
  });
});
