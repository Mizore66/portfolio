# Owner review — rebuild/analysis-board

Everything on this branch was built without the owner in the room. This page lists every decision taken on your behalf, every piece of text that is a draft in your voice, and every launch-checklist item that only you can close. Nothing here has been merged to `master`.

## 1. How to review

- **Preview:** each push to `rebuild/analysis-board` deploys a Vercel preview. Previews sit behind Vercel Deployment Protection, so open them while signed in to Vercel.
- **Check locally:** run `npm ci`, then `npm run dev`. Tests are `npm test` (133 unit) and `npx playwright test` (88 end-to-end, including axe on every public page).
- **CI:** `.github/workflows/ci.yml` runs lint, typecheck, unit tests, build, and end-to-end tests against the production build. It runs on every push to this branch and on pull requests.

## 2. Text to rewrite in your voice

Everything below is marked `draft` in the content files, or was written to fill a gap in the brief. Search for `draft: true` to find it all.

| Where | What | File |
|---|---|---|
| Case study: FaultLine | Problem, decision, constraint, example, rejected, built, limitations, change-now | `src/content/site/projects.ts` |
| Case study: Gemini Teleportal | Same sections | `src/content/site/projects.ts` |
| Case study: RexCheck | The whole page, written from the repo on 2026-09-26 | `src/content/site/projects.ts` |
| Game commentary | c3, d4 (edited), e5-push, d5, skribble-lab, teleportal, graduation, bb4-check, bd2, bxd2, deriv, faultline | `src/content/site/game.ts` |
| Game commentary, 5.O-O side line | oo-nf6, oo-d4, oo-exd4, re1 | `src/content/site/game.ts` |
| About | The paragraph is assembled from the brief's facts. It needs a read in your own voice. | `src/content/site/identity.ts` |
| Contact | The heading, and an availability line that repeats "AI Engineer at Deriv" from the hero | `src/content/site/identity.ts` |
| Lab article | The ±60 disclosure wording, and the list of causes. Receipts and facts that exist only in the repo are left out on purpose. | `src/content/site/lab.ts` |

## 3. Decisions taken on your behalf

### Content and claims

- **FaultLine "1–3 h saved".** Confirmed by the owner (2026-09-26): measured when FaultLine was tested on other repositories as well as its own. Kept as a controlled evaluation.
  - The FaultLine repo's docs have not caught up: `docs/impact-validation-codex-self-dogfood.md` still says "Time saved / adoption: not measured". Record those runs there so a reviewer who checks the repo finds the evidence.
- **FaultLine language.** The Go rewrite is PR #205 in the FaultLine repo. The site already describes it; that becomes true once the PR merges.
- **Which projects get pages.** Answered: RexCheck only. The others were job assessments. RexCheck is now an archive case study (ML / data systems), evidence type Capability, marked draft.
- **Hedging cuts.** Where the brief asked for hedges to be cut, I cut by leaving the hedge out rather than rewording it.

### The game

- **5…d6 is marked "?".** Confirmed by the owner.
- **ECO code (§0.2 item 6).** C54, checked against the Lichess opening database (`c.tsv` lists this exact line through 8…Bb4+). It is printed beside the line name.
- **Eval graph.** The graph plots the engine's own evaluation (handcrafted, 6,000 nodes, deterministic), not evaluations you wrote by hand.
- **Mobile strip.** It links to `#the-game` rather than opening a dialog, so there is no dialog to trap focus.
- **Board squares on phones.** They are about 40 px, under the 44 px target, because eight squares have to fit a 320 px screen. Every square is also reachable with the arrow keys.
- **Visitor moves.** Their notation has no check or mate marks.

### Engineering

- **Résumé PDF.** It is generated at request time with PDFKit (a new dependency), using static Schibsted Grotesk TTF files cut from the variable font. The ETag format is `"resume-<first 32 hex of sha256>"`.
  - **Not verified on Vercel from here, because of preview protection.** Open `/print-edition` and `/print-edition?paper=a4` on the preview once. The file trace does include PDFKit's data files and the fonts.
- **Chess font.** Noto Sans Symbols 2 is now self-hosted, cut down to the twelve piece glyphs: 3 KB instead of a 235 KB preload. Commit Mono is no longer preloaded.
- **Save-Data.** When the request says `Save-Data: on`, the front page leaves out the decorative project thumbnails. Case-study screenshots still load, because they are content.
- **404 title.** It keeps the old "Correction" wording: "Correction · Anas Qumhiyeh".
- **Analytics.** Vercel Web Analytics sends five custom events: `email_click`, `copy_email`, `resume_open` (with `paper`), `case_study_open` (with `slug`) and `engine_start`.

