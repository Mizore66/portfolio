# Opening Preparation

A recruiter-first portfolio: an annotated Italian Game mapped onto a life, not a chess puzzle. Moves are facts. Annotations are voice. Chess is the content, never a lock.

This is the public scoresheet of [Anas Tarek Qumhiyeh](https://github.com/Mizore66) — software engineer, MLOps and full-stack.

## What you are looking at

One newspaper. The masthead is the name. The repertoire tree and the sticky board sit on the front. Every node in the opening is a chapter in the scoresheet: a job, a project, or a life branch, written as Informant notes. The glass case on the right is a live search — mailbox-64 alpha-beta, PeSTO evaluation, labelled **2200** because that is club strength, not a published Elo.

Two doors, always: the article is first-class (and the only door under 980px). The tree is desktop. Click any move. `←` `→` steps the mainline.

## The engine's receipt

The move generator is tested against start-position perft, which the colophon also prints:

| depth | nodes |
| ---: | ---: |
| 1 | 20 |
| 2 | 400 |
| 3 | 8902 |

There is no NNUE, no SPRT, no Elo-over-commits chart yet. Those claims will wait until they have a measured delta. The 2200 on the glass is an estimate of playing strength, not a leaderboard.

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

## What this is not

- Not a puzzle lock. You can read every fact without moving a piece.
- Not invented product screenshots. Plates are theatrical file photos until a real capture exists.
- Not a template. Type is Libre Baskerville, Lora, and IBM Plex Mono on cream `#f6eedc` with ink `#1a120c`. Radius 0.

Copy lives in `src/content/opening.ts`. Renderers do not hardcode ids or sentences.
