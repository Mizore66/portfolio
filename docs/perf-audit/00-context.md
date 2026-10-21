# Performance audit: shared context (2026-10-19)

**Owner's complaint:** the site is janky on the first pass through. There are micro lag spikes all through the first scroll down the one page (`/`). Only the first impression matters; later scrolls do not. The reference for "seamless" is https://laian.dev. Earlier fixes felt like duct tape; the owner wants a root-cause audit.

## Stack

- Next 16.2.4 (Turbopack), React 19.2, three 0.180, gsap 3.15, lenis 1.3, zustand.
- This Next version has breaking changes; read `node_modules/next/dist/docs/` before claiming anything about Next APIs.
- The one page is `src/app/page.tsx`: Hero, RolesIndex, WorkIndex, Others (the "sideboard"), Lab (section), Contact. `/lab` is a longer page with 7 chapters.
- Every section has its own full-screen WebGL canvas. Hero has two (day and night); Lab chapters have one or two each.
- Scene lifecycle code is in `src/lib/three/`:
  - `env.ts`: renderer factory with a 14-context cap.
  - `steps.ts`: sliced builds.
  - `warm.ts`: one-pixel shader warm passes.
  - `keep.ts`: canvases kept across navigation, and the "sleeper" that shrinks off-screen canvases to 1×1 and resizes them back when near.
- Build-ahead and arrival triggers: `src/lib/motion/firstView.ts`.
- Perf tooling: `src/lib/perf/trace.ts` holds an event log, exposed as `window.__trace` when the URL has `?fps`. `src/components/shell/FrameMeter.tsx` is the frame readout. `scripts/walk.mjs` is a full-site walk.

## Measured so far

Headless Chromium through Playwright, `--use-angle=metal`, 1728×996 at deviceScaleFactor 2, on an M2 Pro.

1. **First load.** The hero opening locks scroll for about 8 s. `buildAhead` defers every other scene's build until the opening ends. A visitor who scrolls right away then hits sliced builds, warm passes and `staged.now()` finishing a build synchronously. The result is 300–350 ms freezes labelled "roles: built".
2. **Steady first scroll**, after everything is built and idle 25 s. One pass down `/` gives about 45–50 frames over 33 ms and 10–18 over 50 ms. The second and later passes give 1–2 frames over 33 ms. laian.dev gives about 6 frames over 33 ms per pass.
   - The slow frames line up with arrival animations: gsap timelines that call `render()` every frame for about 1.6 s as each section first enters view.
   - Draw calls per frame: Roles hall about 120, Work gallery about 135, Others sideboard about 1,140. laian.dev is about 20.
   - JS inside the slow frames is only 2–5 ms, while the frames take 33–58 ms. So the cost is GPU or compositor, not script.
3. **Resolution.** The pixel ratio is 2, so each full-screen canvas is 3456×1992 = 6.9 MP. Capping at 1.5 cut frames over 33 ms by about 25–40%. It did not cure the stutter.
   - Freezing shadow-map updates barely helped.
   - `transmissionResolutionScale` 0.5 helped a little. The sideboard has transmission glass: `src/lib/three/sculptures.ts`, `SMAT.glass` and `blackGlass`.
4. **Resizing a WebGL canvas** (`setPixelRatio`, `setSize`, or the sleeper waking a 1×1 canvas) blocks the main thread for 80–230 ms, waiting on the GPU. This showed in CPU profiles as self time in `setSize`. So sleep/wake and any dynamic-resolution switching cause single long frames.
5. **Lighthouse**, owner's run on `/#lab`, with Chrome extensions on so the numbers are inflated. Text is in `docs/perf-audit/lighthouse-docs.txt`.
   - Performance 72, TBT 600 ms, 20 long tasks.
   - Script evaluation 3.8 s. Most of it is in chunk `.next/static/chunks/02zumrqfxzwqt.js` (346 KB, starts with three's WebGLRenderer code) at 3,026 ms.
   - Unused JS 574 KiB, forced reflows, and the italic font (132 KiB) on the critical chain.
6. **Rejected experiments** are saved in `docs/perf-audit/experiments-a4f2.patch`. `src/` is clean (as committed) and a production build of it is served at http://localhost:3100.

## Rules for every auditor

- **Read-only on `src/`.** Do not edit app code. Write your report to the file named in your task, under `docs/perf-audit/`.
- **Only the runtime-trace auditor may drive a browser against :3100.** Concurrent GPU measurements corrupt each other's numbers.
- **Do not run `next build` or `next dev`**, and do not stop the :3100 server.
- **Back every claim with evidence:** file:line, a measured number, or a cited doc. Mark anything unmeasured as a hypothesis.
- **Rank fixes by impact on the first-pass experience.** Give each fix its effort and any visual cost. The owner cares about visual fidelity (near-photoreal 3D), so flag anything that changes the look.
- **No band-aids.** If the architecture is the problem, say so plainly.
