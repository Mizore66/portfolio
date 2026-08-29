# Opening Preparation

A recruiter-first portfolio: an annotated Italian Game mapped onto a career, not a chess puzzle. Moves are facts. Annotations are voice. Chess is the content, never a lock.

This is the public scoresheet of [Anas Tarek Qumhiyeh](https://github.com/Mizore66) — software engineer, MLOps and full-stack.

## What you are looking at

One newspaper. The masthead is the name. The repertoire tree and the sticky board sit on the front. Every node in the opening is a chapter in the scoresheet: a job or a project, written as Informant notes. The glass case on the right is a live search — mailbox-64 alpha-beta, LEARNED by default (PeSTO is a comparison toggle), running off the main thread. The shipped net is `nnue-lichess-cc0-768x2x256-32-1-2026-08-29`. The 2200 on that case is club strength, not a published Elo.

Two doors, always: the article is first-class (and the only door under 980px). The tree is desktop. Click any move. `←` `→` steps the mainline.

## The engine's receipt

The move generator is tested against start-position perft, which the colophon also prints:

| depth | nodes |
| ---: | ---: |
| 1 | 20 |
| 2 | 400 |
| 3 | 8902 |

The learned exhibit is on the paper. LEARNED is the playing eval; PeSTO is a comparison toggle. The net is `nnue-lichess-cc0-768x2x256-32-1-2026-08-29` (20M quiet CC0, min_depth 12, hold-out r vs Stockfish **0.64**, r vs PeSTO 0.70). Gate A at 50 000 nodes/move was 0.0 Elo (handcrafted vs itself). Gate C, same cap, 100 games, colours swapped:

`fixed-N: −143.1 ±40.5 Elo @ 50000 nodes, 100 games, LLR −2.33 (inconclusive; SPRT unterminated)`

That is not a terminated SPRT. Deltas are rigorous; the 2200 is an anchor, not a CCRL listing. See `training/GUARDS.md`. Run `npx tsx src/lib/chess/match/cli.ts --suite mini --nodes 48` for a tiny self-play.

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

Deploy on Vercel. The domain is registered at **Porkbun** — do not transfer it. In Vercel: project → Settings → Domains → Add `anasqumhiyeh.dev` (accept the `www` prompt). Then in Porkbun → domain → DNS:

| Type | Host | Answer |
| --- | --- | --- |
| A | (blank) | `76.76.21.21` (or the IP on the Vercel domain card) |
| CNAME | `www` | the CNAME Vercel shows (often `cname.vercel-dns.com`) |

Delete Porkbun’s parking ALIAS (pixie.porkbun.com) and any leftover `www` CNAME first, or the new records will collide. Leave MX alone if you use Porkbun email. After DNS is Valid, the paper is https://anasqumhiyeh.dev. Then Lighthouse + axe on that URL, then a pass on an actual phone. Retrain stays behind `training/GUARDS.md` and does not block launch. The five-stranger protocol (watch, don't coach) is the next copy review, not this repo.

## What this is not

- Not a puzzle lock. You can read every fact without moving a piece.
- Not invented product screenshots. Plates are theatrical file photos until a real capture exists.
- Not a template. Type is Libre Baskerville, Lora, and IBM Plex Mono on cream `#f6eedc` with ink `#1a120c`. Radius 0.

Copy lives in `src/content/opening.ts`. Renderers do not hardcode ids or sentences.
