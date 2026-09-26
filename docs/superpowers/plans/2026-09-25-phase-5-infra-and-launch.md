# Phase 5: Infrastructure and launch readiness — Implementation Plan

**Goal:** Everything the launch checklist (brief §5.6) needs that can be done in the repository: static redirects, a proxy reduced to its security job, the CMS and legacy code gone, sitemap and robots from content, safe cache headers, CI, analytics events, and an audit against §5.4–5.6. Nothing merges to `master`; the owner reviews first.

**Spec:** `REBUILD_BRIEF.md` §2.2 (redirects), §2.6 (sitemap, robots), §4.3 (analytics), §4.7 (security), §5.1–5.6, Appendix C.

## Owner-only steps (not done here, brief §5.1)

1. Download `/admin/export` once from production before this branch ships, to confirm no unpublished draft is lost.
2. Remove the CMS environment variables in Vercel and delete the Blob store and the Postgres database.
3. Confirm the `anas-tarek-qumhiyeh.vercel.app` production alias is the one to redirect (preview hosts are left alone).
4. Merge to `master` after review.

## Tasks

1. **Redirects** — `/about` → `/#about` and `/archive` → `/#work` (308) in `next.config.ts`; `www` and the production `*.vercel.app` alias → the apex in the proxy, path and query kept. Preview deployments keep working.
2. **Proxy** — only the per-request CSP nonce, security headers and host redirects. HTML carrying a nonce is `private, no-cache` so no shared cache ever serves a stale nonce (Appendix C item 1). Blob hosts leave the CSP.
3. **Remove the CMS and legacy code** — `(legacy)` route group, `/admin`, `/api/cms-health`, `src/lib/cms`, legacy components and content, their tests, AI-generated images and textures, CMS scripts; drop `@vercel/blob`, `postgres`, `hash-wasm` and any now-unused packages. `/admin` and `/api/cms-health` return 404. The vendored engine, weights, `training/`, `matches/` and `native/` stay.
4. **Sitemap and robots from content** — priorities per §2.6, lastmod from content dates; robots allows everything and points at the sitemap.
5. **Analytics (§1, §4.3)** — Vercel Web Analytics custom events: email click, copy email, résumé open, case-study open, engine start. One delegated listener, no per-link wiring.
6. **CI** — GitHub Actions on pull requests and pushes: lint, typecheck, unit tests, build, end-to-end tests against the production build.
7. **Audit** — §5.4 performance (Lighthouse if it runs here), §5.5 accessibility (axe on every public page, overflow at the listed viewports, front page height at 390 px, heading order, one header/main/footer, targets, forced colours), §5.6 checklist, JSON-LD shape, security headers; fix what fails.
8. **Owner review document** — `docs/superpowers/2026-09-25-owner-review.md`: every decision taken without the owner, every draft to rewrite, every open checklist item.
