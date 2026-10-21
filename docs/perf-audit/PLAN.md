# First-pass smoothness: plan, ranked by the runtime trace (2026-10-20)

Sources: 01-runtime-trace (measured on an idle GPU, medians of 3 runs, M2 Pro at 120 Hz), plus the static audits 02–05.

## What the trace showed

- **Waiting 25 s, then scrolling:** about 1 frame over 33 ms per pass. The earlier count of 45–50 was measured while other jobs held the GPU (llama-servers, `patch.py`), and it does not reproduce.
- **Scrolling the moment the opening ends** (what a visitor does): 11 frames over 33 ms, 4 over 50 ms, worst 133–176 ms. **81% of the over-budget time is the build pipeline**, and it accounts for every frame over 50 ms.
- **Lenis turns these stalls into a frozen page.** laian.dev has GPU stalls too, but native scroll keeps moving through them.
- **Not frame-limiting:** hall and gallery arrival redraws, the hero idle bob, Play's `place()` resize, Lab `setTags`, seam style recalc, compositor and raster.

## Order

1. [ ] **One build queue.** No synchronous finish (`staged.now()`). Builds and warm-ups run while the opening holds the scroll. No Play WebGL context created mid-scroll (`Lab.tsx:202`). Find out why warm passes link programs synchronously after `compileAsync` (38% of over-budget time, mostly Play). No look change.
2. [ ] **Hall: index the merged geometry** (`hall.ts:89`). Its synchronous finish costs one frame of 133–205 ms. No look change.
3. [ ] **Sideboard transmission glass:** 53% of steady over-budget time. Turning it off cut that by 89% and halved GPU busy time. **This changes the look, so it's the owner's call.** The alternative is an env-map refraction fake.
4. [ ] **Never wake (resize) a canvas from the scroll handler** (`keep.ts:80,96`). It costs one 25–65 ms frame per pass. No look change.
5. [ ] **Build the Lab tree-grow timeline ahead of time** (about 2,000 gsap tweens in one callback, `Lab.tsx:295`). It costs one 25–39 ms frame per pass. No look change.

## Deprioritised (the trace showed no frame-limiting cost)

- Merging draw calls, the hero bob, Play's resize, `setTags`, `alpha: false`, unlit hall lamps. Still worth doing for phones and battery.
- The 103 KB `RectAreaLightUniformsLib` and the Lab code on `/` (load-time only).
- The shared canvas (Tier 4 in the static plan): it isn't needed for the first pass on desktop. Revisit it for phones.

## Result (2026-10-20, idle GPU, 3 runs each, same harness as 01)

