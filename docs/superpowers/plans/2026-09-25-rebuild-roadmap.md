# Rebuild roadmap: Analysis board

**Spec:** `REBUILD_BRIEF.md` (repo root). Owner decisions D1–D23 are final.

The rebuild replaces the site route by route, using Next.js route groups:
- `src/app/(legacy)/` holds the current pages until each one is replaced.
- `src/app/(site)/` holds the new design.

Two routes can never resolve the same URL, so a route moves out of `(legacy)` in the same task that adds it to `(site)`.

Each phase ends with a green `npm test` and a green `npm run build`, pushed to branch `rebuild/analysis-board` so it gets a Vercel preview. Nothing merges to `master` (production) until the owner approves Phase 5.

| Phase | Deliverable | Detailed plan |
|---|---|---|
| **1. Foundation and front page** | Route-group split. A typed content layer for everything in brief §3, with invariant tests. The new design tokens and fonts, the site shell, and the front page at `/` with a static board pane. | `2026-09-25-phase-1-foundation-and-front-page.md` |
| 2. Case studies | `(site)/projects/[slug]` for all 9 projects plus the new post-April projects. It has full case-study sections, SVG architecture diagrams drawn from data, prev/next navigation, copy-link headings and per-project JSON-LD. The legacy `projects` route is deleted. | Written when Phase 1 lands |
| 3. Board and engine | The opening content moves to the D19 line and the confirmed mapping, with new ids, and `oo`/`re1` kept as a variation. It also delivers: the live board pane; the engine started on request only (weights and WASM loaded lazily, the Worker paused when the tab is hidden); keyboard move entry; the mobile eval-bar strip; the career eval graph; and the new `/opening-preparation` and `/lab/learned-evaluator` pages. The legacy chess UI is deleted. | Written when Phase 2 lands |
| 4. Print, colophon and errors | A new résumé PDF: embedded font, phone number, content matching the primary résumé, Letter and A4 sizes. Also the new `/colophon`, the 404 in the new design, OG images and the icon. | Written when Phase 3 lands |
| 5. Infra and launch | Static redirects: `/about`, `/archive`, and the `vercel.app` alias to the apex. The proxy is reduced to the CSP nonce and the www redirect. CMS, admin, `api/`, the Blob and Postgres deps and the legacy files are deleted. Sitemap and robots come from content, cache headers are fixed, and a CI workflow is added. The e2e, a11y and Lighthouse bars from brief §5.4–5.5 must pass, then the launch checklist (brief §5.6). | Written when Phase 4 lands |

## Owner review points

These are marked **[dev]** in the brief. Raise them when their phase starts.
- **Phase 1:** the About text (drafted from the résumé; the owner rewrites it), the availability line, and the contact heading.
- **Phase 2:** the case-study sections for FaultLine, Gemini Teleportal and the new projects. Which of `propdesk`, `market-sentinel`, `Economy-News-Pipeline` and `RexCheck` get pages. The proposed hedging cuts (brief §3.9 item 6).
- **Phase 3:** commentary for each new chess position. The ECO code for the D19 line.
- **Phase 5:** CMS decommissioning (brief §5.1). Only the owner does this.
