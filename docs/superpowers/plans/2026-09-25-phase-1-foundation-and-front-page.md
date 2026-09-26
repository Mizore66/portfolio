# Phase 1: Foundation and Front Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the new Analysis-board front page at `/`, built on a typed content layer. Every other legacy route keeps working untouched.

**Architecture:**
- The app is split into two route groups with separate root layouts:
  - `src/app/(legacy)/` holds all current pages.
  - `src/app/(site)/` holds the new design.
- A new content layer in `src/content/site/` is the single source for identity, roles, education, skills, projects, claims and the chess line. Invariant tests protect it.
- The front page is a server-rendered two-pane layout: reading pane plus board pane. The board is static SVG in this phase; the live engine arrives in Phase 3.

**Tech stack:** Next.js 16.2.4 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, Vitest 4 (node environment, `react-dom/server` for component markup tests), Playwright + axe-core.

**Spec:** `REBUILD_BRIEF.md` (repo root). The roadmap is in `docs/superpowers/plans/2026-09-25-rebuild-roadmap.md`.

## Global Constraints

- Next 16 conventions: read `node_modules/next/dist/docs/` before using an API you haven't verified. Middleware is `src/proxy.ts`. `searchParams` and `params` are Promises.
- Direction B, Analysis board (D22):
  - Palette: slate ink `#14181D`, board light `#E4E8EC`, board dark `#7D8A99`, annotation violet `#6D3FD6`, white `#FFFFFF`.
  - Typefaces: Schibsted Grotesk for facts and UI, Literata Italic for commentary **only**, Commit Mono for notation and figures.
- **Roman is fact, italic is voice.** Commentary (`annotation` fields) always renders in Literata Italic, violet. Nothing else is italic.
- **Hero (D20, D21):**
  - The first element on the page is the statement "I like systems that have to survive measurement."
  - The hero contains **no metric**.
  - Numbers appear only beside the work they belong to.
- **Featured projects (D17):** exactly FaultLine, Gemini Teleportal, CircuitMindAI, in that order.
- **Fixed URLs and fragments** (brief §2.5): `#work`, `#proof`, `#experience`, `#education`, `#lab`, `#about`, `#contact`, `#monash-university`, `#western-digital`, `#setel`, `#petronas`, `#veridian`, `#circuitmindai`, `#multi-agent-graphrag`, `#the-game`, `#claim-setelDefects`, `#claim-monashRetrieval`, `#claim-leadThroughput`. New in this phase: `#deriv`, `#skribble-lab`.
- **Query behaviour:**
  - `/?path=ml` and `/?path=product` keep filtering the work list.
  - `/?move=<valid id>` and `/?tape=1` redirect to `/opening-preparation` with the same query.
- **No engine assets on the front page:** no requests to `/engine/*` and no Worker.
- **en-GB spelling in all content** (behaviour, catalogue, authorisation). Evidence types must never be conveyed by colour alone.
- **Contact:** show the phone number `+60 11-12983-246` as `tel:+601112983246` (D15). Show the email `anasqumhiyeh@gmail.com`.
- **JSON-LD output escapes `<`.**
- **Accessibility:** axe reports zero violations. No horizontal overflow at 320 px. Touch targets are at least 44 px on mobile. Focus is always visible. `prefers-reduced-motion` is respected.
- **Commit identity for this repo** is `Anas Tarek Qumhiyeh <anasqumhiyeh@gmail.com>`, already set locally. End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Never push to `master`.** Push only to `rebuild/analysis-board`.

---

## File structure

```
src/app/
  (legacy)/                  ← moved here unchanged in Task 1
    layout.tsx  globals.css  not-found.tsx
    about/ archive/ admin/ colophon/ lab/ opening-preparation/ projects/
    page.tsx                 ← deleted in Task 7 (replaced by (site)/page.tsx)
  (site)/
    layout.tsx               ← Task 6: new root layout, fonts, header/footer, JSON-LD
    site.css                 ← Task 6: tokens + component styles
    page.tsx                 ← Task 7: front page
  global-not-found.tsx       ← Task 1: needed once two root layouts exist
  api/ print-edition/ sitemap.ts robots.ts icon.tsx opengraph-image.tsx favicon.ico  ← stay in place
src/content/site/
  types.ts        ← Task 2: all content types + EVIDENCE_LABEL
  format.ts       ← Task 2: date/period formatting
  claims.ts       ← Task 2
  identity.ts     ← Task 2
  index.ts        ← Task 2 (getClaim) + Task 4 (project helpers)
  roles.ts        ← Task 3
  education.ts    ← Task 3
  skills.ts       ← Task 3
  projects.ts     ← Task 4
  lab.ts          ← Task 4
  line.ts         ← Task 5: the D19 chess line
  schema.ts       ← Task 6: JSON-LD builders + serialiser
  *.test.ts(x)    ← invariant tests per task
src/components/site/
  StaticBoard.tsx BoardPane.tsx                       ← Task 5 / Task 7
  SiteHeader.tsx SiteFooter.tsx SiteJsonLd.tsx        ← Task 6
  Hero.tsx ClaimLine.tsx ProjectCard.tsx Work.tsx RoleEntry.tsx Experience.tsx
  Skills.tsx Education.tsx LabTeaser.tsx About.tsx Contact.tsx CopyEmailButton.tsx  ← Task 7
src/fonts/commit-mono/        ← Task 6: self-hosted woff2 + OFL licence
e2e/site/home.spec.ts         ← Task 8
```

---

### Task 1: Split the app into `(legacy)` and `(site)` route groups

**Files:**
- Move (with `git mv`): `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/not-found.tsx`, and `src/app/{about,archive,admin,colophon,lab,opening-preparation,projects}/` → `src/app/(legacy)/`
- Create: `src/app/global-not-found.tsx`
- Modify: `next.config.ts` (add `experimental.globalNotFound`)
- Modify: `src/lib/integrity.test.ts:31,38,79`, `src/lib/opening/copy.test.ts:178` (file paths)

**Interfaces:**
- Consumes: none.
- Produces: `src/app/(legacy)/` exists. Every URL behaves exactly as before, and unknown URLs render `global-not-found.tsx` with HTTP 404.

- [ ] **Step 1: Move the legacy routes**

```bash
mkdir -p "src/app/(legacy)"
for p in layout.tsx globals.css page.tsx not-found.tsx about archive admin colophon lab opening-preparation projects; do
  git mv "src/app/$p" "src/app/(legacy)/$p"
done
ls src/app "src/app/(legacy)"
```

Expected: `src/app` now holds `(legacy)`, `api`, `favicon.ico`, `icon.tsx`, `opengraph-image.tsx`, `print-edition`, `robots.ts` and `sitemap.ts`.

- [ ] **Step 2: Update the tests that read files by path**

In `src/lib/integrity.test.ts`, replace:
- `"src/app/not-found.tsx"` with `"src/app/(legacy)/not-found.tsx"`
- `"src/app/colophon/page.tsx"` with `"src/app/(legacy)/colophon/page.tsx"`
- `"src/app/projects/[slug]/page.tsx"` with `"src/app/(legacy)/projects/[slug]/page.tsx"`

In `src/lib/opening/copy.test.ts`, replace `"src/app/globals.css"` with `"src/app/(legacy)/globals.css"`.

Then run `grep -rn --include='*.test.ts' '"src/app/' src` and confirm that every remaining hit points at a path that exists.

- [ ] **Step 3: Enable the global not-found page**

In `next.config.ts`, add `experimental` to the config object:

```ts
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    globalNotFound: true,
  },
  images: {
```

Leave the rest of the file unchanged.

Create `src/app/global-not-found.tsx`:

```tsx
import type { Metadata } from "next";
import "./(legacy)/globals.css";

export const metadata: Metadata = {
  title: "Correction — A. T. Qumhiyeh",
  description: "The page you requested was a misprint. The front page still holds the work.",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en-GB">
      <body>
        <main data-testid="correction" style={{ maxWidth: "40rem", margin: "4rem auto", padding: "0 1.25rem" }}>
          <p>Correction</p>
          <h1>The page you requested was a misprint.</h1>
          <p>It never made the plate. The front page still holds the work.</p>
          <p>
            <a href="/">← Back to the front page</a> · <a href="/print-edition">Resume</a> ·{" "}
            <a href="/#contact">Contact</a>
          </p>
        </main>
      </body>
    </html>
  );
}
```

This keeps the current 404 copy; Phase 4 redesigns it.

- [ ] **Step 4: Verify tests and build**

Run `npm test`. Expected: `Test Files 25 passed`, `Tests 179 passed`.

Run `npm run build`. Expected: the build succeeds and the route table still lists `/`, `/opening-preparation`, `/projects/[slug]`, `/lab/learned-evaluator`, `/colophon`, `/print-edition`, `/admin` and `/sitemap.xml`. If the build reports a relative-import error in a moved file, fix that import path, then rebuild.

- [ ] **Step 5: Smoke-test the running site**

```bash
npm run start -- -p 3100 &
sleep 5
for u in / /opening-preparation /projects/veridian /lab/learned-evaluator /colophon /print-edition /no-such-page; do
  printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100$u)" "$u"
done
kill %1
```

Expected: `200` for the first six URLs, `404` for `/no-such-page`.

- [ ] **Step 6: Commit**

```bash
git add -A src/app next.config.ts src/lib/integrity.test.ts src/lib/opening/copy.test.ts
git commit -m "refactor: move current routes into (legacy) route group

Prepares a second root layout for the rebuild. Unknown URLs render
global-not-found with the existing correction copy.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content types, claims and identity

**Files:**
- Create: `src/content/site/types.ts`, `src/content/site/format.ts`, `src/content/site/claims.ts`, `src/content/site/identity.ts`, `src/content/site/index.ts`
- Test: `src/content/site/format.test.ts`, `src/content/site/claims.test.ts`

**Interfaces:**
- Produces:
  - types `EvidenceType`, `Claim`, `Identity`, `RoleKind`, `Role`, `Education`, `SkillGroup`, `ProjectCategory`, `ProjectGroup`, `Project`, and the constant `EVIDENCE_LABEL`;
  - `formatMonth(ym: string): string`, `formatClaimDate(date: string): string`, `formatPeriod(start: string, end: string | null): string`;
  - `CLAIMS: readonly Claim[]`, `IDENTITY: Identity`, `getClaim(id: string): Claim` (throws on unknown id).

- [ ] **Step 1: Write the failing tests**

`src/content/site/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatClaimDate, formatMonth, formatPeriod } from "./format";