Applied: fix 1 (one slice per frame across all builds, builds run during the opening, Play compiled after its pieces), fix 2 (hall merge kept indexed), fix 3 (no transmission: SLM is a walnut bishop, MirrorFi's glass is opaque), fix 4 (scenes ahead of the scroll stay awake twice as far out).

| Scrolling as the opening ends | Before | After |
|---|---|---|
| Frames over 33 ms | 9–12 | 0–1 |
| Frames over 50 ms | 4 | 0 |
| Worst frame | 133–176 ms | 25–50 ms |
| Over-budget time | 443–527 ms | 8–42 ms |

Fix 5 (the Lab tree grown by one CSS variable per depth) was measured and dropped: it moved the cost to the GPU, giving one 92–200 ms frame per pass as the Lab entered.

## Phones (2026-10-21, Lighthouse 13.4.1 mobile, simulated, local production build)

- **Hero build on a phone (4× CPU):** the knight head is welded and its normals summed as it is built (the same mesh, 2.4× faster). The environment, the placement loop and the three compiles each get their own steps. Build time over 30 ms fell from 428 ms to about 200 ms, and the worst frame at load from 150–176 ms to 107–116 ms.
- **The scenes' code is fetched after the page's own scripts** (`src/lib/three/code.ts`, `scenes.ts`, `steps.ts` `lazy`/`Need`). three.js and every scene were in the first load: 880 KB of chunks that Lighthouse's model puts before the name can count as painted. The name was really painted at 0.1 s. They now come down behind one dynamic import, so three.js is fetched once and not once per scene. A build reached before its code is in waits in slices (`NotYet`) instead of finishing at once.

| | Before | After |
|---|---|---|
| LCP (simulated) | 5.4 s | 2.7–3.6 s |
| Perf score | 0.56 | 0.62–0.67 |
| JS on the first load | 1.6 MB, three.js included | 841 KB, no three.js |

TBT for the after runs (1.7–2.5 s) was measured while llama-servers held 75%+ of the GPU, so it is not comparable. Re-measure it on an idle GPU.

## Phones, round 2 (2026-10-21, Lighthouse 13.4.1 mobile, idle GPU, 3 runs)

- **Scene code fetched after first paint** (`code.ts`: the import waits for FCP), `experimental.inlineCss`, slices capped at 10 ms (`steps.ts`). Score 0.74 → 0.79, TBT 590 → 390 ms.
- **The room environment compiled ahead** (`env.ts` `roomEnv`): every scene drew three's RoomEnvironment cold, which compiled its programs on the main thread (20–30 ms a scene, 50–80 ms at 4× CPU, the slowest step of the hero, hall, gallery, sideboard and Lab chapters). Its programs are now compiled in the background first, and drawing it takes 6–7 ms. Score 0.79 → 0.85–0.86, TBT 390 → 180–220 ms.

| | Round 1 | Now |
|---|---|---|
| Perf score | 0.74 | 0.85–0.86 |
| FCP | 0.9 s | 0.9–1.0 s |
| LCP (simulated) | 3.8 s | 3.8 s |
| TBT | 590 ms | 180–220 ms |

LCP was tested by blocking requests. Blocking gsap and lenis: 3.6 s. Blocking JetBrains Mono: 3.6 s. Blocking Archivo (upright, 117 KB, preloaded): 3.2 s. Blocking all fonts: 3.1 s. The name is really painted at 70 ms; the 3.8 s is Lantern counting every byte fetched before that paint. Archivo is the largest single lever, but the name's first frame depends on it.

**Fonts, tried and dropped:** the Colophon animates Archivo across its whole range (wght 100→900, wdth 62→112), so the axes cannot be trimmed. Latin plus Latin Extended-A subsetting (the content uses ć, Ł, ź) saves 1–2 KB a file. Not applied.

**Roles hover removed (owner, 2026-10-21):** each pointer move cast a ray through every table and piece in the hall. The canvas no longer takes the pointer; the names open the tables. Sweeping the pointer across the hall: 0 frames over 33 ms, worst 24 ms.

**Round 3 (2026-10-21):**
- Not preloading JetBrains Mono was tried and reverted. The hero's evaluation line uses it, so the page fetched it before first paint anyway, and fetched from the CSS it counted as render-blocking (FCP 0.9 → 1.2 s).
- Build steps split further: hero pieces one per step, with a step after the placing and before the compiles; Lab chapter 7 four pieces per step, with a step after each side; Work's drawn textures (basalt, ash, walnut) each get their own step (`materialsReady`). The steps over 12 ms at 1× went from 9 to 3–4, the worst at 13–14 ms.
- Lighthouse ×4 (Zoom holding about 11% of the GPU): 0.85–0.86, TBT 200–240 ms. The longest remaining task (about 140 ms simulated) is the Lab's first warm pass, which links one program for the board's 64 squares, and React's hydration (two tasks of 75 ms). Neither splits further without changing what they do.

**Round 4, first-screen font cuts (2026-10-21):** the type the site sets is in two preloaded cuts (`Archivo-First.woff2`: Latin-1 and punctuation, wght 400–900, wdth 100–112, 55 KB from 117; `JetBrainsMono-First.woff2`: Latin-1, wght 400–500, 33 KB from 53). The full fonts stay behind them, unpreloaded, with a `unicode-range` covering only what the cuts lack, so the Ł of "Łódź" on a role page still draws in the house face, and they are fetched only by a page that needs them. The Colophon's specimen, which sweeps both axes end to end, uses the full Archivo under its own name (`--font-archivo-full`). The cuts were made with fontTools (`varLib.instancer`, then `pyftsubset`); regenerate them if a new character or weight comes into use.

| | Before | After (3 runs, idle GPU) |
|---|---|---|
| Perf score | 0.85–0.86 | 0.88–0.89 |
| LCP (simulated) | 3.8 s | 3.4 s |
| Fonts before first paint | 174 KB | 88 KB |

**Round 5 (2026-10-21):**
- Play's game and its engine are fetched once the page has painted (`Play.tsx` → `import("./game")` behind `painted` from `code.ts`). Its controls render from `playState.ts` (state, store, opening search), which has no engine; the opening list brings the engine with it, to name each line's last move. A control used before the game is in waits for it (`later` in `Play.tsx`), which `e2e/lab.spec.ts` caught. That's 9 KB off the first load. Score 0.89–0.90, TBT 150–180 ms, LCP 3.4 s.
- Streaming the hero ahead of the rest was dropped untried. Lantern always counts the whole main document toward the paint (`getFirstPaintBasedGraph` keeps the main document however it ends), so splitting the response cannot move the simulated LCP.
- What remains before the paint: React and Next (about 120 KB, required), the document (48 KB), the two font cuts (86 KB), and the shell and section code (about 60 KB, which build the scenes during the opening). The simulated floor is about 3 s on Lighthouse's 1.6 Mbps link.
