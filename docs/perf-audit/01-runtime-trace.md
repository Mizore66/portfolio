# 01: Runtime trace of the first pass (2026-10-20)

The runtime-trace auditor's report. It checks PLAN.md's ranking against full Chrome traces taken on an idle GPU.

## Bottom line

1. **On an idle GPU, the steady-state first pass is nearly clean.** Load, wait 25 s, scroll once: about 1 frame over 33 ms, against the 45–50 in 00-context §2. That number does not reproduce today (see "What could not be determined").
2. **The jank a real visitor meets is the build pipeline.** Scrolling as soon as the hero opening ends gives 11 frames over 33 ms and 4 over 50 ms (worst 133–176 ms).
   - Builds and warm-ups cause **81% of the over-budget time** in that scenario, and every frame over 50 ms.
   - Inside that, the top items are shader-link waits during warm passes (mostly Play's), the hall's synchronous `finish()` (about 150 ms), and Play's context creation.
3. **The transmission pass is the one real GPU cost.** In the steady state, the sideboard's transmission pass causes about 90% of the remaining missed vsyncs. Turning transmission off cut them from 33 to 4 per pass, and halved GPU busy time.
4. **Arrivals in general are not the problem.** Arrival redraws of the hall and the gallery produced no slow frames at all.

## Method

- **Machine and browser:** M2 Pro, Playwright Chromium 151.0.7922.34 (headless unless noted), flags `--use-angle=metal --enable-gpu --ignore-gpu-blocklist`. Viewport 1728×996 at DPR 2. The display ran at 120 Hz, so the median frame is 8.3 ms.
- **Target:** `http://localhost:3100/?fps`, the production build of the committed source (`ba96630`), with `?fps` on so `window.__trace` is readable.
- **Scripts** (all in `scripts/.lag/`):
  - `trace.mjs` runs one measured pass.
    - Scenario **A**: load, wait 25 s, then record a CDP trace over **one** wheel pass to the bottom (100 px every 16 ms, 80 steps, then 1.5 s settle).
    - Scenario **B**: same pass, started the moment `.hero[data-intro]` turns `done`, about 8.3 s after load. Under reduced motion there is no opening, so B starts at a fixed 8.5 s.
    - Trace categories: devtools.timeline (+disabled-by-default variants, including `.frame`), gpu, viz, cc, blink, v8, the v8 CPU profiler, toplevel, `disabled-by-default-gpu.service`, benchmark, input, latencyInfo.
    - The page also logs rAF-to-rAF frame times, plus WebGL draw calls per frame for each section's canvas.
  - `analyze.mjs` takes each slow frame and measures, within the frame window:
    - busy time per thread: renderer main, compositor, raster workers, GPU main, viz;
    - the renderer main thread split by self time into script / style+layout / paint+commit / GC / **gpuSync** (synchronous command-buffer waits: `WaitForGetOffset`, `CommandBufferHelper::Finish`, `GLES2Implementation::Get*`);
    - the GPU main thread split into **backpressure** (`CALayerTreeCoordinator::ApplyBackpressure`, `WaitForCommandsToBeScheduled`: waiting on Metal to finish earlier work), decode (WebGL command execution through ANGLE/Metal), raster and present;
    - hot JS from the v8 samples, the scenes that drew in the frame, and the site's event log.
  - From that it assigns a **bottleneck thread** (any thread busy for ≥50% of the frame) and a **PLAN.md cause**.
  - `aggregate.mjs`, `share.mjs`, `mid.mjs` and `stack.mjs` compute medians and shares, attribute frames to scenes, and print the call paths inside one window.
  - `gpucheck.sh` and `runs.sh` handle GPU hygiene before each run.
- **Two thresholds.** ">25 ms" frames are counted beyond 16.7 ms, as asked. At 120 Hz, though, most visible hitches are 16.7 ms frames: one missed vsync. So shares are also given for frames over 12 ms, counted beyond 8.33 ms. That second view is the one that matches "micro lag spikes".
- **Trace overhead check:** `steady.mjs ONEPASS=1`, run without tracing, gave >33 = 1 and worst 50 ms. This matches traced scenario A, so the tracer does not distort the result.
- **A/B without editing `src`:**
  - **NOTRANS:** an init script defines an accessor `Object.prototype._transmission` that always reads 0. three's `MeshPhysicalMaterial` stores transmission in `_transmission`, so no material is transmissive and the transmission pass is skipped. Confirmed in the counts: sideboard draws fell from 1,140 to 748 per frame.
  - **RM:** the `reducedMotion: "reduce"` context option. It removes the opening, all arrival timelines and the hero bob.
  - **NOSYNC:** `getProgramInfoLog`, `getShaderInfoLog` and `LINK_STATUS` answered locally, to test whether three's `checkShaderErrors` round trips are the wait.

### GPU readings (taken immediately before each run)

All runs started with IOAccelerator Device Utilization at 0–2%. No non-browser process was above 4% (WindowServer, once), so no run ever had to wait.

| Run | Time | Device util | Top processes (3 s sample) |
|---|---|---|---|
| A1 / B1 | 16:29 / 16:33 | 0% / 0% | Codex 0.1%, WindowServer 0.0% / Code 0.1%, WindowServer 0.1% |
| A2 / B2 | 16:37:33 / 16:37:57 | 0% / 0% | Codex 0.1% / Codex 0.1%, WindowServer 0.1% |
| A3 / B3 | 16:38:36 / 16:38:59 | 0% / 0% | WindowServer 4.0% / Codex 0.1% |
| NT-A1..3 | 16:41:24, 16:43:20, 16:45:19 | 0% | at most WindowServer 0.6% |
| NT-B1..3 | 16:41:47, 16:43:44, 16:45:43 | 0% | at most 0.1% |
| RM-A1..3 | 16:42:23, 16:44:19, 16:46:18 | 0% | at most WindowServer 1.3% |
| RM-B1..3 | 16:42:41, 16:44:39, 16:46:38 | 0% | at most 0.1% |
| LAIAN | 16:50:58 | 0% | Codex 0.1% |
| NS-B1..3 | 16:52:28, 16:52:51, 16:53:14 | 0% | at most 0.1% |
| H-A1 / H-B1 (headed) | 16:53:57 / 16:54:21 | 2% / 0% | Codex 0.1% / Chrome 2.5%, WindowServer 2.5% |

The full log is in `/tmp/lagtr/runs.log`. Traces are in `/tmp/lagtr/*.json`, about 120 MB each, and are not committed.

## Measured: headline numbers (medians of 3 runs)

| Scenario | frames | >12 ms | >25 | >33 | >50 | worst | over 8.33 ms (all frames) | over 16.7 ms (frames >25) | pipeline STATE_DROPPED | GPU-main busy | of which backpressure | main gpuSync |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A** steady (25 s wait) | 534 | 33 | 2 | 1 | 0 | 34 | 408 ms | 26 ms | 33 | 2,266 ms | 1,165 ms | 35 ms |
| **B** scroll at opening end | 559 | 41 | 14 | 11 | 4 | 149 | 931 ms | 477 ms | 87 | 2,195 ms | 910 ms | 437 ms |
| NT-A (no transmission) | 556 | **4** | 1 | 0 | 0 | 25 | 156 ms | 9 ms | 2 | **1,077 ms** | **204 ms** | 27 ms |
| NT-B | 569 | 21 | 8 | 5 | 3 | 133 | 618 ms | 303 ms | 56 | 1,495 ms | 266 ms | 260 ms |
| RM-A (reduced motion) | 416 | 3 | 1 | 1 | 0 | 42 | 136 ms | 26 ms | 11 | 243 ms | 54 ms | 31 ms |
| RM-B | 419 | 3 | 1 | 1 | 0 | 42 | 139 ms | 25 ms | 13 | 230 ms | 51 ms | 32 ms |
| NS-B (no shader-status round trips) | 555 | 46 | 11 | 8 | 5 | 166 | 969 ms | 435 ms | 92 | 2,453 ms | 1,184 ms | 375 ms |
| H-A headed, 1 run | 554 | 30 | 5 | 3 | 2 | 166 | 595 ms | 239 ms | 54 | 1,896 ms | 876 ms | 88 ms |
| H-B headed, 1 run | 563 | 36 | 13 | 10 | 3 | 222 | 956 ms | 514 ms | 80 | 1,742 ms | 582 ms | 384 ms |
| **laian.dev**, 1 run | 539 | 27 | 11 | 9 | 8 | 392 | 1,773 ms | 1,428 ms | 142 | 2,283 ms | 33 ms | 200 ms |

Per-run values for A >33: 1/3/0. For B >33: 11/12/9. Run to run, B is stable.

## Measured: first-pass slow frames by bottleneck thread

**Frames over 12 ms**, time beyond 8.33 ms, summed over 3 runs:

| Scenario | renderer main: script | renderer main: gpuSync wait | GPU main: Metal backpressure | other |
|---|---|---|---|---|
| A | 34% (11.7 frames/run, 116 ms) | 7% (1.3, 25 ms) | **51% (20.0, 170 ms)** | style/layout 3%, GPU decode 3%, GC 1% |
| B | **43% (14.0, 347 ms)** | **44% (13.3, 361 ms)** | 12% (10.7, 95 ms) | style/layout 1% |
| NT-A | 61% (1.7, 22 ms) | 23% (1.0, 8 ms) | 0 | style/layout 15% (0.7, 5 ms) |
| NT-B | 61% (13.0, 282 ms) | 39% (8.7, 178 ms) | 0 | |
| laian.dev | 1% | 15% (3, 242 ms) | 0% | **GPU raster 64% (8 frames, 1,070 ms)**, GPU decode 11%, present 3% |

**Frames over 25 ms** (beyond 16.7 ms), medians of 3 runs:

| Scenario | thread | frames | over-budget |
|---|---|---|---|
| A | main: script | 1 | 17 ms |
| A | main: gpuSync | 1 | 9 ms |
| B | main: gpuSync | 10 | 242 ms |
| B | main: script | 4 | 235 ms |

Measured facts from these tables:

- **The compositor and raster threads were never the bottleneck on this site.** Compositor busy was at most 7 ms per slow frame, raster 4 ms.
- **The GPU frames are Metal back-pressure.** In A, 20 frames per run are GPU-bound, and they spend about 14 ms of a 16.7 ms frame in `ApplyBackpressure`. The GPU is still finishing the previous frame; WebGL command decode itself is only 2–7 ms. That is fill or shading cost, not command volume.
- **B's long frames are main-thread waits on the GPU process,** in synchronous WebGL calls (`getProgramInfoLog`, `getProgramParameter`, `getShaderInfoLog`, `getContext`, `getExtension`, `bufferData`), and JS build work.
- GC is negligible: at most 8 ms in one frame, 40–55 ms over a whole pass.

## Measured: first-pass slow frames by PLAN.md cause

### Scenario A (steady): frames over 12 ms, 335 ms over budget per run

| Cause | share | ms/run | frames/run | evidence |
|---|---|---|---|---|
| **Transmission pass (sideboard arrival redraw)** | **53%** | 179 | 20.7 | 31 of the sideboard's 74 drawn frames run 16.5–16.8 ms (GPU 16.4 ms, backpressure 13–14 ms). With NOTRANS: 1–3 of 94. Hall: 0 of 100. Gallery: 0 of 94 in A2, 20 of 74 in A3, always alongside the sideboard. |
| other (frames with no scene drawn and no saturated thread: 13–17 ms, GPU backpressure still draining from the sideboard) | 16% | 52 | 6.3 | most vanish under NOTRANS |
| **Sleeper wake (resize) inside scroll** | 12% | 41 | 2.3 | `lab chapter 7: woken 22–38 ms`, `setSize` self time 18 ms (51 ms headed). It is the one slow frame left under reduced motion (42 ms). |
| script (other): sideboard frames whose main thread is 8–16 ms of JS for its ~1,140 draws | 11% | 38 | 4.7 | renderer script time. Gone, with the frames, under NOTRANS. |
| **Lab tree grow, gsap setup** (new, not in PLAN.md) | 7% | 24 | 1.0 | One 25–39 ms frame per run when `#lab` enters: `Lab.tsx:295` builds one `fromTo` per tree line (about 2,000 tweens) in the IntersectionObserver callback. The v8 stack is `firstView` → `grow` → `tl.fromTo` → gsap init, plus `getComputedStyle`. |
| hero idle bob, Play `place()` resize, Lab `setTags`, seam style recalc | 0% | 0 | 0 | not one slow frame attributed |

### Scenario B (scroll at opening end): frames over 12 ms, 814 ms over budget per run

| Cause | share | ms/run | frames/run | evidence |
|---|---|---|---|---|
| **Build/warm, all** | **81%** | 659 | 22 | every frame over 50 ms |
| … shader-link waits in warm passes (Play 25%, sideboard 7%, gallery 3%, hall 1%, unknown 2%) | 38% | 307 | 12 | `getProgramInfoLog` / `getShaderInfoLog` self time 10–36 ms per frame. Event log: `warm: 31–51 ms for … (MeshPhysicalMaterial)` (`warm.ts:36`). |
| … **hall's synchronous finish** | 18% | 144 | 1.0 | 133–205 ms frame at +0.5 s. Stack: `firstView` (RolesIndex.tsx:67) → `build()` → `staged.now()` → `finish()` → `run()` → hall merge (`hall.ts:89`): `toNonIndexed` 397 samples, `applyMatrix4` / `applyNormalMatrix` 670 samples out of 1,249. |
| … build slices (hall 9%, Play 7%, gallery and sideboard 1% each) | 17% | 149 | 7 | hall: a 59–84 ms frame right after (`bufferData` 14–21 ms, `computeBoundingSphere`). Play: 25–42 ms steps (LatheGeometry `se`, SphereGeometry `sr` constructors). |
| … Play context creation | 7% | 53 | 1.7 | `getContext` 17–32 ms plus `getExtension` 3–16 ms plus `setSize` 12–14 ms, at +2.5 s. Started by the Lab's `near` observer (`Lab.tsx:202–205`, rootMargin 150%), which calls `build(id)` mid-scroll, bypassing the queue's "scroll still for 300 ms" rule. |
| Transmission pass (sideboard redraw) | 9% | 73 | 8.3 | same signature as in A |
| script (other) / other | 8% | 59 | 7 | |
| Lab tree grow | 2% | 20 | 1.0 | |
| hero idle bob | 1% | 8 | 1.0 | |
| sleeper wake, Play `place()`, `setTags`, seam style | 0% | 0 | 0 | |

### What the A/B tests show

- **NOTRANS, steady state:** over-budget time fell from 335 to 36 ms per run (−89%) and frames over 12 ms from 33 to 4. GPU-main busy fell from 2,266 to 1,077 ms, and back-pressure from 1,165 to 204 ms.
- **NOTRANS, scenario B:** over-budget time fell from 814 to 460 ms per run (−43%). The cut comes from the sideboard redraws, and from shorter link waits once the GPU is no longer backed up behind the transmission pass.
- **RM, both scenarios:** with all arrivals and the opening gone, about 1 slow frame per pass remains, and it is the sleeper's resize. So the arrival timelines are only a cost through the one transmissive scene. The hall and gallery arrivals redraw 6.9 MP every frame and fit in 8.3 ms.
- **NOSYNC:** no improvement (B over-budget 435 vs 477 ms, the same within noise). The wait just moved to `getProgramParameter` (three's uniform introspection). So the link itself is the cost, not three's error-checking round trip. Warm passes are linking programs synchronously on first use, even though each scene ran `compileAsync` first.
  - *Hypothesis:* the programs the warm needs are not the ones `compileAsync` built: shadow-depth programs, the transmission render target variant, or programs keyed on light and shadow state at warm time. It is worth checking with `renderer.info.programs` before and after the warm.

## Does this confirm or reorder PLAN.md?

It reorders it. The mechanism in PLAN.md's "why" section (§1, arrivals redraw whole scenes) is only half right. Only the **transmissive** scene's redraws cost frames. §3 (builds start together at the end of the opening, with a synchronous finish) is the dominant cause of the jank a visitor scrolling early actually meets.

| PLAN.md item | tier now | evidence verdict | proposed order |
|---|---|---|---|
| One global build queue, no synchronous finish, builds during the opening | T2 | **Confirmed, and the largest cause:** 81% of scenario B, every frame over 50 ms | **1st**. Include: warm passes must not link programs synchronously; Play's `near` observer must not start a build mid-scroll. |
| Hall: index the merged geometry | T1 | **Confirmed** as most of the 133–205 ms synchronous finish and the 60–84 ms follow-up (`toNonIndexed`, `applyMatrix4`, `bufferData`) | 2nd. The `patchSpots` half is not measurable here: the hall never makes a slow frame while drawing. |
| Glass without transmission | T3 (changes the look) | **Confirmed as the only steady-state GPU cost:** 53–89% of A, 9% of B | 3rd, owner's call. *Hypothesis, untested:* a same-look middle path is to render the transmission target once per arrival, or at reduced resolution, instead of every frame. |
| Never wake a canvas inside the scroll handler | T1 | **Confirmed:** 1 frame per pass, 25–65 ms (`setSize` 18–51 ms). The only slow frame left under reduced motion. | 4th |
| Lab tree-grow timeline (about 2,000 tweens built in one callback) | not in PLAN | **New:** 1 frame per pass, 25–39 ms | 5th: build the timeline ahead, or animate the tree as a few groups |
| Arrivals that don't redraw every frame | T3 | **Refuted as a general cause.** Hall and gallery arrivals: 0 slow frames. Only the sideboard's arrival costs, and only through transmission. | drop, or fold into the transmission item |
| Merge sideboard and hero meshes (1,140 to about 150 draws) | T2 | **Not supported as frame-limiting:** with transmission off, 748 draws per frame fit (1–3 slow of 94). Without transmission, main-thread script for those draws is about 8–16 ms, near the 120 Hz budget. | lower: helps CPU headroom, not the measured stalls |
| Hero idle bob only when mostly on screen | T1 | **Not measurable:** 0–1 frames per pass (1% of B) | lower |
| Play: size canvases on resize only (`ch7.ts:84`) | T1 | **Not measurable:** no `setSize` time in Play's render frames, except during wake. *Hypothesis:* three's `setSize` no-ops at an unchanged size. | lower |
| Lab `setTags` per scroll event | T1 | **Not measurable:** no slow frame carries it | lower |
| Seam style recalc | n/a | **Not measurable:** style+layout is 370–450 ms per pass, but at most 1 slow frame where it leads | lower |
| `alpha: false`, freeze shadow maps, dead `shadow.radius` | T1/T2 | not tested; nothing in the trace points at them | unchanged |
| Tier 4 (one shared renderer) | T4 | Not needed to explain anything measured here on an idle M2 Pro. It would remove the context creation, the sleeper and per-context shader compiles, so it addresses causes 1, 4 and part of 2 structurally. | unchanged: the "real cure" argument still holds on cost, but it is not proven necessary |

## laian.dev comparison (1 run, scenario A)

| | anasqumhiyeh.dev, A (median) | anasqumhiyeh.dev, B (median) | laian.dev |
|---|---|---|---|
| frames >12 / >33 / >50 | 33 / 1 / 0 | 41 / 11 / 4 | 27 / 9 / 8 |
| worst | 34 ms | 149 ms | 392 ms |
| over 8.33 ms, all frames | 408 ms | 931 ms | 1,773 ms |
| WebGL draws per frame | 228–256 | 223–232 | 20 |
| canvases | 7 (3456×1992 when awake) | 7 | 3 (2074×1195, two small) |
| scroll | Lenis (main thread) | Lenis | native (no Lenis class or global) |
| slow-frame bottleneck | GPU back-pressure (sideboard transmission) | main-thread GPU waits and build JS | **GPU raster:** 200–390 ms raster tasks for page tiles (64%), plus 2 shader-link stalls of 100–140 ms |

Measured: in this run laian.dev had more and longer slow frames than this site's steady pass. 00-context reported about 6 frames over 33 ms for it. Its stalls are in raster, on the GPU process, while its main thread stayed idle (2–10 ms per slow frame).

*Hypothesis:* with native scrolling, its stalls show as late tiles rather than a frozen scroll position. This site's B stalls are on the main thread, which also drives Lenis, so the whole page stops. That would explain why laian.dev reads as seamless despite worse raw numbers. It is not verified: I did not measure input-to-scroll latency or checkerboarding.

## What could not be determined

- **Why 00-context §2 saw 45–50 frames over 33 ms in the steady pass and this audit sees about 1.** Same build (`ba96630`, the served `.next` is from 16:24 today, and `src` is clean), same viewport, same flags.
  - *Hypothesis:* the earlier runs shared the GPU with other jobs (the memory notes say the audit waited for idle llama-servers). Back-pressure on the GPU process would turn the sideboard's 16.7 ms frames into 33–50 ms ones. I did not reproduce this under load, since the rules forbid making load.
- **Headed vs headless.** One headed run each. Headed A had 3 frames over 33 ms, including a 166 ms GPU-raster frame while the gallery and hall drew, and a 51 ms sleeper resize. Headed B looked like headless B. One run is not enough to rank headed-only causes. Real Chrome with a real display (and extensions) may differ again.
- **Function names inside the site's chunks** are minified (no source maps ship). Attribution to site code is by the event log (`trace.ts`), the scene draw counters and stack shape, cross-checked with the chunk source at the sampled column (`stack.mjs`). three's own method names survive.
- **Cause labels are heuristic.** A frame is labelled by the event log and hot functions inside it, then by the scenes that drew. A frame with two overlapping causes gets one label. Shares are approximate to about ±5 points.
- **Why warm passes link synchronously after `compileAsync`.** Not determined; see the hypothesis above.
- **Phones and weaker GPUs** were not measured. All numbers are an M2 Pro at 120 Hz.
- **The cost of the 1×1 shrinks** (`asleep 5–15 ms`): they happen once the scroll has been still and fell outside the slow-frame set. They were not ranked.
