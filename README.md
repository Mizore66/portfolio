# Opening Preparation

A recruiter-first portfolio: an annotated Italian Game mapped onto a career, not a chess puzzle. Moves are facts. Annotations are voice. Chess is the content, never a lock.

This is the public scoresheet of [Anas Tarek Qumhiyeh](https://github.com/Mizore66) — software engineer, MLOps and full-stack.

## What you are looking at

One newspaper. The masthead is the name. The repertoire tree and the sticky board sit on the front. Every node in the opening is a chapter in the scoresheet: a job or a project, written as Informant notes. The glass case on the right is a live search — mailbox-64 alpha-beta, PeSTO evaluation, labelled **2200** because that is club strength, not a published Elo.

Two doors, always: the article is first-class (and the only door under 980px). The tree is desktop. Click any move. `←` `→` steps the mainline.

## The engine's receipt

The move generator is tested against start-position perft, which the colophon also prints:

| depth | nodes |
| ---: | ---: |
| 1 | 20 |
| 2 | 400 |
| 3 | 8902 |

There is no learned-eval exhibit yet. Phase 2 (NNUE inference, SPRT match harness) ships behind flags: PeSTO is never deleted, Gate A is the handcrafted-vs-handcrafted sanity match, and the site toggle/chart wait on a measured delta. The 2200 on the glass is an estimate of playing strength, not a leaderboard. Run `npx tsx src/lib/chess/match/cli.ts --suite mini --nodes 48` for a tiny self-play.

## How to run it

```bash
npm install
npm run dev
```

```bash
npx vitest run
npx eslint src e2e --max-warnings=0
npx playwright test
npm run build
```

Print edition: `GET /print-edition` — a typeset one-pager whose diagram is occupancy-tested as 5. d4 of the Italian, not the starting position.

## Production

The live origin is `NEXT_PUBLIC_SITE_URL` (default `https://anasqumhiyeh.dev`). That host is the masthead dateline. `/sitemap.xml` and `/robots.txt` are generated from it; the OG image is `/opengraph-image`. Analytics are `@vercel/analytics` — no cookies, no recruiter-identifying payload.

Deploy on Vercel. Add `anasqumhiyeh.dev` (and `www` if you want it) under the project’s Domains, then enter the A/CNAME records Vercel shows at the registrar. After go-live: Lighthouse + axe on the real URL, then a pass on an actual phone. Retrain stays behind `training/GUARDS.md` and does not block launch. The five-stranger protocol (watch, don't coach) is the next copy review, not this repo.

## What this is not

- Not a puzzle lock. You can read every fact without moving a piece.
- Not invented product screenshots. Plates are theatrical file photos until a real capture exists.
- Not a template. Type is Libre Baskerville, Lora, and IBM Plex Mono on cream `#f6eedc` with ink `#1a120c`. Radius 0.

Copy lives in `src/content/opening.ts`. Renderers do not hardcode ids or sentences.