describe("format", () => {
  it("formats year-month", () => {
    expect(formatMonth("2026-06")).toBe("Jun 2026");
    expect(formatMonth("2026")).toBe("2026");
  });
  it("formats claim dates at any precision", () => {
    expect(formatClaimDate("2026")).toBe("2026");
    expect(formatClaimDate("2026-02")).toBe("Feb 2026");
    expect(formatClaimDate("2026-09-03")).toBe("3 Sep 2026");
  });
  it("formats periods with an open end as present", () => {
    expect(formatPeriod("2026-06", null)).toBe("Jun 2026 – present");
    expect(formatPeriod("2025-11", "2026-02")).toBe("Nov 2025 – Feb 2026");
  });
});
```

`src/content/site/claims.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/content/site`
Expected: FAIL. Vitest reports it cannot resolve `./format`, `./claims`, `./identity`, `./index` and `./types`.

- [ ] **Step 3: Implement the modules**

`src/content/site/types.ts`:

```ts
export type EvidenceType =
  | "production"
  | "controlled-evaluation"
  | "controlled-benchmark"
  | "capacity-benchmark"
  | "capability"
  | "award";

export const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  production: "Production",
  "controlled-evaluation": "Controlled evaluation",
  "controlled-benchmark": "Controlled benchmark",
  "capacity-benchmark": "Capacity benchmark",
  capability: "Capability",
  award: "Award",
};

export type Claim = {
  id: string;
  display: string;
  type: EvidenceType;
  owner: string;
  /** YYYY, YYYY-MM or YYYY-MM-DD */
  date: string;
  context: string;
  methodNotes?: string;
};

export type Identity = {
  legalName: string;
  displayName: string;
  currentRole: { title: string; employer: string; since: string };
  heroHeadline: string;
  heroSubline: string;
  summary: string;
  availability: string;
  contactHeading: string;
  location: string;
  status: readonly string[];
  responseTime: string;
  email: string;
  phone: { display: string; tel: string };
  linkedin: string;
  github: string;
  about: readonly string[];
};

export type RoleKind = "Full-time" | "Contract" | "Internship";

export type Role = {
  /** Fragment id on the front page, e.g. "deriv". */
  id: string;
  employer: string;
  title: string;
  kind: RoleKind;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM, or null for the current role */
  end: string | null;
  tech: readonly string[];
  scope?: string;
  bullets: readonly string[];
  claimIds: readonly string[];
  /** Factual note printed under the claims (e.g. the +45% / +35% split). */
  note?: string;
  /** Voice: rendered in Literata Italic. */
  annotation?: string;
  /** Condensed under "Earlier experience". */
  earlier: boolean;
};

export type Education = {
  institution: string;
  location: string;
  degree: string;
  minor: string;
  /** YYYY-MM */
  graduated: string;
  honours: readonly string[];
  wam: string;
  cgpa: string;
};

export type SkillGroup = { label: string; items: readonly string[] };

export type ProjectCategory = "ml" | "product" | "devtools";
export type ProjectGroup = "featured" | "archive" | "lab";

