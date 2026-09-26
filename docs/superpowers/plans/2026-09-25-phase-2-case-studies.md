# Phase 2: Case studies — Implementation Plan

**Goal:** Replace the legacy `/projects/[slug]` route with case studies in the Analysis-board design, drawn from the typed content layer, with real screenshots where the owner has supplied them.

**Spec:** `REBUILD_BRIEF.md` §3.4 (content and section order), §3.7 (what a project page carries), §2.5 (fragment ids), §3.8 (media), §4.5 (SEO and JSON-LD), §5.5 (accessibility bar). Roadmap: `2026-09-25-rebuild-roadmap.md`.

**Inputs from the owner (2026-09-25):** five screenshots — Gemini Teleportal sign-in and live session (phone), the FaultLine proof page, a Codex session driving FaultLine, and the CircuitMindAI inspection UI. The owner asked to start Phase 2 immediately.

## Global constraints

Everything in Phase 1's Global Constraints still applies (tokens, typefaces, roman is fact / italic is voice, en-GB, 44 px targets on mobile, no engine assets outside the chess pages, JSON-LD escapes `<`). In addition:

- **Section order (§3.4):** result and evidence → problem → decision → constraint → example → considered / rejected → architecture → what was built → limitations → what I would change now → links. A section with no content is omitted, never padded.
- **Fragment ids (§2.5):** `#measurement` (result and evidence), `#problem`, `#decision`, `#constraint`, `#example`, `#rejected`, `#apparatus` (architecture), `#line` (what was built), `#limitations`, `#retrospective` (what I would change now), plus `#links`.
- **Every existing project URL keeps resolving** (§2.1). Unknown slugs return HTTP 404.
- **Must-appear lines:**
  - Gemini Teleportal: "Built together with Kai; the repository is under his account." (D12)
  - Multi-Agent GraphRAG: the +45% / +35% clarification (`RETRIEVAL_SPLIT`).
  - SLM Distillation Engine: the −50% latency belongs to the Monash contract, not this project.
  - MirrorFi: team of 6 and Anas's part only; no auto-rebalancing, no "architecture, implementation, and demo" (D11).
- **Cut lines (§3.9 item 6):** none of the listed hedging phrases appear, including "No live host…".
- **Drafts:** FaultLine and Gemini Teleportal case-study sections are `[dev]` in the brief. Drafts are written only from the brief and the public repos, and are marked `draft: true` in content for owner review.

## File structure

```
src/content/site/
  types.ts          ← CaseStudy, Architecture, Media types on Project
  projects.ts       ← case-study content, architecture data, media for all 9 projects
  index.ts          ← projectBySlug, adjacentProjects, projectClaims
  schema.ts         ← projectSchema (SoftwareSourceCode | CreativeWork)
  projects.test.ts  ← invariants for the above
src/components/site/
  ArchitectureDiagram.tsx   ← server SVG from data + HTML list fallback
  CopyLinkButton.tsx        ← client: copies the section URL
  CaseSection.tsx           ← h2 with copy-link control
  ProjectMedia.tsx          ← next/image figures
  ProjectCard.tsx           ← + screenshot on featured entries
src/app/(site)/projects/[slug]/
  page.tsx  opengraph-image.tsx
src/app/(legacy)/projects/   ← deleted
src/app/sitemap.ts           ← project entries from PROJECTS
public/work/<slug>/*.webp    ← owner screenshots, resized
e2e/site/project.spec.ts
```

## Tasks

1. **Content.** Extend `Project` with `caseStudy` (`evidence` claim ids, `problem`, `decision`, `constraint`, `example`, `rejected`, `built`, `limitations`, `changeNow`, `notes`, `draft`), `architecture` (`host`, `path`, `branches`, `beside`) and `media`. Fill from §3.4 verbatim where the brief gives text. Tests: every project has a case study; evidence ids exist; must-appear lines present; cut lines absent; SLM never shows 50%; media files exist on disk with alt text.
2. **Media.** Resize the owner's screenshots to at most 1600 px wide WebP (phone shots at most 720 px wide), stored under `public/work/<slug>/`. Width and height recorded in content so layout never shifts.
3. **Components.** `ArchitectureDiagram` lays out the main path left to right with arrows, branches below their source node, "beside the path" nodes dashed, and the host as an enclosing frame. Below 640 px the SVG is hidden and the same data shows as an ordered list; the SVG is `aria-hidden` and the list carries the semantics at every width. `CopyLinkButton` copies `origin + pathname + #id` and announces "Link copied".
4. **Page.** `generateStaticParams` from `PROJECTS`; `dynamicParams = false`. Breadcrumb Home / Work / Name; the back link keeps a valid `?path=`. Header: origin · date · category, name, subtitle, purpose, tech, source link. Sections in order. Previous / next project in `PROJECTS` order. Metadata: `seo.title`, `seo.description`, canonical, OG type `article`. JSON-LD per §4.5.
5. **OG image.** `opengraph-image.tsx` renders name, subtitle and "Anas Qumhiyeh" in the site palette. No hard-coded year.
6. **Retire the legacy route.** Delete `src/app/(legacy)/projects/`; point `integrity.test.ts`'s drop-cap check at the new page; sitemap project entries from `PROJECTS`.
7. **Front page.** Featured entries show their first screenshot, lazy-loaded, with explicit dimensions.
8. **Verification.** `npm test`, `npm run build`, `e2e/site/project.spec.ts` (every slug 200, unknown slug 404, fragment ids, back link keeps `?path`, prev/next, copy link, axe, 320 px overflow, 44 px targets) and legacy e2e cases that asserted legacy project DOM are skipped with the Phase 1 comment. Playwright run against a production build.

## Owner review points (raise with the preview)

- FaultLine and Gemini Teleportal case-study drafts.
- FaultLine is presented as Go per D16, but `Mizore66/faultline` `main` is still TypeScript (last commit 2026-07-21). The brief makes this a pre-launch check.
- FaultLine's own `docs/differentiation.md` says time-saved claims need external validation; the brief's "1–3 h saved" claim should be reviewed under D5.
- Which of `propdesk`, `market-sentinel`, `Economy-News-Pipeline`, `RexCheck` get pages (not built in this phase).
- The proposed hedging cuts (§3.9 item 6) are applied by omission; confirm.
