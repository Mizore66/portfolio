# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Redesign in progress (branch `redesign-v3`)

- Follow `REDESIGN_BRIEF.md`. Stop at every gate and wait for the owner.
- Content lives in `content/content.json` and `content/voice.md`. Do not look at the v2 site code (git history or `master`); ask the owner instead.
- Unit tests: `npx vitest run` (the engine calls `python3` for some checks).
- Origin defaults to `https://anasqumhiyeh.dev` (`NEXT_PUBLIC_SITE_URL`).

## The chess engine

- The engine and its science are kept: `src/lib/chess/`, `native/`, `training/`, `matches/`, `public/engine/`.
- Do not retrain the NNUE net, run 50k matches, or delete PeSTO as routine work. See `training/GUARDS.md`.
