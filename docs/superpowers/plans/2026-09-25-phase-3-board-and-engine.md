# Phase 3: Board and engine — Implementation Plan

**Goal:** The chess becomes a working tool in the new design: the D19 line as content, a board you can play from the keyboard, an engine that starts only when asked, the career eval graph on the front page, and new `/opening-preparation` and `/lab/learned-evaluator` pages. The legacy chess routes go.

**Spec:** `REBUILD_BRIEF.md` §4.6 (engine requirements and owner guards), §7 B (layout, eval graph, chess rules), Appendix A (the line, ids, mapping, commentary, authored evals), Appendix B (lab text and required changes), §2.4–2.5 (`?move=`, fragments), §5.4–5.5 (performance and accessibility bars). The owner was away for this phase and asked for the whole product to be completed for review on return (2026-09-25).

## Owner guards (non-negotiable)

- The engine, search, evaluations, NNUE loader, WASM glue, weights and match receipts are **vendored unchanged**: `src/lib/chess/**`, `native/`, `public/engine/`, `training/`, `matches/`. No eval or search change, so no `sprt:` line is needed.
- No retraining, no 50,000-game matches, PeSTO stays.

## Decisions taken without the owner (review list)

1. **Eval graph values.** Appendix A gives authored evals only for the old positions. The graph plots the engine's own **static handcrafted evaluation** of each career position (White's view), computed from the vendored engine and verified by a unit test, and says so on the page. Authored evals stay as labelled annotation on `/opening-preparation`.
2. **Commentary for the new positions** (`c3`, `e5-push`, `d5`, `skribble-lab`, `teleportal`, `graduation`, `bb4-check`, `bd2`, `bxd2`, `deriv`, `faultline`, `outlook`) is drafted from §3 facts and marked `draft`. Existing commentary is Appendix A verbatim.
3. **ECO code** is not printed until confirmed (§0.2 item 6); the line is named by its Lichess name.
4. **Mobile eval strip:** a slim bar at the top edge that shows reading progress; tapping it goes to the board (`#the-game`) rather than opening a dialog, which keeps focus management simple and the facts readable.
5. **Lab disclosures** (Appendix B required changes 1–4) are written from the engine source (`NNUE_RESIDUAL = 60`) and the repo's guards, marked for owner confirmation. Match receipts are linked only as repo paths, not published (item 6 waits for the owner).

## Tasks

1. **Game content** — `src/content/site/game.ts`: every node (id, parent, UCI ply, SAN, move number, side, Informant symbol, kind, title, fact, commentary, authored eval, links, dates, draft flag). Mainline: start → … → 10…Bg4 → outlook. Variations: `alekhine`, `elephant`, `philidor` (not taken), `closed`, `bb6`, and the compact castled line `oo` → `oo-nf6` → `oo-d4` → `oo-exd4` → `re1`. Helpers: path, plies, side to move, mainline, children. Tests: all 17 legacy ids resolve; every ply legal under the vendored generator; the mainline SAN equals `LINE_SAN`; `?move=oo`/`re1` boards equal the old castled boards; career dates in order along the mainline; the eval-graph values equal the engine's output.
2. **Engine client** — `src/lib/game/`: one shared module worker (the vendored `search.worker.ts`), weights fetched only for Learned, jobs cancelled when the tab is hidden and resumed when visible, main thread never searches.
3. **Interactive board** — client component: SVG board, click or keyboard (arrows move a cursor, Enter/Space pick and drop, Esc cancels), legal moves only, engine reply after the visitor's move, promotion to queen, position as text for screen readers, reduced motion respected.
4. **Engine panel** — "Start engine" button, Handcrafted/Learned toggle, depth, nodes/second, PV, eval bar (pure black and white), status for loading and errors.
5. **Front page** — board pane becomes the live board at 10…Bg4 on request; career eval graph under the hero (real time on x, roles as spans, projects as points, links to their chapters that also set the board); mobile eval strip.
6. **`/opening-preparation`** — two panes: chapters (`#chapter-<id>`) with fact in roman and commentary in italic, authored eval labelled as annotation, the puzzle at `nf6`, closing lines, `#scoresheet` and `#lab`; board pane with move tree and engine. `?move=` selects and scrolls; per-position title.
7. **`/lab/learned-evaluator`** — Appendix B with the required changes, Elo-by-gate figure drawn from data, the board with the Handcrafted/Learned toggle, fragments `#hypothesis #experiment #result #failed #learned`, `Article` JSON-LD.
8. **Retire legacy chess routes** — delete `(legacy)/opening-preparation`, `(legacy)/lab`, their specs and legacy-only tests; point `/?move=` at the new ids. Remaining legacy components go in Phase 5 with the CMS.
9. **Verification** — unit tests, build, `e2e/site/game.spec.ts` (no engine assets before start, keyboard move with engine reply, worker pauses when hidden, every id resolves, axe, overflow, 44 px targets), Playwright against a production build, screenshots reviewed.
