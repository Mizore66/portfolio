# Porting a Lab chapter scene (Phase 5, step 4c)

You are porting one approved key-frame scene into the site as a TypeScript module. Repo: this checkout, branch `redesign-v3`.

## Rules (non-negotiable)

- Write only the file(s) you are assigned (`src/components/lab/chN.ts`). Do not edit any other file, do not commit, do not run the dev server or `npm run build`.
- Do not look at the v2 site (master or git history).
- Do not retrain anything or touch `training/`, `matches/`, `native/`, `public/engine/`.
- No em dashes in comments or strings; use commas or colons.

## What to read

- The interface and helpers: `src/components/lab/kit.ts` (Chapter, ChapterFactory, stage, frame, size, toScreen, compile, disposeStage, span, arrive, share).
- The reference implementation to copy the shape of: `src/components/lab/ch1.ts`.
- Your key frames, desktop and phone: `design/keyframes/lab2-N.html` and `design/keyframes/lab2-N-m.html` (chapter 5 has `lab2-5a` and `lab2-5b`, its start and end). Their shared helpers are in `design/keyframes/_shared/` (`chess3d.js`, `many.js`, `match.js`, `sculptures.js`, `rng.js`).
- The motion for your chapter: `design/motion.md` §11 (the table) and, for chapter 5, `design/motion/gatec.html`.
- Site 3D library to use instead of the key-frame kit: `src/lib/three/pieces.ts` (`piece`, `MAT`, `sq`), `src/lib/three/sculptures.ts` (`learnedKnight`, `disposeScene`), `src/lib/three/board.ts` (`board`, `position`, `squares`).
- Data: `src/content/lab-data.json` and `src/content/openings.json` (copies of the key frames' `_shared/lab-data.json` and `_shared/openings.json`).

## What to build

`export const chapterN: ChapterFactory = (day, night, o) => { ... }`, returning a `Chapter`:

1. **The scenes:** the key frame's day scene on `day` and its night scene on `night` (when the key frame uses `twin`). `night` may be null for chapters with one side (3 and 6); then build only `day`. Match the key frame exactly: lights, materials, colours, fog, shadow settings, geometry and camera. Take the cameras from the key frames as `Frame`s: `pos`, `look`, `fov`, and `off` = the setViewOffset fractions (the key frame's `setViewOffset(W, H, a*W, b*H, W, H)` gives `off: [a, b]`). Use the `-m` key frame's camera when `o.phone`.
2. **`progress(p)`:** the scrubbed motion from motion.md §11, over p 0..1. The end state (p = 1) must be exactly the key frame. When `o.reduced`, always show p = 1.
3. **`seam(p)`:** the white share the chapter wants at p (motion.md §11's Seam column; chapter 3 is all white = 1, chapter 6 is all gallery black = 0).
4. **`tags()`:** the key frame's in-scene labels as `Tag`s (css px within the frame via `toScreen`), shown only once their object is in place. Keep their html text exactly as the key frame has it; any copy must be passed as-is (the page adds no copy of its own for tags). Use `cls` for the key frame's tag classes (`r`, `p`).
5. **`render()`** waits for `compile(...)`, re-frames, and renders both sides. **`resize()`** re-frames. **`dispose()`** frees both stages after compile.

Performance: prefer InstancedMesh as the key frames do; build geometry once; the page renders only on scroll.

## When done

Run `npx tsc --noEmit -p .` and `npx eslint src/components/lab` and fix every error in your file. Report back: the file(s), what `progress` does at which p, the `seam(p)`, anything in the key frame you could not reproduce, and any copy you had to hard-code (list it).