export type Project = {
  slug: string;
  name: string;
  subtitle: string;
  /** YYYY-MM */
  date: string;
  /** "Solo", "Built with Kai", "Hackathon team of 6", "Lab experiment" */
  origin: string;
  category: ProjectCategory;
  group: ProjectGroup;
  repo?: string;
  tech: readonly string[];
  purpose: string;
  result: { claimId?: string; line: string };
  seo: { title: string; description: string };
};
```

`src/content/site/format.ts`:

```ts
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  if (!m) return y;
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export function formatClaimDate(date: string): string {
  const [y, m, d] = date.split("-");
  if (!m) return y;
  if (!d) return `${MONTHS[Number(m) - 1]} ${y}`;
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function formatPeriod(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "present"}`;
}
```

`src/content/site/claims.ts`:

```ts
import type { Claim } from "./types";

export const CLAIMS: readonly Claim[] = [
  { id: "derivCxCost", display: "~80% lower CX cost", type: "production", owner: "Deriv", date: "2026", context: "Full-stack customer-support system that proactively resolves user issues." },
  { id: "derivCsat", display: "CSAT 5/10 → 8/10", type: "production", owner: "Deriv", date: "2026", context: "Average customer satisfaction after the support system shipped." },
  { id: "derivEvents", display: "~20,000 complex events/day", type: "production", owner: "Deriv", date: "2026", context: "Kafka- and API-based ingestion pipelines." },
  { id: "derivTimeToFix", display: "~50% faster time-to-fix", type: "production", owner: "Deriv", date: "2026", context: "Evaluation and debugging harnesses that reproduce production failures." },
  { id: "derivAwsCost", display: "~10–30% lower AWS cost", type: "production", owner: "Deriv", date: "2026", context: "Terraform changes on maintained AWS resources." },
  { id: "derivGoService", display: "4–6 services → one response", type: "capability", owner: "Deriv", date: "2026", context: "Go microservice sized for ~8,000–10,000 requests/day; running in staging, not production." },
  { id: "skribbleErrors", display: "Weekly production errors 16 → 3", type: "production", owner: "Skribble Lab", date: "2026", context: "From high/medium severity to low severity (~80%)." },
  { id: "skribbleMerchants", display: "5+ merchants on Xendit", type: "production", owner: "Skribble Lab", date: "2026", context: "Bank transfer, card and e-wallet payments." },
  { id: "skribbleReach", display: "3,000+ students and parents", type: "production", owner: "Skribble Lab", date: "2026", context: "Onboarding of Chung Ling Private High School (CLPHS)." },
  { id: "monashRetrieval", display: "+45% retrieval vs vector-only", type: "controlled-evaluation", owner: "Monash University contract", date: "2026-02", context: "Self-correcting Text-to-Cypher over a Neo4j graph of university regulations." },
  { id: "slmLatency", display: "−50% inference latency", type: "controlled-evaluation", owner: "Monash University contract", date: "2026-02", context: "Graph-logic SLM distilled on the Monash contract, not the SLM Distillation Engine." },
  { id: "faultlineLocate", display: "First PASS→FAIL commit in 1–5 min", type: "controlled-evaluation", owner: "FaultLine", date: "2026-07", context: "On small-to-medium projects." },
  { id: "faultlineSaved", display: "1–3 h saved per investigation", type: "controlled-evaluation", owner: "FaultLine", date: "2026-07", context: "Compared with manual bisecting." },
  { id: "teleportalTasks", display: "90%+ of demo desktop tasks, unaided", type: "controlled-evaluation", owner: "Gemini Teleportal (with Kai)", date: "2026-03", context: "A demo task set, not general use." },
  { id: "teleportalLatency", display: "~2–5 s from voice to action", type: "controlled-evaluation", owner: "Gemini Teleportal (with Kai)", date: "2026-03", context: "Phone audio and screen video over WebRTC to the Gemini Live API." },
  { id: "circuitmindInspection", display: "Vision and voice PCB inspection", type: "capability", owner: "CircuitMindAI", date: "2026-03", context: "Cached for network loss; detection quality was not measured." },
  { id: "mirrorfiPrize", display: "Grand Prize, Solana Megahack 2025", type: "award", owner: "MirrorFi (team of 6)", date: "2025-05", context: "Out of 150+ teams." },
  { id: "graphragRetrieval", display: "+35% retrieval vs vector-only", type: "controlled-evaluation", owner: "Multi-Agent GraphRAG", date: "2025-10", context: "Independent handbook and policy archive, not the Monash corpus." },
  { id: "setelDefects", display: "−40% production defects", type: "production", owner: "Setel", date: "2025-12", context: "Checkout and capture; a separate observation from the 92.5% coverage." },
  { id: "setelCoverage", display: "92.5% unit-test coverage", type: "controlled-evaluation", owner: "Setel", date: "2025-12", context: "Checkout and capture." },
  { id: "wdOversight", display: "−40% manual oversight", type: "controlled-evaluation", owner: "Western Digital", date: "2025-12", context: "Lab dashboard used by 50+ staff." },
  { id: "leadThroughput", display: "100M-event capacity benchmark", type: "capacity-benchmark", owner: "Distributed Lead Scorer", date: "2025-05", context: "Pipeline capacity, not sustained traffic." },
  { id: "veridianUptime", display: "99.9% observed uptime", type: "controlled-evaluation", owner: "Veridian", date: "2026-04", context: "Cloud Run evaluation, not a production SLO." },
  { id: "veridianEmissions", display: "−15% cloud emissions", type: "controlled-evaluation", owner: "Veridian", date: "2026-04", context: "Against the default unscheduled Cloud Run service." },
  { id: "riskAuc", display: "0.87 AUC-ROC", type: "controlled-evaluation", owner: "Financial Risk Predictor", date: "2025-07", context: "Offline evaluation, no published comparator." },
  { id: "slmInference", display: "70B → 3B student", type: "controlled-evaluation", owner: "SLM Distillation Engine", date: "2025-07", context: "No speed-up claimed." },
  { id: "gateC", display: "−143 Elo @ 50k nodes", type: "controlled-benchmark", owner: "Chess engine lab", date: "2026-09-03", context: "128 games against handcrafted PeSTO; SPRT terminated for H0." },
];
```

`src/content/site/identity.ts`:

```ts
import type { Identity } from "./types";

export const IDENTITY: Identity = {
  legalName: "Anas Tarek Qumhiyeh",
  displayName: "Anas Qumhiyeh",
  currentRole: { title: "AI Engineer", employer: "Deriv", since: "2026-06" },
  heroHeadline: "I like systems that have to survive measurement.",
  heroSubline:
    "Anas Qumhiyeh — AI Engineer at Deriv. I build production services in Go, TypeScript and Python, from payment gateways to support agents, and I publish the results, including the ones that lose.",
  summary:
    "Full-stack engineer building production services in Go, TypeScript and Python on PostgreSQL, Redis and Kubernetes, with digital-commerce experience in payment-gateway integration and merchant onboarding.",
  availability: "AI Engineer at Deriv since June 2026. Open to conversations about mid-level software engineering roles.",
  contactHeading: "Hiring a software engineer for backend, full-stack, or AI-systems work? Write to me.",
  location: "Bandar Sunway, Selangor, Malaysia",
  status: ["Malaysian citizen", "Open to remote", "Open to relocating to Singapore or Australia"],
  responseTime: "Usually replies within two business days (MYT).",
  email: "anasqumhiyeh@gmail.com",
  phone: { display: "+60 11-12983-246", tel: "+601112983246" },
  linkedin: "https://linkedin.com/in/anasqumhiyeh/",
  github: "https://github.com/Mizore66",
  // DRAFT for owner review (roadmap, Phase 1 review point).
  about: [
    "I'm a software engineer at Deriv, where I build AI customer-support systems in Go, FastAPI and Next.js on AWS. Before that I owned a payment-gateway integration at Skribble Lab and built graph retrieval over university regulations at Monash, where I graduated with First Class Honours in software engineering.",
    "I've played chess since I was a teenager, which is why this site is laid out like an analysis board: moves are facts, annotations are voice. Where I worked in a team, the entry says so; independent projects are mine unless marked otherwise.",
  ],
};
```

`src/content/site/index.ts`:

```ts
import { CLAIMS } from "./claims";
import type { Claim } from "./types";

export function getClaim(id: string): Claim {
  const claim = CLAIMS.find((c) => c.id === id);
  if (!claim) throw new Error(`Unknown claim: ${id}`);
  return claim;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/content/site`
Expected: PASS, 2 files and 11 tests.

- [ ] **Step 5: Commit**

```bash
git add src/content/site
git commit -m "feat(content): typed claims ledger and identity for the rebuild

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Roles, education and skills

**Files:**
- Create: `src/content/site/roles.ts`, `src/content/site/education.ts`, `src/content/site/skills.ts`
- Test: `src/content/site/roles.test.ts`

**Interfaces:**
- Consumes: `Role`, `Education`, `SkillGroup` from `./types`, and `getClaim` from `./index`.
- Produces: `ROLES: readonly Role[]` (newest first), `OVERLAP_NOTE: string`, `RETRIEVAL_SPLIT: string`, `EDUCATION: Education`, `SKILLS: readonly SkillGroup[]`.

- [ ] **Step 1: Write the failing test**

`src/content/site/roles.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/content/site/roles.test.ts`
Expected: FAIL. Vitest cannot resolve `./roles`, `./education` or `./skills`.

- [ ] **Step 3: Implement the modules**

`src/content/site/roles.ts`:

```ts
import type { Role } from "./types";

export const RETRIEVAL_SPLIT =
  "+45% is the Monash contract on university regulations. +35% is the independent GraphRAG project on a separate university handbook and policy archive. Same comparison — vector-only — different corpus.";

export const OVERLAP_NOTE =
  "Western Digital (Feb–Dec 2025) overlapped with the Setel internship (Jul–Dec 2025) and final-year study. The Monash contract (Nov 2025 – Feb 2026) overlapped with the start of Skribble Lab (Jan 2026). I graduated in April 2026 and joined Deriv in June.";

export const ROLES: readonly Role[] = [
  {
    id: "deriv",
    employer: "Deriv",
    title: "AI Engineer",
    kind: "Full-time",
    start: "2026-06",
    end: null,
    tech: ["Go", "FastAPI", "Next.js", "Kafka", "Terraform", "AWS EKS/EC2"],
    bullets: [
      "Shipped a full-stack customer-support system that proactively resolves user issues.",
      "Built a Go microservice that unifies data from 4–6 internal services into a single response for the support system, now running in staging.",
      "Built and operate Kafka- and API-based ingestion pipelines for reliable downstream analysis.",
      "Built evaluation and debugging harnesses that reproduce failures and capture environment signals.",
      "Updated the team's Terraform configurations while scaling existing infrastructure and provisioning new services.",
    ],
    claimIds: ["derivCxCost", "derivCsat", "derivEvents", "derivTimeToFix", "derivAwsCost", "derivGoService"],
    earlier: false,
  },
  {
    id: "skribble-lab",
    employer: "Skribble Lab",
    title: "Software Engineer",
    kind: "Full-time",
    start: "2026-01",
    end: "2026-06",
    tech: ["Laravel", "PostgreSQL", "Redis", "Docker"],
    bullets: [
      "Owned the Xendit payment-gateway integration end to end, from requirements review through production support.",
      "Designed and shipped a merchant onboarding module for product and payment setup, and onboarded the primary client, Chung Ling Private High School.",
      "Hunted integration breakage and production defects before customers found them.",
    ],
    claimIds: ["skribbleMerchants", "skribbleReach", "skribbleErrors"],
    earlier: false,
  },
  {
    id: "monash-university",
    employer: "Monash University",
    title: "Full-Stack AI Engineer",
    kind: "Contract",
    start: "2025-11",
    end: "2026-02",
    tech: ["FastAPI", "Neo4j", "Next.js", "LangGraph"],
    scope: "I owned the GraphRAG retrieval path and the distilled SLM; the faculty's administration tools were outside my scope.",
    bullets: [
      "Built a FastAPI and Neo4j graph service for university regulations with a self-correcting Text-to-Cypher loop.",
      "Automated prerequisite and credit-transfer rule resolution with embeddings plus multi-hop graph queries.",
      "Profiled and simplified the reasoning pipeline into a graph-logic SLM that surfaced contradictory policy data for administrators.",
    ],
    claimIds: ["monashRetrieval", "slmLatency"],
    note: RETRIEVAL_SPLIT,
    earlier: false,
  },
  {
    id: "western-digital",
    employer: "Western Digital",
    title: "Full-stack Engineer",
    kind: "Contract",
    start: "2025-02",
    end: "2025-12",
    tech: ["Next.js", "ASP.NET", "PostgreSQL", "Docker"],
    bullets: [
      "Built the lab-operations dashboard used by 50+ lab staff, with WebSocket station-status and model-inference updates under 100 ms of UI-visible latency.",
    ],
    claimIds: ["wdOversight"],
    annotation: "Operators had to walk stations when the board was silent, so the dashboard had to carry live status.",
    earlier: true,
  },
  {
    id: "setel",
    employer: "Setel",
    title: "Software Engineer Intern",
    kind: "Internship",
    start: "2025-07",
    end: "2025-12",
    tech: ["Docker", "Kubernetes", "React", "Node.js", "MongoDB", "NestJS"],
    bullets: ["Authorization and capture of stored payment methods on the payment engine, documented so a new developer could follow the path without a walkthrough."],
    claimIds: ["setelCoverage", "setelDefects"],
    annotation: "Payment-engine defects could travel to checkout at the pump, so the tests had to survive that path.",
    earlier: true,
  },
  {
    id: "petronas",
    employer: "Petronas",
    title: "Project Engineer Intern",
    kind: "Internship",
    start: "2024-11",
    end: "2025-02",
    tech: ["MATLAB", "Python", "MathCAD"],
    bullets: ["Replaced MATLAB-dependent back-end calculation and reporting functions with Python packages, removing paid runtime dependencies."],
    claimIds: [],
    earlier: true,
  },
];
```

"Authorization and capture" is kept verbatim as payments-domain terminology (brief §3.3). The en-GB check in Task 4 excludes the literal phrase "Authorization and capture".

`src/content/site/education.ts`:

```ts
import type { Education } from "./types";

export const EDUCATION: Education = {
  institution: "Monash University",
  location: "Bandar Sunway, Selangor, Malaysia",
  degree: "Bachelor of Engineering (Honours), Software Engineering",
  minor: "Minor in Artificial Intelligence",
  graduated: "2026-04",
  honours: ["First Class Honours", "Best Graduate Award", "Dean's List"],
  wam: "81.8",
  cgpa: "3.78",
};
```

`src/content/site/skills.ts`:

```ts
import type { SkillGroup } from "./types";

export const SKILLS: readonly SkillGroup[] = [
  { label: "Languages", items: ["Go", "TypeScript", "Python", "JavaScript", "SQL", "PHP", "C#", "HTML/CSS"] },
  { label: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "ShadCN", "jQuery"] },
  { label: "Backend and APIs", items: ["Node.js", "NestJS", "FastAPI", "Laravel", "ASP.NET", "REST APIs", "WebSockets", "WebRTC", "Kafka", "Microservices"] },
  { label: "Data", items: ["PostgreSQL", "Redis", "MySQL", "MongoDB", "Neo4j", "Elasticsearch"] },
  { label: "Cloud and DevOps", items: ["Kubernetes (AWS EKS)", "Docker", "AWS (EC2, EKS)", "Google Cloud (Cloud Run, Cloud Build, Firestore)", "Terraform", "ArgoCD", "GitHub Actions", "GitLab CI/CD", "Grafana", "Loki"] },
  { label: "AI/ML", items: ["LangGraph", "PyTorch", "TensorFlow", "pandas", "NumPy"] },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/content/site`
Expected: PASS, with every test in `roles.test.ts` green.

- [ ] **Step 5: Commit**

```bash
git add src/content/site
git commit -m "feat(content): roles, education and skills from the current résumé

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Projects, lab teaser and work filter helpers

**Files:**
- Create: `src/content/site/projects.ts`, `src/content/site/lab.ts`
- Modify: `src/content/site/index.ts` (append the project helpers)
- Test: `src/content/site/projects.test.ts`

**Interfaces:**
- Consumes: `Project`, `ProjectCategory` from `./types`; `getClaim` from `./index`; `ROLES` from `./roles`; `CLAIMS`, `IDENTITY`, `EDUCATION`, `SKILLS`.
- Produces:
  - `PROJECTS: readonly Project[]`
  - `FEATURED_SLUGS: readonly ["faultline", "gemini-teleportal", "circuitmindai"]`
  - `CATEGORY_LABEL: Record<ProjectCategory, string>`
  - `LAB_TEASER: { claimId: string; headline: string; meta: string; annotation: string; links: readonly { label: string; href: string }[] }`
  - In `index.ts`: `type WorkPath = ProjectCategory`, `parsePath(v: unknown): WorkPath | null`, `featuredProjects(): Project[]`, `workFor(path: WorkPath | null): { featured: Project[]; archive: Project[] }`, `pathCounts(): Record<"all" | WorkPath, number>`.

- [ ] **Step 1: Write the failing test**

`src/content/site/projects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CLAIMS } from "./claims";
import { EDUCATION } from "./education";
import { IDENTITY } from "./identity";
import { featuredProjects, getClaim, parsePath, pathCounts, workFor } from "./index";
import { LAB_TEASER } from "./lab";
import { FEATURED_SLUGS, PROJECTS } from "./projects";
import { ROLES } from "./roles";
import { SKILLS } from "./skills";

const LEGACY_SLUGS = [
  "veridian",
  "circuitmindai",
  "mirrorfi",
  "multi-agent-graphrag",
  "financial-risk-predictor",
  "distributed-lead-scorer",
  "slm-distillation-engine",
];

describe("projects", () => {
  it("features exactly FaultLine, Gemini Teleportal, CircuitMindAI in order", () => {
    expect(FEATURED_SLUGS).toEqual(["faultline", "gemini-teleportal", "circuitmindai"]);
    expect(featuredProjects().map((p) => p.slug)).toEqual(FEATURED_SLUGS);
    expect(PROJECTS.filter((p) => p.group === "featured").map((p) => p.slug).sort()).toEqual([...FEATURED_SLUGS].sort());
  });
  it("keeps every legacy project URL", () => {
    for (const slug of LEGACY_SLUGS) expect(PROJECTS.some((p) => p.slug === slug), slug).toBe(true);
  });
  it("has unique kebab-case slugs and unique SEO titles", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const titles = PROJECTS.map((p) => p.seo.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
  it("keeps meta descriptions at 160 characters or fewer", () => {
    for (const p of PROJECTS) expect(p.seo.description.length, p.slug).toBeLessThanOrEqual(160);
  });
  it("only references claims that exist", () => {
    for (const p of PROJECTS) if (p.result.claimId) expect(() => getClaim(p.result.claimId!)).not.toThrow();
  });
  it("never attributes the Monash −50% latency to the SLM Distillation Engine", () => {
    const slm = PROJECTS.find((p) => p.slug === "slm-distillation-engine");
    expect(JSON.stringify(slm)).not.toMatch(/50%/);
  });
  it("credits Kai on Gemini Teleportal and the team on MirrorFi", () => {
    expect(PROJECTS.find((p) => p.slug === "gemini-teleportal")?.origin).toBe("Built with Kai");
    expect(PROJECTS.find((p) => p.slug === "mirrorfi")?.origin).toBe("Hackathon team of 6");
  });
});

describe("claim placement", () => {
  it("shows each claim at most once on the front page, so fragment ids stay unique", () => {
    const used = [
      ...ROLES.flatMap((r) => r.claimIds),
      ...PROJECTS.filter((p) => p.group !== "lab").flatMap((p) => (p.result.claimId ? [p.result.claimId] : [])),
      LAB_TEASER.claimId,
    ];
    expect(new Set(used).size).toBe(used.length);
  });
  it("keeps the legacy claim anchors reachable", () => {
    const used = new Set([
      ...ROLES.flatMap((r) => r.claimIds),
      ...PROJECTS.flatMap((p) => (p.result.claimId ? [p.result.claimId] : [])),
    ]);
    for (const id of ["setelDefects", "monashRetrieval", "leadThroughput"]) expect(used.has(id), id).toBe(true);
  });
});

describe("work filter", () => {
  it("parses only known paths", () => {
    expect(parsePath("ml")).toBe("ml");
    expect(parsePath("product")).toBe("product");
    expect(parsePath("devtools")).toBe("devtools");
    expect(parsePath("x")).toBeNull();
    expect(parsePath(undefined)).toBeNull();
  });
  it("filters featured and archive by category", () => {
    const ml = workFor("ml");
    expect([...ml.featured, ...ml.archive].every((p) => p.category === "ml")).toBe(true);
    const all = workFor(null);
    expect(all.featured).toHaveLength(3);
    expect(all.archive.every((p) => p.group === "archive")).toBe(true);
  });
  it("counts projects per path (lab excluded)", () => {
    const counts = pathCounts();
    expect(counts.all).toBe(counts.ml + counts.product + counts.devtools);
    expect(counts.all).toBe(PROJECTS.filter((p) => p.group !== "lab").length);
  });
});

describe("lab teaser", () => {
  it("keeps the honest wording", () => {
    expect(LAB_TEASER.headline).toMatch(/underperformed PeSTO/);
    expect(getClaim(LAB_TEASER.claimId).id).toBe("gateC");
  });
});

describe("en-GB spelling", () => {
  it("uses British spellings across all site content", () => {
    const text = JSON.stringify([CLAIMS, IDENTITY, ROLES, EDUCATION, SKILLS, PROJECTS, LAB_TEASER]).replaceAll(
      "Authorization and capture",
      "",
    );
    expect(text).not.toMatch(/\b(behavior|catalog|authorization|organization|optimize|analyze|color)\b/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/content/site/projects.test.ts`
Expected: FAIL. Vitest cannot resolve `./projects` or `./lab`, and `featuredProjects` is not exported.

- [ ] **Step 3: Implement the modules**

`src/content/site/projects.ts`:

```ts
import type { Project, ProjectCategory } from "./types";

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  ml: "ML / data systems",
  product: "Product / backend",
  devtools: "Developer tools",
};

export const FEATURED_SLUGS = ["faultline", "gemini-teleportal", "circuitmindai"] as const;

export const PROJECTS: readonly Project[] = [
  {
    slug: "faultline",
    name: "FaultLine",
    subtitle: "Regression and leak-evidence CLI",
    date: "2026-07",
    origin: "Solo",
    category: "devtools",
    group: "featured",
    repo: "https://github.com/Mizore66/faultline",
    tech: ["Go", "Docker", "GitHub Actions", "Sigstore"],
    purpose: "Replays a frozen, human-reviewed check across Git history in Docker sandboxes to find the first reliable PASS→FAIL commit.",
    result: { claimId: "faultlineLocate", line: "First PASS→FAIL commit in 1–5 min" },
    seo: {
      title: "FaultLine — Regression and leak-evidence CLI",
      description: "A Go CLI that replays a frozen, human-reviewed check across Git history in Docker sandboxes to find the first reliable PASS→FAIL commit.",
    },
  },
  {
    slug: "gemini-teleportal",
    name: "Gemini Teleportal",
    subtitle: "Voice-controlled desktop AI agent",
    date: "2026-03",
    origin: "Built with Kai",
    category: "product",
    group: "featured",
    repo: "https://github.com/Kaiz404/Teleportal",
    tech: ["Next.js", "TypeScript", "Python", "Gemini Live API", "WebRTC", "Firebase", "Cloud Run"],
    purpose: "Streams phone audio and screen video to the Gemini Live API, which drives the Windows desktop by exact UI element ids.",
    result: { claimId: "teleportalTasks", line: "90%+ of demo desktop tasks, unaided" },
    seo: {
      title: "Gemini Teleportal — Voice-controlled desktop AI agent",
      description: "A voice-controlled desktop agent built with Kai: phone audio and screen video stream over WebRTC to the Gemini Live API, which drives the Windows UI.",
    },
  },
  {
    slug: "circuitmindai",
    name: "CircuitMindAI",
    subtitle: "PCB inspection",
    date: "2026-03",
    origin: "Solo",
    category: "product",
    group: "featured",
    repo: "https://github.com/Mizore66/CircuitMindAI",
    tech: ["Next.js", "Amazon Bedrock", "Express", "OpenSearch Serverless", "GitHub Actions", "ECS Fargate"],
    purpose: "Images in, voice-guided inspection steps out, with cached results for network loss.",
    result: { claimId: "circuitmindInspection", line: "Vision and voice PCB inspection" },
    seo: {
      title: "CircuitMindAI — PCB inspection",
      description: "Nova Pro analyses the PCB image; Nova Sonic talks the operator through the fault. Next.js and Express on ECS Fargate.",
    },
  },
  {
    slug: "veridian",
    name: "Veridian",
    subtitle: "MLOps tradeoff engine",
    date: "2026-04",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["Python", "Terraform", "BigQuery", "GCP Vertex AI", "GitLab Duo", "MCP"],
    purpose: "Intercepts Terraform and Kubernetes and recommends a lower-carbon compute configuration before provisioning or a demand-driven scale event.",
    result: { claimId: "veridianEmissions", line: "−15% cloud emissions (Cloud Run evaluation)" },
    seo: {
      title: "Veridian — MLOps tradeoff engine",
      description: "GitLab Duo intercepts Terraform; Vertex AI recommends a lower-carbon compute configuration; BigQuery keeps the carbon ledger off the request.",
    },
  },
  {
    slug: "multi-agent-graphrag",
    name: "Multi-Agent GraphRAG",
    subtitle: "Policy-corpus retrieval",
    date: "2025-10",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["LangGraph", "Neo4j", "Vector DB", "Knowledge Graphs", "RAG"],
    purpose: "LangGraph over an independent university handbook and policy archive, with a vector fallback.",
    result: { claimId: "graphragRetrieval", line: "+35% retrieval vs vector-only" },
    seo: {
      title: "Multi-Agent GraphRAG — Policy-corpus retrieval",
      description: "LangGraph over an independent university handbook and policy archive: agents write Cypher, check it, and fall back to a vector store. +35% retrieval.",
    },
  },
  {
    slug: "mirrorfi",
    name: "MirrorFi",
    subtitle: "Solana vault strategy platform",
    date: "2025-05",
    origin: "Hackathon team of 6",
    category: "product",
    group: "archive",
    repo: "https://github.com/Mizore66/MirrorFi",
    tech: ["Next.js", "ShadCN", "MongoDB", "Solana", "Node.js"],
    purpose: "A no-code builder for sharing and executing Solana yield strategies across Drift, Jupiter and Meteora.",
    result: { claimId: "mirrorfiPrize", line: "Grand Prize, Solana Megahack 2025" },
    seo: {
      title: "MirrorFi — Solana vault strategy platform",
      description: "Grand Prize, Solana Megahack 2025: a no-code builder for sharing and executing Solana yield strategies across Drift, Jupiter and Meteora.",
    },
  },
  {
    slug: "financial-risk-predictor",
    name: "Financial Risk Predictor",
    subtitle: "ML risk assessment",
    date: "2025-07",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["TensorFlow", "XGBoost", "LightGBM", "BentoML", "SHAP", "Kafka"],
    purpose: "Daily credit-risk scores that have to be interpreted, served, and retrained.",
    result: { claimId: "riskAuc", line: "0.87 AUC-ROC" },
    seo: {
      title: "Financial Risk Predictor — ML risk assessment",
      description: "Kafka feeds the daily tape. LightGBM and XGBoost score it at 0.87 AUC-ROC. SHAP writes why. BentoML serves the number.",
    },
  },
  {
    slug: "distributed-lead-scorer",
    name: "Distributed Lead Scorer",
    subtitle: "Large-scale data mining pipeline",
    date: "2025-05",
    origin: "Solo",
    category: "ml",
    group: "archive",
    tech: ["PySpark", "PyTorch DDP", "Deep Interest Network"],
    purpose: "Scores conversion on a hundred million events a day, with checkpoints so a failed hour can resume.",
    result: { claimId: "leadThroughput", line: "100M-event capacity benchmark" },
    seo: {
      title: "Distributed Lead Scorer — Large-scale data mining pipeline",
      description: "Capacity-benchmarked at 100M events/day. A Deep Interest Network on PyTorch DDP scores conversion. Checkpoints resume from the last completed slice.",
    },
  },
  {
    slug: "slm-distillation-engine",
    name: "SLM Distillation Engine",
    subtitle: "Knowledge distillation and fine-tuning",
    date: "2025-07",
    origin: "Lab experiment",
    category: "ml",
    group: "lab",
    tech: ["PyTorch", "QLoRA", "DeepSpeed", "FlashAttention"],
    purpose: "A 70B teacher distilled into a 3B student with QLoRA, DeepSpeed and FlashAttention.",
    result: { claimId: "slmInference", line: "70B → 3B student" },
    seo: {
      title: "SLM Distillation Engine — Knowledge distillation and fine-tuning",
      description: "A 70B teacher writes the traces; QLoRA, DeepSpeed and FlashAttention compress them into a 3B student. No speed-up claimed.",
    },
  },
];
```

`src/content/site/lab.ts`:

```ts
export const LAB_TEASER = {
  claimId: "gateC",
  headline: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games.",
  meta: "128 games · 50 000 nodes/move · SPRT h0",
  annotation: "I published the loss, the confidence interval, and what failed.",
  links: [
    { label: "Read the experiment", href: "/lab/learned-evaluator" },
    { label: "Play the annotated career", href: "/opening-preparation" },
    { label: "SLM Distillation Engine", href: "/projects/slm-distillation-engine" },
  ],
} as const;
```

Append to `src/content/site/index.ts`:

```ts
import { FEATURED_SLUGS, PROJECTS } from "./projects";
import type { Project, ProjectCategory } from "./types";

export type WorkPath = ProjectCategory;

export function parsePath(v: unknown): WorkPath | null {
  return v === "ml" || v === "product" || v === "devtools" ? v : null;
}

export function featuredProjects(): Project[] {
  return FEATURED_SLUGS.map((slug) => {
    const p = PROJECTS.find((x) => x.slug === slug);
    if (!p) throw new Error(`Featured project missing: ${slug}`);
    return p;
  });
}

export function workFor(path: WorkPath | null): { featured: Project[]; archive: Project[] } {
  const keep = (p: Project) => !path || p.category === path;
  return {
    featured: featuredProjects().filter(keep),
    archive: PROJECTS.filter((p) => p.group === "archive" && keep(p)),
  };
}

export function pathCounts(): Record<"all" | WorkPath, number> {
  const listed = PROJECTS.filter((p) => p.group !== "lab");
  const by = (c: WorkPath) => listed.filter((p) => p.category === c).length;
  return { all: listed.length, ml: by("ml"), product: by("product"), devtools: by("devtools") };
}
```

Merge the imports at the top of `index.ts` so each module is imported once.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/content/site`
Expected: PASS, with every test in all 4 files green.

- [ ] **Step 5: Commit**

```bash
git add src/content/site
git commit -m "feat(content): projects, lab teaser and work filter helpers

Featured: FaultLine, Gemini Teleportal, CircuitMindAI (D17). Every
legacy project slug is kept.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The D19 chess line and a static board

**Files:**
- Create: `src/content/site/line.ts`, `src/components/site/StaticBoard.tsx`
- Modify: `vitest.config.mts` (include `.test.tsx`)
- Test: `src/content/site/line.test.ts`, `src/components/site/StaticBoard.test.tsx`

**Interfaces:**
- Consumes:
  - `startPos`, `isLegalPly`, `playPly` from `@/lib/chess/engine`;
  - `positionAfter`, `occupancy`, `occupancyFen`, `figurine`, `FILES` from `@/lib/chess/replay`;
  - the type `Ply` from `@/lib/opening/types`.
- Produces:
  - `LINE_UCI: readonly string[]`, `LINE_PLIES: readonly Ply[]`, `LINE_SAN: string`, `LINE_NAME: string`;
  - `StaticBoard({ plies, label }: { plies: readonly Ply[]; label: string }): JSX.Element`.

- [ ] **Step 1: Allow `.tsx` tests**

In `vitest.config.mts`, change `include: ["src/**/*.test.ts"]` to `include: ["src/**/*.test.{ts,tsx}"]`.

- [ ] **Step 2: Write the failing tests**

`src/content/site/line.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isLegalPly, playPly, startPos } from "@/lib/chess/engine";
import { occupancyFen, positionAfter } from "@/lib/chess/replay";
import { LINE_NAME, LINE_PLIES, LINE_SAN } from "./line";

describe("D19 line", () => {
  it("is legal move by move", () => {
    const pos = startPos();
    LINE_PLIES.forEach((ply, i) => {
      expect(isLegalPly(pos, ply), `ply ${i + 1} ${ply.from}${ply.to}`).toBe(true);
      expect(playPly(pos, ply)).toBe(true);
    });
  });
  it("ends on the position after 10…Bg4", () => {
    expect(occupancyFen(positionAfter(LINE_PLIES))).toBe("r2qk2r/ppp2ppp/2n5/1B1pP3/3Pn1b1/5N2/PP1N1PPP/R2QK2R");
  });
  it("uses the notation and name the owner confirmed", () => {
    expect(LINE_SAN).toBe(
      "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. e5 d5 7. Bb5 Ne4 8. cxd4 Bb4+ 9. Bd2 Bxd2+ 10. Nbxd2 Bg4",
    );
    expect(LINE_NAME).toBe("Italian Game: Classical Variation, Greco Gambit, Anderssen Variation");
  });
});
```

`src/components/site/StaticBoard.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LINE_PLIES } from "@/content/site/line";
import { StaticBoard } from "./StaticBoard";

describe("StaticBoard", () => {
  const html = renderToStaticMarkup(<StaticBoard plies={LINE_PLIES} label="Position after 10…Bg4" />);
  it("draws 64 squares and 28 pieces", () => {
    expect(html.match(/<rect /g)).toHaveLength(64);
    expect(html.match(/<text /g)).toHaveLength(28);
  });
  it("is a labelled image", () => {
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Position after 10…Bg4"');
  });
  it("colours a1 dark and h1 light", () => {
    expect(html).toMatch(/data-square="a1" class="sq-dark"/);
    expect(html).toMatch(/data-square="h1" class="sq-light"/);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/content/site/line.test.ts src/components/site/StaticBoard.test.tsx`
Expected: FAIL. Vitest cannot resolve `./line` or `./StaticBoard`.

- [ ] **Step 4: Implement**

`src/content/site/line.ts`:

```ts
import type { Ply } from "@/lib/opening/types";

/** D19, confirmed by the owner on 2026-09-25 (7. Bb5 and 10. Nbxd2 readings, D23). */
export const LINE_UCI = [
  "e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3", "g8f6", "d2d4", "e5d4",
  "e4e5", "d7d5", "c4b5", "f6e4", "c3d4", "c5b4", "c1d2", "b4d2", "b1d2", "c8g4",
] as const;

export const LINE_PLIES: readonly Ply[] = LINE_UCI.map((u) => ({ from: u.slice(0, 2), to: u.slice(2, 4) }));

export const LINE_SAN =
  "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. e5 d5 7. Bb5 Ne4 8. cxd4 Bb4+ 9. Bd2 Bxd2+ 10. Nbxd2 Bg4";

export const LINE_NAME = "Italian Game: Classical Variation, Greco Gambit, Anderssen Variation";
```

`src/components/site/StaticBoard.tsx`:

```tsx
import { FILES, figurine, occupancy, positionAfter, type Color, type PieceType } from "@/lib/chess/replay";
import type { Ply } from "@/lib/opening/types";

/** Server-rendered board. No engine, no client JS. */
export function StaticBoard({ plies, label }: { plies: readonly Ply[]; label: string }) {
  const occ = occupancy(positionAfter(plies));
  const cells = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${FILES[file]}${rank}`;
      const x = file;
      const y = 8 - rank;
      const dark = (file + rank) % 2 === 1;
      cells.push(
        <rect key={square} data-square={square} className={dark ? "sq-dark" : "sq-light"} x={x} y={y} width={1} height={1} />,
      );
      const code = occ[square];
      if (code) {
        const color = code[0] as Color;
        const type = code[1] as PieceType;
        cells.push(
          <text key={`${square}-piece`} className={color === "w" ? "pc-white" : "pc-black"} x={x + 0.5} y={y + 0.8} textAnchor="middle">
            {`${figurine(type, color)}\uFE0E`}
          </text>,
        );
      }
    }
  }
  return (
    <svg className="board" viewBox="0 0 8 8" role="img" aria-label={label}>
      {cells}
    </svg>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/content/site src/components/site`
Expected: PASS.

If a `.tsx` test fails with "React is not defined", add `oxc: { jsx: { runtime: "automatic" } }` to `vitest.config.mts` and re-run. Vite 8 normally reads `"jsx": "react-jsx"` from `tsconfig.json`, so this fallback shouldn't be needed.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.mts src/content/site/line.ts src/content/site/line.test.ts src/components/site/StaticBoard.tsx src/components/site/StaticBoard.test.tsx
git commit -m "feat(board): D19 Greco Gambit line and a static server-rendered board

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `(site)` root layout, tokens, fonts, header, footer and JSON-LD

**Files:**
- Create: `src/fonts/commit-mono/commit-mono-latin-400-normal.woff2`, `src/fonts/commit-mono/OFL.txt`
- Create: `src/content/site/schema.ts`, `src/components/site/SiteJsonLd.tsx`, `src/components/site/SiteHeader.tsx`, `src/components/site/SiteFooter.tsx`
- Create: `src/app/(site)/layout.tsx`, `src/app/(site)/site.css`
- Test: `src/content/site/schema.test.ts`

**Interfaces:**
- Consumes: `IDENTITY`, `EDUCATION`; `SITE_URL` from `@/lib/site`.
- Produces:
  - `personSchema(): Record<string, unknown>`, `websiteSchema(): Record<string, unknown>`, `serializeJsonLd(data: unknown): string`;
  - `<SiteJsonLd data />`, `<SiteHeader />`, `<SiteFooter />`;
  - the CSS classes used in Task 7:
    - `.board-layout`, `.reading`, `.board-pane`, `.section`, `.kicker`, `.annotation`;
    - `.claim`, `.claim-value`, `.claim-type`, `.claim-meta`, `.claim-context`;
    - `.card`, `.card-meta`, `.card-title`, `.card-purpose`, `.card-result`, `.card-source`;
    - `.role`, `.role-earlier`, `.role-meta`, `.role-scope`, `.role-bullets`, `.role-claims`, `.role-tech`, `.note`;
    - `.chips`, `.chip`, `.chip-active`, `.btn`, `.btn-primary`;
    - `.hero`, `.hero-statement`, `.hero-subline`, `.hero-status`, `.hero-actions`;
    - `.board`, `.sq-dark`, `.sq-light`, `.pc-white`, `.pc-black`;
    - `.sr-only`, `.skip-link`.

- [ ] **Step 1: Self-host Commit Mono**

```bash
npm install --no-save @fontsource/commit-mono@5.3.0
ls node_modules/@fontsource/commit-mono/files | grep "latin-400-normal.woff2"
mkdir -p src/fonts/commit-mono
cp node_modules/@fontsource/commit-mono/files/commit-mono-latin-400-normal.woff2 src/fonts/commit-mono/
cp node_modules/@fontsource/commit-mono/LICENSE src/fonts/commit-mono/OFL.txt
```

Expected: the `ls` prints `commit-mono-latin-400-normal.woff2`, and both files exist under `src/fonts/commit-mono/`.

- [ ] **Step 2: Write the failing schema test**

`src/content/site/schema.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/content/site/schema.test.ts`
Expected: FAIL. Vitest cannot resolve `./schema`.

- [ ] **Step 4: Implement the schema and shell components**

`src/content/site/schema.ts`:

```ts
import { SITE_URL } from "@/lib/site";
import { EDUCATION } from "./education";
import { IDENTITY } from "./identity";

export function personSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: IDENTITY.legalName,
    alternateName: IDENTITY.displayName,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    email: `mailto:${IDENTITY.email}`,
    telephone: IDENTITY.phone.tel,
    jobTitle: IDENTITY.currentRole.title,
    worksFor: { "@type": "Organization", name: IDENTITY.currentRole.employer },
    description: IDENTITY.summary,
    homeLocation: {
      "@type": "Place",
      name: IDENTITY.location,
      address: { "@type": "PostalAddress", addressLocality: "Bandar Sunway", addressRegion: "Selangor", addressCountry: "MY" },
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION.institution },
    sameAs: [IDENTITY.github, IDENTITY.linkedin.replace(/\/$/, "")],
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: IDENTITY.displayName,
    url: SITE_URL,
    author: { "@type": "Person", name: IDENTITY.legalName },
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

`src/components/site/SiteJsonLd.tsx`:

```tsx
import { headers } from "next/headers";
import { serializeJsonLd } from "@/content/site/schema";

export async function SiteJsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
```

`src/components/site/SiteHeader.tsx`:

```tsx
import Link from "next/link";
import { IDENTITY } from "@/content/site/identity";

const NAV = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Lab", href: "/#lab" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Link href="/" className="site-name">
        {IDENTITY.displayName}
      </Link>
      <nav aria-label="Primary" className="site-nav">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <a href="/print-edition" className="site-resume">
          Résumé
        </a>
      </nav>
    </header>
  );
}
```

`src/components/site/SiteFooter.tsx`:

```tsx
import { IDENTITY } from "@/content/site/identity";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>{IDENTITY.legalName}</p>
      <p>
        <a href="/colophon">How this site was made</a> · <a href="/opening-preparation">The annotated career</a>
      </p>
    </footer>
  );
}
```

- [ ] **Step 5: Implement the layout and the stylesheet**

`src/app/(site)/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Literata, Noto_Sans_Symbols_2, Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { personSchema, websiteSchema } from "@/content/site/schema";
import { SITE_URL } from "@/lib/site";
import "./site.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans-src", display: "swap" });
const voice = Literata({ subsets: ["latin"], style: ["italic"], weight: ["400"], variable: "--font-voice-src", display: "swap" });
const chess = Noto_Sans_Symbols_2({ subsets: ["symbols"], weight: "400", variable: "--font-chess-src", display: "swap" });
const mono = localFont({
  src: [{ path: "../../fonts/commit-mono/commit-mono-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-mono-src",
  display: "swap",
});

const TITLE = "Anas Qumhiyeh — Software engineer";
const DESCRIPTION =
  "Anas Qumhiyeh, AI Engineer at Deriv. Production services in Go, TypeScript and Python: AI support systems, payments, and graph retrieval.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Anas Tarek Qumhiyeh" }],
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: SITE_URL },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "light" };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${voice.variable} ${chess.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <SiteJsonLd data={personSchema()} />
        <SiteJsonLd data={websiteSchema()} />
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
```

`src/app/(site)/site.css`:

```css
@import "tailwindcss";

@theme {
  --color-ink: #14181d;
  --color-muted: #4a5561;
  --color-rule: #d7dde3;
  --color-board-light: #e4e8ec;
  --color-board-dark: #7d8a99;
  --color-annotation: #6d3fd6;
  --color-paper: #ffffff;
  --font-sans: var(--font-sans-src), system-ui, sans-serif;
  --font-voice: var(--font-voice-src), Georgia, serif;
  --font-mono: var(--font-mono-src), ui-monospace, monospace;
  --font-chess: var(--font-chess-src), "Segoe UI Symbol", sans-serif;
}

html { background: var(--color-paper); color: var(--color-ink); font-family: var(--font-sans); }
body { margin: 0; font-size: 1rem; line-height: 1.6; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 3px; }
:focus-visible { outline: 3px solid var(--color-annotation); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 1rem; top: 1rem; background: var(--color-paper); padding: .5rem .75rem; z-index: 10; }

.site-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .5rem 1.5rem; padding: .75rem clamp(1rem, 4vw, 2.5rem); border-bottom: 1px solid var(--color-rule); }
.site-name { font-weight: 500; text-decoration: none; }
.site-nav { display: flex; flex-wrap: wrap; gap: .25rem 1rem; }
.site-nav a { display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; color: var(--color-muted); }
.site-nav a:hover { color: var(--color-ink); }
.site-footer { padding: 2rem clamp(1rem, 4vw, 2.5rem); border-top: 1px solid var(--color-rule); color: var(--color-muted); font-size: .9rem; }

.board-layout { display: grid; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 1024px) {
  .board-layout { grid-template-columns: minmax(0, 1fr) 380px; }
  .board-pane { position: sticky; top: 0; align-self: start; height: 100vh; border-left: 1px solid var(--color-rule); }
}
.reading { padding: 0 clamp(1rem, 4vw, 2.5rem) 4rem; max-width: 48rem; }
.board-pane { padding: 1.5rem; display: flex; flex-direction: column; gap: .75rem; }

.section { padding-top: 3.5rem; }
.section > h2 { font-size: 1.5rem; font-weight: 500; margin: 0 0 1rem; }
.kicker { font-family: var(--font-mono); font-size: .8rem; color: var(--color-muted); margin: 0 0 .25rem; }
.annotation { font-family: var(--font-voice); font-style: italic; color: var(--color-annotation); }
.note { color: var(--color-muted); font-size: .95rem; }

.hero { padding-top: clamp(2.5rem, 8vw, 6rem); }
.hero-statement { font-size: clamp(2.25rem, 6vw, 4rem); line-height: 1.05; font-weight: 500; letter-spacing: -.01em; margin: 0 0 1rem; max-width: 18ch; }
.hero-subline { font-size: 1.15rem; max-width: 40rem; margin: 0 0 .75rem; }
.hero-status { color: var(--color-muted); margin: 0 0 1.5rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; }

.btn { display: inline-flex; align-items: center; min-height: 44px; padding: 0 1rem; border: 1px solid var(--color-ink); text-decoration: none; background: var(--color-paper); color: var(--color-ink); font: inherit; cursor: pointer; }
.btn-primary { background: var(--color-ink); color: var(--color-paper); }
.chips { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 1.5rem; padding: 0; list-style: none; }
.chip { display: inline-flex; align-items: center; min-height: 44px; padding: 0 .75rem; border: 1px solid var(--color-rule); text-decoration: none; }
.chip-active { border-color: var(--color-ink); font-weight: 500; }

.claim { margin: .25rem 0; }
.claim-value { font-family: var(--font-mono); }
.claim-type { font-size: .8rem; border: 1px solid var(--color-rule); padding: 0 .35rem; margin-left: .35rem; white-space: nowrap; }
.claim-meta, .claim-context { color: var(--color-muted); font-size: .9rem; }

.cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
.card { border: 1px solid var(--color-rule); padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
.card-meta { font-family: var(--font-mono); font-size: .8rem; color: var(--color-muted); margin: 0; }
.card-title { font-size: 1.1rem; font-weight: 500; margin: 0; }
.card-purpose, .card-result { margin: 0; }
.card-source { font-size: .9rem; }
.archive { margin-top: 1.5rem; padding: 0; list-style: none; border-top: 1px solid var(--color-rule); }
.archive li { padding: .75rem 0; border-bottom: 1px solid var(--color-rule); }

.role { padding: 1.25rem 0; border-top: 1px solid var(--color-rule); }
.role h3 { font-size: 1.15rem; font-weight: 500; margin: 0 0 .5rem; }
.role-meta { font-family: var(--font-mono); font-size: .8rem; color: var(--color-muted); margin: 0; }
.role-scope { color: var(--color-muted); }
.role-bullets { padding-left: 1.1rem; }
.role-tech { font-family: var(--font-mono); font-size: .8rem; color: var(--color-muted); }

.board { width: 100%; max-width: 340px; aspect-ratio: 1; }
.sq-light { fill: var(--color-board-light); }
.sq-dark { fill: var(--color-board-dark); }
.board text { font-family: var(--font-chess); font-size: .8px; font-variant-emoji: text; }
.pc-white { fill: #ffffff; stroke: var(--color-ink); stroke-width: .02px; paint-order: stroke; }
.pc-black { fill: var(--color-ink); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/content/site`
Expected: PASS. `schema.test.ts` is green.

The layout gets verified by the Task 7 build, because `(site)` has no page until then.

- [ ] **Step 7: Commit**

```bash
git add src/fonts src/content/site/schema.ts src/content/site/schema.test.ts src/components/site "src/app/(site)"
git commit -m "feat(shell): (site) root layout, Analysis-board tokens, fonts and JSON-LD

Schibsted Grotesk for facts, Literata Italic for commentary only,
Commit Mono (self-hosted, OFL) for notation. JSON-LD escapes '<'.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: The front page

**Files:**
- Create in `src/components/site/`: `ClaimLine.tsx`, `Hero.tsx`, `ProjectCard.tsx`, `Work.tsx`, `RoleEntry.tsx`, `Experience.tsx`, `Skills.tsx`, `Education.tsx`, `LabTeaser.tsx`, `About.tsx`, `Contact.tsx`, `CopyEmailButton.tsx`, `BoardPane.tsx`
- Create: `src/app/(site)/page.tsx`
- Delete: `src/app/(legacy)/page.tsx`
- Test: `src/components/site/front-page.test.tsx`

**Interfaces:**
- Consumes: everything produced by Tasks 2–6, plus `isOpeningId` from `@/lib/opening/tree`.
- Produces: the page at `/`, the fragment ids listed in the Global Constraints, and `<Work path>`, which renders `id="work"` along with the filter chips.

- [ ] **Step 1: Write the failing markup tests**

`src/components/site/front-page.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getClaim } from "@/content/site";
import { IDENTITY } from "@/content/site/identity";
import { ROLES } from "@/content/site/roles";
import { ClaimLine } from "./ClaimLine";
import { Contact } from "./Contact";
import { Experience } from "./Experience";
import { Hero } from "./Hero";
import { Work } from "./Work";

