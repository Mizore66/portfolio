# Phase 5: polish, parity and final report

Status: **ready for the owner's final review.** Nothing is merged or deployed. The work is on `upgrade/motion-3d`, pushed with the owner's personal key. No pull request was opened, because the only GitHub CLI login on this machine is the work account. Open it from https://github.com/Mizore66/portfolio/compare/master...upgrade/motion-3d?expand=1.

## What changed in Phase 5

- **Instanced pieces (brief §7: six unique meshes, instanced).**
  - One instanced mesh per piece type and side, one for the bishops' mitre slits per side, and one for the felt pads.
  - The tween code keeps a pose per piece; one flush packs each type's live pieces into its mesh.
  - A promoting pawn stays a pawn until it lands.
  - The engine view's ID shader reads `instanceMatrix`, and the shader precompile uses the instanced variants.
  - Result on the prototype's three views: **29 draw calls per frame**, down from about 85 per view, still 120 fps.
- **Preview images for the new pages.** `/work`, `/about` and `/lab` set their own Open Graph metadata, which replaced the inherited image, so they had none. Each now has an `opengraph-image.tsx` drawn from existing copy, and the preview-image test covers them.
- **Palette parity.** The Open Graph images, the favicon and the colophon's swatches still used the old slate and violet. All three now use the Phase 1 palette.
- **Colophon.**
  - New stack: three.js, React Three Fiber, drei, GSAP, Lenis, Zustand.
  - Model provenance: the pieces are turned from profiles written in code and the mat is drawn in code. No third-party models, scans or textures, so no model licence to record.
  - The new WebGL-off and reduced-motion checks.
- **WebGL off has a test.** An e2e test stubs WebGL out and checks that every board stays a printed diagram, no canvas appears, no 3D code is fetched and nothing throws.
- **One flaky test fixed.** The engine test asserted a white pawn on h3 after h2–h3. The engine searches by time; under full-suite load a shallow search can answer ...Bxh3. It now checks that the pawn left h2 and that h3 holds the pawn or the capturing bishop.

## Definition of done (brief §12)

| Item | Status | Evidence |
|---|---|---|
| Every §1 "Must not regress" item verified | Done | Table below |
| Every effect maps to a chess concept; nothing from §5 | Done | Effects table below |
| Every §8 budget met, with numbers | Met, except lab LCP on mobile (as in the baseline) | §8 table below |
| Every §9 requirement met, tested with reduced motion, keyboard only and WebGL off | Done | §9 table below |
| Not recognisable as a template or a copy of a reference site | Done | Screenshots in `phase-4/` |
| `/colophon` updated | Done | Stack, provenance, palette, tests |

### §1 Must not regress

| Item | How it was checked | Result |
|---|---|---|
| Every route and anchor | `launch.spec.ts` loads every public route. `home.spec.ts` visits every legacy fragment on `/` and lands on its content. `/archive` 308, `/?path=` 307 | Pass |
| `/print-edition`, both paper sizes | `print.spec.ts`, and each PDF opened: one page each, Letter 612×792 and A4 595×842 | Pass |
| `?path=` filters | `/work?path=ml` in the public list; `/?path=ml` redirects to it | Pass |
| All copy, word for word | Every visible line of master's home (212 lines, JavaScript off) searched across `/`, `/work`, `/about` and `/lab` on the branch | 0 missing. Project, lab and scoresheet pages: only the old "Experience" nav label (now About) |
| Single source of truth | `boardData()` is built server-side from `GAME`, `CAREER_EVALS` and `careerPoints`; the 3D board, move list, pane and graph all read the store | Pass |
| "Show as a table" | `game.spec.ts` on `/about` | Pass |
| Engine loads only on user action | `game.spec.ts`: no engine request or worker until Start engine | Pass |
| Screen-reader position text | The analysis board's labelled grid and position label; `game.spec.ts` drives it by keyboard | Pass |
| Metadata, Open Graph, canonical URLs, structured data | Every new page has a title, description, canonical URL and preview image. `/about` adds `ProfilePage` to the site's `Person` graph | Pass |
| Server-rendered content | JavaScript-off test on `/` and `/about`; the move list, diagrams and every fact are in the HTML | Pass |

### Effects and their chess meaning (§2, §4); nothing from §5

| Effect | Chess concept |
|---|---|
| Opening replay (≤ 3 s, once per session, skipped by any input) | The game played from move 1 to the latest position |
| Candidate arrows on hover and focus | The candidate moves at that node of the game tree |
| Engine view as characters | The engine's picture of the position; its line drawn as arrows |
| Project open, takeback on return | Playing the move, then taking it back |
| Annotated section titles | The move number and move that title annotates |
| Margin notes | Annotator's notes in the margin |
| "Your move" ending | The unfinished game, White to move, the clock running |
| Chess cursor | A piece in hand over links that play moves |

§5 check: no glass, refraction or mesh gradients. No reveal on every section: only major titles and the two margin notes. No hover lift. No other custom cursor, no particles, grain overlays or preloader. Lenis only on desktop fine pointers, with native scroll otherwise. No sound.

### §8 Performance budget

Local production build, Lighthouse 12.8.2, Chrome for Testing 151 headless. Mobile uses Moto G Power emulation on slow 4G; desktop uses `--preset=desktop`. Median of 3.