## 4. Performance and accessibility

**Owner's run, 2026-09-26** (Lighthouse 13.4.1, emulated Moto G Power, slow 4G, on a Vercel preview):
- Performance 100, Accessibility 100, Best practices 100.
- LCP 1.7 s, TBT 10 ms, CLS 0. That meets the 2.5 s mobile LCP target.
- SEO scored 66 only because Vercel sends `x-robots-tag: noindex` on preview URLs. Production sends no such header, and `robots.txt` allows everything.

**Earlier local runs** (production build, Lighthouse 12):

| Page | Mobile perf | Mobile LCP | Desktop perf | A11y / BP / SEO |
|---|---|---|---|---|
| `/` | 95–99 | 2.1–2.8 s | 100 | 100 / 100 / 100 |
| `/projects/faultline` | 92 | 3.1–3.3 s | 100 | 100 / 100 / 100 |
| `/opening-preparation` | 92–96 | 2.4–3.2 s | 100 | 100 / 100 / 100 |
| `/lab/learned-evaluator` | 97 | 2.3 s | 100 | 100 / 100 / 100 |
| `/colophon` | 98 | 2.3 s | 100 | 100 / 100 / 100 |

The numbers vary from run to run on a shared container. The 2.5 s mobile LCP target is met on some pages and some runs, but not all. What remains is render delay on the hero text, which is waiting on the Schibsted Grotesk swap. Run Lighthouse against production after the merge; that is the run the bar is measured on.

The §5.5 checks are automated in `e2e/site/launch.spec.ts`. They cover:
- axe, landmarks and heading order on every public page;
- overflow from 320 to 1920 px and at the zoomed viewports;
- a front page under 14,000 px tall at 390 px wide;
- sticky chrome at 12% of the screen or less;
- touch targets;
- forced colours;
- reduced motion;
- Save-Data;
- no-JS and no-CSS reading.

## 5. Launch checklist (§5.6)

| Item | Status |
|---|---|
| Every §0.2 item confirmed or defaulted | Done (ECO C54) |
| Hero statement, no metrics strip (D20, D21) | Done |
| §2.1 URLs return 200; §2.2 redirects | Done (e2e) |
| `/admin`, `/api/cms-health` and unknown paths return 404 | Done (e2e) |
| §2.5 fragment ids land | Done (e2e) |
| §3 items present, §3.9 fixes applied, no AI images | Done, apart from the drafts in section 2 |
| Résumé PDF passes §4.2 in both paper sizes | Done. Unit tests read the PDF back, and both sizes are served in production. |
| §4.4 content invariants | Done (unit) |
| JSON-LD validates in a structured-data tester | Done. The Rich Results Test reports no errors. It detects no rich results because Person, WebSite and SoftwareSourceCode are not Google rich-result types. |
| §4.7 headers on live responses | Done. securityheaders.com grades production A+. |
| Engine playable, starts on request, keyboard | Done (e2e and a manual browser check) |
| Chess line reaches Skribble Lab and Deriv; legal moves | Done (unit tests replay every move through the engine) |
| FaultLine repo shows the Go rewrite | **Owner:** merge PR #205 in the FaultLine repo |
| Phone number in Contact, PDF and JSON-LD | Done |
| §5.4 and §5.5 bars on production | Done. See section 4. |
| Analytics events fire | Wired up. **Owner:** confirm they appear in the Vercel dashboard. |
| CMS decommissioned (§5.1) | Done by the owner (2026-09-26) |

## 6. Owner-only steps, in order

1. ~~Export the CMS.~~ Skipped at the owner's call (2026-09-26): the rebuild replaces everything the CMS held.
2. ~~Merge `rebuild/analysis-board` into `master`.~~ Done by Claude at the owner's request (2026-09-26).
3. Rewrite the drafts in section 2 when you have time.
4. ~~Clean up Vercel (CMS variables, Blob store, Postgres).~~ Done by the owner (2026-09-26).
5. ~~Run Lighthouse, the Rich Results Test and a header check.~~ Done (2026-09-26); see sections 4 and 5.
6. Merge FaultLine PR #205 (the Go rewrite).
7. Confirm the analytics events in Vercel → Analytics → Events.