describe("front page sections", () => {
  it("opens the hero with the statement as h1 and no metric", () => {
    const html = renderToStaticMarkup(<Hero identity={IDENTITY} />);
    expect(html).toMatch(/^<section id="proof"/);
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1];
    expect(h1).toBe("I like systems that have to survive measurement.");
    expect(html).not.toMatch(/claim-/);
  });
  it("labels a claim with its evidence type in text", () => {
    const html = renderToStaticMarkup(<ClaimLine claim={getClaim("setelDefects")} />);
    expect(html).toContain('id="claim-setelDefects"');
    expect(html).toContain("Production");
  });
  it("renders every role anchor and the legacy claim anchors", () => {
    const html = renderToStaticMarkup(<Experience roles={ROLES} />);
    for (const id of ["deriv", "skribble-lab", "monash-university", "western-digital", "setel", "petronas"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('id="claim-setelDefects"');
    expect(html).toContain('id="claim-monashRetrieval"');
    expect(html).toContain('<h3 class="earlier-heading">Earlier experience</h3>');
  });
  it("filters work by path and keeps the leadThroughput anchor in the archive", () => {
    const all = renderToStaticMarkup(<Work path={null} />);
    expect(all).toContain('id="work"');
    expect(all).toContain('id="claim-leadThroughput"');
    expect(all.indexOf('id="faultline"')).toBeLessThan(all.indexOf('id="gemini-teleportal"'));
    expect(all.indexOf('id="gemini-teleportal"')).toBeLessThan(all.indexOf('id="circuitmindai"'));
    const product = renderToStaticMarkup(<Work path="product" />);
    expect(product).not.toContain('id="faultline"');
    expect(product).toContain('id="circuitmindai"');
  });
  it("offers email, phone and both résumé sizes", () => {
    const html = renderToStaticMarkup(<Contact identity={IDENTITY} />);
    expect(html).toContain('href="mailto:anasqumhiyeh@gmail.com"');
    expect(html).toContain('href="tel:+601112983246"');
    expect(html).toContain('href="/print-edition"');
    expect(html).toContain('href="/print-edition?paper=a4"');
    expect(html).toContain("Singapore or Australia");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/site/front-page.test.tsx`
Expected: FAIL. Vitest cannot resolve `./ClaimLine`, `./Contact`, `./Experience`, `./Hero` or `./Work`.

- [ ] **Step 3: Implement the section components**

`src/components/site/ClaimLine.tsx`:

```tsx
import { formatClaimDate } from "@/content/site/format";
import { EVIDENCE_LABEL, type Claim } from "@/content/site/types";

export function ClaimLine({ claim }: { claim: Claim }) {
  return (
    <p id={`claim-${claim.id}`} className="claim">
      <span className="claim-value">{claim.display}</span>
      <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span>
      <span className="claim-meta">
        {" "}
        · {claim.owner} · {formatClaimDate(claim.date)}
      </span>
      <span className="claim-context"> — {claim.context}</span>
    </p>
  );
}
```

`src/components/site/Hero.tsx`:

```tsx
import type { Identity } from "@/content/site/types";

export function Hero({ identity }: { identity: Identity }) {
  return (
    <section id="proof" className="hero" aria-labelledby="hero-statement">
      <h1 id="hero-statement" className="hero-statement">{identity.heroHeadline}</h1>
      <p className="hero-subline">{identity.heroSubline}</p>
      <p className="hero-status">{identity.availability}</p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#work">See the work</a>
        <a className="btn" href="#contact">Contact</a>
      </div>
    </section>
  );
}
```

`src/components/site/ProjectCard.tsx`:

```tsx
import Link from "next/link";
import { getClaim } from "@/content/site";
import { formatMonth } from "@/content/site/format";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL, type Project } from "@/content/site/types";

export function ProjectCard({ project }: { project: Project }) {
  const claim = project.result.claimId ? getClaim(project.result.claimId) : null;
  return (
    <article id={project.slug} className="card" aria-labelledby={`${project.slug}-title`}>
      <p className="card-meta">
        {project.origin} · {formatMonth(project.date)} · {CATEGORY_LABEL[project.category]}
      </p>
      <h3 id={`${project.slug}-title`} className="card-title">
        <Link href={`/projects/${project.slug}`}>
          {project.name} — {project.subtitle}
        </Link>
      </h3>
      <p className="card-purpose">{project.purpose}</p>
      <p className="card-result" id={claim ? `claim-${claim.id}` : undefined}>
        <span className="claim-value">{project.result.line}</span>
        {claim ? <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span> : null}
      </p>
      {project.repo ? (
        <a className="card-source" href={project.repo} target="_blank" rel="noopener noreferrer">
          View source<span className="sr-only"> for {project.name} (opens in new tab)</span>
        </a>
      ) : null}
    </article>
  );
}
```

`src/components/site/Work.tsx`:

```tsx
import Link from "next/link";
import { getClaim, pathCounts, workFor, type WorkPath } from "@/content/site";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL } from "@/content/site/types";
import { ProjectCard } from "./ProjectCard";

const FILTERS: { path: WorkPath | null; label: string }[] = [
  { path: null, label: "All" },
  { path: "ml", label: CATEGORY_LABEL.ml },
  { path: "product", label: CATEGORY_LABEL.product },
  { path: "devtools", label: CATEGORY_LABEL.devtools },
];

export function Work({ path }: { path: WorkPath | null }) {
  const { featured, archive } = workFor(path);
  const counts = pathCounts();
  const shown = featured.length + archive.length;
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <p className="kicker">Selected work</p>
      <h2 id="work-title">Work</h2>
      <ul className="chips" aria-label="Filter work">
        {FILTERS.map((f) => (
          <li key={f.label}>
            <Link
              className={f.path === path ? "chip chip-active" : "chip"}
              aria-current={f.path === path ? "true" : undefined}
              href={f.path ? `/?path=${f.path}#work` : "/#work"}
            >
              {f.label} ({f.path ? counts[f.path] : counts.all})
            </Link>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">
        {shown} projects shown
      </p>
      {featured.length ? (
        <div className="cards">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : null}
      {archive.length ? (
        <>
          <h3 className="archive-heading">Archive and supporting work</h3>
          <ul className="archive">
            {archive.map((p) => {
              const claim = p.result.claimId ? getClaim(p.result.claimId) : null;
              return (
                <li key={p.slug} id={p.slug}>
                  <Link href={`/projects/${p.slug}`}>
                    {p.name} — {p.subtitle}
                  </Link>{" "}
                  <span className="card-result" id={claim ? `claim-${claim.id}` : undefined}>
                    <span className="claim-value">{p.result.line}</span>
                    {claim ? <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
```

`src/components/site/RoleEntry.tsx`:

```tsx
import { getClaim } from "@/content/site";
import { formatPeriod } from "@/content/site/format";
import type { Role } from "@/content/site/types";
import { ClaimLine } from "./ClaimLine";

export function RoleEntry({ role }: { role: Role }) {
  return (
    <article id={role.id} className={role.earlier ? "role role-earlier" : "role"} aria-labelledby={`${role.id}-title`}>
      <p className="role-meta">
        {formatPeriod(role.start, role.end)} · {role.kind}
      </p>
      <h3 id={`${role.id}-title`}>
        {role.employer} — {role.title}
      </h3>
      {role.scope ? <p className="role-scope">{role.scope}</p> : null}
      <ul className="role-bullets">
        {role.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {role.claimIds.length ? (
        <div className="role-claims">
          {role.claimIds.map((id) => (
            <ClaimLine key={id} claim={getClaim(id)} />
          ))}
        </div>
      ) : null}
      {role.note ? <p className="note">{role.note}</p> : null}
      {role.annotation ? <p className="annotation">{role.annotation}</p> : null}
      <p className="role-tech">{role.tech.join(" · ")}</p>
    </article>
  );
}
```

`src/components/site/Experience.tsx`:

```tsx
import { OVERLAP_NOTE } from "@/content/site/roles";
import type { Role } from "@/content/site/types";
import { RoleEntry } from "./RoleEntry";

export function Experience({ roles }: { roles: readonly Role[] }) {
  const current = roles.filter((r) => !r.earlier);
  const earlier = roles.filter((r) => r.earlier);
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <p className="kicker">Experience</p>
      <h2 id="experience-title">Where I&apos;ve worked</h2>
      {current.map((r) => (
        <RoleEntry key={r.id} role={r} />
      ))}
      <h3 className="earlier-heading">Earlier experience</h3>
      {earlier.map((r) => (
        <RoleEntry key={r.id} role={r} />
      ))}
      <p className="note">{OVERLAP_NOTE}</p>
    </section>
  );
}
```

`src/components/site/Skills.tsx`:

```tsx
import { SKILLS } from "@/content/site/skills";

export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <p className="kicker">Stack</p>
      <h2 id="skills-title">Skills</h2>
      <dl className="skills">
        {SKILLS.map((g) => (
          <div key={g.label}>
            <dt>{g.label}</dt>
            <dd>{g.items.join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

`src/components/site/Education.tsx`:

```tsx
import { EDUCATION } from "@/content/site/education";
import { formatMonth } from "@/content/site/format";

export function Education() {
  const e = EDUCATION;
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <p className="kicker">Education</p>
      <h2 id="education-title">{e.institution}</h2>
      <p>
        {e.degree}, {e.minor}
      </p>
      <p>
        {e.honours.join(" · ")} · Graduated {formatMonth(e.graduated)} · WAM {e.wam} · CGPA {e.cgpa}
      </p>
      <p className="note">{e.location}</p>
    </section>
  );
}
```

`src/components/site/LabTeaser.tsx`:

```tsx
import Link from "next/link";
import { getClaim } from "@/content/site";
import { LAB_TEASER } from "@/content/site/lab";
import { EVIDENCE_LABEL } from "@/content/site/types";

export function LabTeaser() {
  const claim = getClaim(LAB_TEASER.claimId);
  return (
    <section id="lab" className="section" aria-labelledby="lab-title">
      <p className="kicker">Lab</p>
      <h2 id="lab-title">The engine experiment</h2>
      <p>{LAB_TEASER.headline}</p>
      <p id={`claim-${claim.id}`} className="claim">
        <span className="claim-value">{LAB_TEASER.meta}</span>
        <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span>
      </p>
      <p className="annotation">{LAB_TEASER.annotation}</p>
      <ul className="chips">
        {LAB_TEASER.links.map((l) => (
          <li key={l.href}>
            <Link className="chip" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`src/components/site/About.tsx`:

```tsx
import type { Identity } from "@/content/site/types";

export function About({ identity }: { identity: Identity }) {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <p className="kicker">About</p>
      <h2 id="about-title">About me</h2>
      {identity.about.map((para) => (
        <p key={para}>{para}</p>
      ))}
    </section>
  );
}
```

`src/components/site/CopyEmailButton.tsx`:

```tsx
"use client";

import { useState } from "react";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 4000);
      }}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
```

`src/components/site/Contact.tsx`:

```tsx
import type { Identity } from "@/content/site/types";
import { CopyEmailButton } from "./CopyEmailButton";

export function Contact({ identity }: { identity: Identity }) {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <p className="kicker">Contact</p>
      <h2 id="contact-title">{identity.contactHeading}</h2>
      <p>{identity.availability}</p>
      <p>
        {identity.location} · {identity.status.join(" · ")}
      </p>
      <p className="note">{identity.responseTime}</p>
      <p className="claim-value">{identity.email}</p>
      <p>
        <a href={`tel:${identity.phone.tel}`}>{identity.phone.display}</a>
      </p>
      <div className="hero-actions">
        <a className="btn btn-primary" href={`mailto:${identity.email}`}>
          Email
        </a>
        <CopyEmailButton email={identity.email} />
        <a className="btn" href={identity.linkedin} target="_blank" rel="me noopener noreferrer">
          LinkedIn<span className="sr-only"> (opens in new tab)</span>
        </a>
        <a className="btn" href={identity.github} target="_blank" rel="me noopener noreferrer">
          GitHub<span className="sr-only"> (opens in new tab)</span>
        </a>
        <a className="btn" href="/print-edition">
          Résumé (Letter)
        </a>
        <a className="btn" href="/print-edition?paper=a4">
          Résumé (A4)
        </a>
      </div>
    </section>
  );
}
```

`src/components/site/BoardPane.tsx`:

```tsx
import Link from "next/link";
import { LINE_NAME, LINE_PLIES, LINE_SAN } from "@/content/site/line";
import { StaticBoard } from "./StaticBoard";

/** Phase 1: static. Phase 3 replaces the link with an in-place "Start engine". */
export function BoardPane() {
  return (
    <aside id="the-game" className="board-pane" aria-labelledby="board-title">
      <p className="kicker">Analysis board</p>
      <h2 id="board-title" className="sr-only">
        Analysis board
      </h2>
      <StaticBoard plies={LINE_PLIES} label="Position after 10…Bg4: the Deriv chapter, the current move." />
      <p className="note">{LINE_NAME}</p>
      <p className="claim-value">{LINE_SAN}</p>
      <p className="annotation">The career, annotated move by move. The latest move is Deriv.</p>
      <Link className="btn" href="/opening-preparation">
        Play the annotated career
      </Link>
    </aside>
  );
}
```

- [ ] **Step 4: Run the markup tests to verify they pass**

Run: `npx vitest run src/components/site`
Expected: PASS for `front-page.test.tsx` and `StaticBoard.test.tsx`.

- [ ] **Step 5: Implement the page and remove the legacy home**

`src/app/(site)/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { About } from "@/components/site/About";
import { BoardPane } from "@/components/site/BoardPane";
import { Contact } from "@/components/site/Contact";
import { Education } from "@/components/site/Education";
import { Experience } from "@/components/site/Experience";
import { Hero } from "@/components/site/Hero";
import { LabTeaser } from "@/components/site/LabTeaser";
import { Skills } from "@/components/site/Skills";
import { Work } from "@/components/site/Work";
import { parsePath } from "@/content/site";
import { IDENTITY } from "@/content/site/identity";
import { ROLES } from "@/content/site/roles";
import { isOpeningId } from "@/lib/opening/tree";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const move = typeof sp.move === "string" ? sp.move : undefined;
  if ((move && isOpeningId(move)) || sp.tape === "1") {
    const q = new URLSearchParams();
    if (move) q.set("move", move);
    if (sp.tape === "1") q.set("tape", "1");
    redirect(`/opening-preparation?${q.toString()}`);
  }
  return (
    <div className="board-layout">
      <main id="main" className="reading">
        <Hero identity={IDENTITY} />
        <Work path={parsePath(sp.path)} />
        <Experience roles={ROLES} />
        <Skills />
        <Education />
        <LabTeaser />
        <About identity={IDENTITY} />
        <Contact identity={IDENTITY} />
      </main>
      <BoardPane />
    </div>
  );
}
```

```bash
git rm "src/app/(legacy)/page.tsx"
```

- [ ] **Step 6: Build and smoke-test**

Run: `npm test && npm run build`
Expected: all unit tests pass, the build succeeds, and `/` appears as a dynamic route.

```bash
npm run start -- -p 3100 &
sleep 5
curl -s http://localhost:3100/ | grep -o '<h1[^>]*>[^<]*</h1>'
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' 'http://localhost:3100/?move=d4'
curl -s 'http://localhost:3100/?path=product' | grep -c 'id="faultline"'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3100/opening-preparation
kill %1
```

Expected output:
1. `<h1 id="hero-statement" class="hero-statement">I like systems that have to survive measurement.</h1>`
2. `307 http://localhost:3100/opening-preparation?move=d4`
3. `0`
4. `200`

- [ ] **Step 7: Commit**

```bash
git add -A src/components/site "src/app/(site)/page.tsx" "src/app/(legacy)"
git commit -m "feat(home): Analysis-board front page led by the statement

Hero states 'I like systems that have to survive measurement.' with no
metrics (D20, D21). Numbers sit beside their work with evidence types.
Featured: FaultLine, Gemini Teleportal, CircuitMindAI. Static board
pane shows the D19 line after 10…Bg4. Legacy ?move=/?tape= redirects
and ?path= filters keep working.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: End-to-end checks, legacy quarantine and preview deploy

**Files:**
- Create: `e2e/site/home.spec.ts`
- Modify: `e2e/document.spec.ts`, `e2e/round-four.spec.ts`, `e2e/round-five.spec.ts`, `e2e/a11y.spec.ts` (skip only the cases that load the old home page)

**Interfaces:**
- Consumes: the running site (Playwright `webServer` runs `npm run dev`).
- Produces: a green `npx playwright test` and branch `rebuild/analysis-board` on GitHub with a Vercel preview.

- [ ] **Step 1: Write the home e2e spec**

`e2e/site/home.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("front page", () => {
  test("opens with the statement as the first heading", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("main h1").first();
    await expect(h1).toHaveText("I like systems that have to survive measurement.");
    await expect(h1).not.toHaveText(/\d/);
  });

  test("keeps every legacy fragment id", async ({ page }) => {
    await page.goto("/");
    for (const id of [
      "work", "proof", "experience", "education", "lab", "about", "contact",
      "monash-university", "western-digital", "setel", "petronas", "deriv", "skribble-lab",
      "veridian", "circuitmindai", "multi-agent-graphrag", "the-game",
      "claim-setelDefects", "claim-monashRetrieval", "claim-leadThroughput",
    ]) {
      await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1);
    }
  });

  test("filters work with ?path=", async ({ page }) => {
    await page.goto("/?path=product");
    await expect(page.locator("#circuitmindai")).toBeVisible();
    await expect(page.locator("#faultline")).toHaveCount(0);
  });

  test("redirects legacy chess deep links", async ({ page }) => {
    await page.goto("/?move=d4");
    await expect(page).toHaveURL(/\/opening-preparation\?move=d4$/);
  });

  test("loads no engine assets", async ({ page }) => {
    const engine: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/engine/")) engine.push(r.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(engine).toEqual([]);
  });

  test("has no axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("does not overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("copies the email", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  });

  test("puts work before the board on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const order = await page.evaluate(() => {
      const work = document.getElementById("work")!;
      const board = document.getElementById("the-game")!;
      return work.compareDocumentPosition(board) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(order).toBeTruthy();
  });
});
```

- [ ] **Step 2: Quarantine the legacy tests that load the old home page**

List the candidates:

```bash
grep -n 'goto("/\(["?#]\)' e2e/document.spec.ts e2e/round-four.spec.ts e2e/round-five.spec.ts e2e/a11y.spec.ts
```

For every `test(...)` block that navigates to `/`, `/?…` or `/#…`, and to no other route:
1. Change `test(` to `test.skip(`.
2. Add this line directly above it: `// Replaced by e2e/site/home.spec.ts (rebuild Phase 1).`

Leave alone any tests that visit `/projects/*`, `/opening-preparation`, `/lab/*`, `/colophon`, `/print-edition`, `/admin*` or the 404 page. In `a11y.spec.ts`, skip only the entry for `/`.

- [ ] **Step 3: Run the full end-to-end suite**

Run: `npx playwright install chromium && npx playwright test`
Expected: all specs pass. The new home spec has 9 tests; skipped legacy tests are reported as skipped.

If a legacy test that doesn't load `/` fails, stop. Investigate whether Task 1 changed its behaviour before touching it.

- [ ] **Step 4: Commit and push the branch**

```bash
git add e2e
git commit -m "test(e2e): front-page spec; skip legacy home-page cases

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin HEAD:rebuild/analysis-board
```

Expected: the push succeeds as Mizore66, via `git@github-mizore66:Mizore66/portfolio.git`.

- [ ] **Step 5: Get the preview URL**

Run: `gh api repos/Mizore66/portfolio/deployments --jq '[.[] | select(.ref=="rebuild/analysis-board")][0] | {environment, created_at}'` for about 3 minutes. If the `gh` account lacks access, check the commit status on GitHub instead.

Report the Vercel preview URL to the owner, plus the three Phase 1 review points:
- the About text;
- the availability line;
- the contact heading.

---

## Self-review (done while writing)

- **Spec coverage for Phase 1:**
  - D15 (phone): Tasks 2, 6, 7.
  - D17 (featured): Task 4.
  - D19 (line): Task 5.
  - D20 and D21 (hero): Tasks 2, 7, 8.
  - D22 (tokens and fonts): Task 6.
  - D8 and D13 (education): Task 3.
  - D11 and D12 (MirrorFi and Teleportal credit): Task 4.
  - Brief §2.4–§2.5 (query behaviour and fragments): Tasks 7, 8.
  - §4.5 (JSON-LD escaping): Task 6.
  - §5.5 (a11y bars for `/`): Task 8.
- **Deferred to later phases on purpose:**
  - case-study pages (Phase 2); in this phase, links to `/projects/faultline` and `/projects/gemini-teleportal` hit the legacy route and 404;
  - the live engine and eval graph (Phase 3);
  - the PDF, colophon and 404 redesign (Phase 4);
  - redirects, CMS removal and CI (Phase 5).
- **Type consistency:** `getClaim`, `workFor`, `pathCounts`, `parsePath`, `featuredProjects`, `LINE_PLIES` and `StaticBoard({ plies, label })` are defined in Tasks 2, 4 and 5 and used as defined in Task 7.
