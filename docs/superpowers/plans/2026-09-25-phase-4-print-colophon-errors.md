# Phase 4: Print, colophon and errors — Implementation Plan

**Goal:** The résumé PDF, the colophon, the 404, the OG images and the icon in the new design, all generated from the content files.

**Spec:** `REBUILD_BRIEF.md` §4.2 (résumé PDF), §3.7 (`/print-edition`, `/colophon`, 404), §2.3 (OG images, icon), §3.8 (media), Appendix C item 5 (404 canonical, stray favicon).

## Decisions taken without the owner (review list)

1. **PDF library.** The legacy generator writes Helvetica and strips every non-ASCII character, so "−", "→", "±" and "é" cannot render (§4.2). It is replaced with **PDFKit** (server-only runtime dependency): embedded, subset Schibsted Grotesk (static Regular and SemiBold instances cut from the OFL variable font), tagged structure tree, `Lang en-GB`, title shown in the viewer, selectable text, link annotations. `pdfjs-dist` is added as a dev dependency so tests read the PDF the way an ATS would.
2. **Résumé bullets** for Deriv, Skribble Lab and Monash are §3.3 verbatim (with their numbers); every number is in the claims ledger. Projects: FaultLine and Gemini Teleportal.
3. **ETag** is a hash of the PDF bytes, so it is stable for identical content.

## Tasks

1. `src/content/site/resume.ts` — the résumé as data from the content layer; invariant tests.
2. `src/lib/resume-pdf.ts` — PDFKit renderer for Letter and A4. Tests: one page in both sizes; text extracts with "−", "→", "±", "é"; tagged with headings; `Lang` en-GB; title "Anas Tarek Qumhiyeh — Résumé"; links present.
3. `src/app/print-edition/route.ts` — inline `application/pdf`, filename `Anas-Tarek-Qumhiyeh-resume.pdf`, `Cache-Control: no-store`, stable ETag, `?paper=a4`. Fonts traced into the function bundle.
4. `/colophon` in the new design: typefaces, colours, how content is published, what the tests check, the perft self-check (depth 1 = 20, 2 = 400, 3 = 8902) computed by the vendored engine. Legacy colophon route removed.
5. OG images: site default, `/opening-preparation` and `/lab/learned-evaluator`, drawn from content in the site palette. Icon redrawn; the stray `favicon.ico` removed.
6. Verification: unit tests, build, Playwright on a production build (PDF headers and bytes, colophon axe, 404 status and title, OG images return PNG).