| Route | Form | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|---|
| `/` | mobile | **93** | 100 | 100 | 100 | 3.09 s | 0.000 | 122 ms | 1.21 s |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.67 s | 0.000 | 0 ms | 0.33 s |
| `/work` | mobile | 92 | 100 | 100 | 100 | 3.38 s | 0.000 | 10 ms | 1.21 s |
| `/work` | desktop | 100 | 100 | 100 | 100 | 0.69 s | 0.001 | 0 ms | 0.33 s |
| `/about` | mobile | 94 | 100 | 100 | 100 | 3.08 s | 0.018 | 10 ms | 1.21 s |
| `/about` | desktop | 100 | 100 | 100 | 100 | 0.67 s | 0.000 | 0 ms | 0.33 s |
| `/lab` | mobile | 95 | 100 | 100 | 100 | 2.93 s | 0.013 | 10 ms | 1.21 s |
| `/lab` | desktop | 100 | 100 | 100 | 100 | 0.59 s | 0.000 | 0 ms | 0.33 s |
| `/projects/faultline` | mobile | **92** | 100 | 100 | 100 | 3.31 s | 0.000 | 12 ms | 1.21 s |
| `/projects/faultline` | desktop | 100 | 100 | 100 | 100 | 0.69 s | 0.000 | 0 ms | 0.33 s |

| Budget | Result |
|---|---|
| LCP ≤ 2.5 s; LCP element text or the static board image | Desktop 0.6–0.7 s everywhere. **Mobile 2.9–3.4 s in the lab**, as in the baseline (AUDIT.md §4: 2.71 s and 3.23 s modes on `/`); the delay is the framework's JavaScript under simulated throttling. The LCP element is always text or a screenshot, never the canvas. The owner's production run measured 2.1 s; the gate should be production PageSpeed plus field data |
| CLS ≤ 0.05 | 0.000–0.018 |
| INP ≤ 200 ms | Measured with Event Timing at 4× CPU slowdown. Desktop: worst 104 ms (72 ms while the 3D loads). Phone emulation: worst 168 ms while the 3D loads, 80 ms settled |
| Home initial JS ≤ +30 KB | 197.1 KB against master's 198.2 KB, measured the same way (scripts in the HTML, gzip 9): **−1.1 KB** |
| 3D assets ≤ 2.5 MB | No model, texture or environment files: pieces, mat and room light are generated in code. The lazy code (3D plus motion) is 303.9 KB gzipped, 1.08 MB decoded |
| 60 fps desktop, ≥ 45 fps mobile, degrade below | 120 fps on the M2 Pro with instancing. The governor steps shadows, then resolution, down after 2 s under 45 fps. Not measured on a physical Android phone |
| Lighthouse Performance ≥ 90, Accessibility = 100 | Every route, both form factors (table above) |

### §9 Accessibility

| Requirement | Check | Result |
|---|---|---|
| Reduced motion | Browser emulation: no Lenis, no running animations, no split titles, and a move-list click still updates the board (pieces swap instantly). e2e: nothing animates on its own | Pass |
| Canvas `aria-hidden`; everything it shows is in the DOM | The canvas is `aria-hidden`, has no pointer events and sits behind the content. The move list, position description and eval table are HTML | Pass |
| Keyboard | Tab reaches the move list; ← → step, Home and End jump; 3 px green focus ring | Pass |
| Contrast over any canvas region | No text is drawn over a board box; axe passes on every public page, including forced colours | Pass |
| WebGL off; JavaScript off | New e2e test (WebGL stubbed out); JavaScript-off test; Chrome launched with `--disable-webgl` on `/`, `/work`, `/about` and `/lab` showed diagrams, no canvas and no errors | Pass |

## Deviations from the brief, all phases

- **Pieces are procedural**: lathe-turned Staunton profiles written in code, not a glTF set. That followed the owner's standing default of no external model downloads. No `gltfjsx` or `gltf-transform` is needed, and there is no model licence to record.
- **No postprocessing.** The brief allowed at most a subtle depth of field or vignette; neither was needed.
- **A custom quality governor instead of drei's `PerformanceMonitor`.** `PerformanceMonitor` reads idle gaps in a demand loop as a low frame rate (Phase 2).
- **ScrollTrigger is not used.** The one-shot reveals start from an IntersectionObserver, and the scrubbed scoresheet is a CSS scroll-driven animation. This came from the Phase 4 budget work: ScrollTrigger's page-wide refresh was a long task on phones. GSAP's ticker still drives Lenis and every tween, so they share one clock.
- **`?at=` holds the home board state; `?move=` stays the scoresheet link** (AUDIT.md decision 1).
- **The hero board is the sticky pane, not full-bleed**, and there is no lens shift (Phase 4).

## Verification

- `npx vitest run`: 134/134.
- `npx playwright test` against the production build: 109/109.
- `npx tsc --noEmit` and ESLint on `src` and `e2e`: clean.

## For the owner

1. Open the pull request from the compare link above, then review its preview deployment.
2. After merging, run PageSpeed Insights on production for `/` and one project page. That is the LCP gate AUDIT.md recommends.
3. If you can, open `/lab/board-prototype?fps` on a mid-range Android phone and read the frame rate.
