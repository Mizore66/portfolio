# 05: Reference and best practice (laian.dev teardown + primary sources)

Auditor: reference / best-practice researcher, 2026-10-19. No browser was driven against :3100 and no `src/` file was changed. laian.dev was fetched with `curl` (HTML, `styles.css` and every module under `/js/`, 94 KB of unminified source in total). Each fact below comes with the file and line it was seen at. Anything not measured is marked **(hypothesis)**.

---

## 1. laian.dev teardown

### 1.1 Stack

| Fact | Evidence |
|---|---|
| A static site with no framework: one `index.html`, one `styles.css` and ES modules served raw. Cloudflare sits in front. | Response headers `server: cloudflare`, `content-type: text/html`. `<script type="module" src="js/main.js">` at the end of the body. |
| three.js **r170**, loaded from the jsDelivr CDN through an import map. It is not bundled. | `index.html`: `"three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"` |
| **No React, R3F, drei, OGL, GSAP or Lenis.** DOM animation uses **anime.js 4.5**. | `main.js:1` `import { animate, stagger, splitText, scrambleText } from '.../animejs@4.5.0/+esm'`. A grep of all JS and CSS finds no lenis, gsap, ScrollTrigger or drei. |
| **Native scrolling**, plus CSS `scroll-behavior: smooth` for anchor jumps. There is no smooth-scroll library. | `styles.css:64` `html { ... scroll-behavior: smooth; }`, turned off for reduced motion at `styles.css:633`. |
| Sections are revealed by `IntersectionObserver` with DOM and CSS work only: anime.js word reveals, CSS `clip-path` "tape" transitions, CSS timeline drawing. **No reveal ever re-renders a WebGL scene.** | `main.js:223-295` (`revealIO`, `tapeIO`, `.is-in` class and `clip-path` transitionend), `main.js:366-373` |

### 1.2 Canvases and WebGL contexts: three, and only one is full-screen

| # | Canvas | What draws | Size and DPR | Evidence |
|---|---|---|---|---|
| 1 | `canvas.field`, `position: fixed; inset: 0` | **Raw WebGL2, not three.js.** One full-screen-quad fragment shader (noise terrain, contours, heat) plus a ping-pong "trail" pass at about 160 px. **2 draw calls per frame.** | `Math.min(dpr, 2) * 0.6`, so **1.2× CSS pixels**, about 2.5 MP on a 1728×996 screen. `antialias: false`. | `field.js:191`, `field.js:249-256` ("render below native resolution; contours stay crisp via fwidth()"), `field.js:268-312`, `styles.css:111-112` |
| 2 | `canvas.logo-canvas`, `position: fixed; inset: 0` | three.js. **One renderer for all four 3D logos**, each drawn into its own DOM element's rect with `setViewport` and `setScissor`. The file comment says "so there is a single WebGL context no matter how many logos there are". | `setPixelRatio(min(dpr, 2))`, `antialias: true`. Only the small scissor rects are filled. | `logos.js:1-3`, `logos.js:38-40`, `logos.js:104-108`, `styles.css:618` |
| 3 | `.inspect-canvas` inside the sticky Work stage | three.js. One renderer and **one scene**. The five project visuals are added to and removed from it (spin-out, spin-in). | `min(dpr, 2)`, `antialias: true`. The canvas fills only the media column, about 1.15/2.15 of the content width × 67 vh, **roughly a third of the viewport (estimate)**. | `visual.js:340-342`, `visual.js:401-406`, `styles.css:497-500` |

What this means:

- **Three contexts. Only one is full-screen, and that one is a 2-draw-call shader at 0.6 scale.** The three.js canvases either fill small scissor rects (logos) or a box of about a third of the viewport (visuals).
- **No shadows.** Grepping for `castShadow` or `shadowMap` finds 0 matches across all JS.
- **No PBR materials.** Every mesh uses one shared `ShaderMaterial` (the "thermal" rim and contour shader) or `MeshBasicMaterial`. That gives cheap, unlit, ramp-textured shading (`thermal.js:18-38`, `visual.js:59-66`, `visual.js:278-281`). `MeshStandard`, `MeshPhysical`, `EffectComposer` and postprocessing get 0 matches.
- **No post-processing.**
- **Geometry is generated at runtime** from three primitives and `ExtrudeGeometry` from SVGs (`visual.js:71-267`, `logos.js:10-35`). **All of it is built while a loading screen is up**, and the page waits for it (`main.js:316-324`: fonts, the field's first frame, `work.ready`, `logosReady`, each capped at 6–12 s). Assets are one MP4 with a poster plus SVG logos (`projects.js:67`). Nothing is baked because nothing is lit.

### 1.3 Render-loop discipline

- **The field renders every frame, always** (`main.js:139-214`, with rAF re-armed unconditionally unless "Pause effects" is on). So its **GPU load is flat**: there is no frame where extra work starts. That flat load is why "first pass" equals "second pass" on laian.dev.
- **Logos and visuals render only while their section intersects the viewport.** An IO toggles a `visible` flag and the loop stops itself (`logos.js:69-75`, `logos.js:110`, `visual.js:417-422`, `visual.js:483`).
- **The canvas is never resized during scroll.** `field.resize()` runs only on `window` `resize` (`main.js:216`). The three loops compare `canvas.width` to `clientWidth × pixelRatio` and call `setSize` only on a real change (`logos.js:86-88`, `visual.js:429-436`).
- Each module runs its own rAF loop (field and HUD, logos, visuals). That is three rAF callbacks, not one shared ticker. It works because each loop is cheap.

### 1.4 What laian.dev shows us

laian.dev is smooth because it **spends very little GPU per frame, and spends the same amount every frame.** That comes from one cheap full-screen shader at 1.2× resolution, small scissored three.js viewports, unlit shader materials, no shadows, no transmission and no post-processing, with every reveal done in DOM and CSS. It is **not** proof that near-photoreal 3D can scroll smoothly. It reaches about 20 draw calls and about 6 frames over 33 ms per pass (00-context, item 2) by not having our workload. What we can copy is the **architecture**: one context per region type, scissor, fixed buffers, flat per-frame cost, DOM-driven arrivals and building everything before reveal. Its art direction we can leave alone.

---

## 2. Best practice from primary sources

| # | Practice | What the source says | Source |
|---|---|---|---|
| B1 | **One canvas and renderer, one scene per "virtual canvas", drawn with scissor and viewport** | "The browser limits how many WebGL contexts you can have… WebGL resources can not be shared across contexts… things have to be initialized twice, shaders compiled twice, etc. It gets worse as there are more canvases." "The solution is one canvas that fills the viewport in the background… We make a single Renderer and then one Scene for each virtual canvas." | three.js manual, *Multiple Canvases Multiple Scenes* (source: `manual/pages/multiple-scenes.html`) |
| B2 | Same pattern, packaged as drei `<View>` | "Views use gl.scissor to cut the viewport into segments… multiple views with a single, performant canvas." "These views will follow their tracking elements, scroll along, resize, etc." Source: `src/web/View.tsx:57` (off-screen cull), `:94-98` (`autoClear=false`, `setViewport`, `setScissor`). | drei docs; drei source |
| B3 | Same pattern, from Lusion | Per-element canvases fail because of context limits, no shared resources, and no effects outside the element. "A better approach is to create a single fullscreen WebGL canvas… during each rAF, you get the bounding box of your DOM elements and scroll position." | lusionltd/WebGL-Scroll-Sync README |
| B4 | **Context limits** | WebKit hard-codes `maxActiveContexts = 16` (`maxActiveWorkerContexts = 4`) and loses the oldest context. Chromium reads `max_active_webgl_contexts` from GPU preferences and calls `ForciblyLoseOldestContext("Too many active WebGL contexts…")` (`webgl_rendering_context_base.cc:452-515`). The default is 16, and Chromium engineers say "we don't have plans to raise this limit". | WebKit `WebGLRenderingContextBase.cpp:195-196`; Chromium source; Chromium issue 40543269; graphics-dev thread |
| B5 | **Resizing reallocates the drawing buffer** | The drawing buffer's size "shall be determined by the width and height attributes". Buffers reset "when the size is changed". A canvas resize is one of the triggers that presents to the compositor. Engine-level evidence of the cost: WebKit PR 77032 says "allocating drawing buffers is expensive since the kernel needs to allocate memory and map it in to the GPU process". Bokeh measured per-plot shared-canvas resizes at about 8× the cost of uniform sizes. | Khronos WebGL 1.0 spec §2.2, Compositing; WebKit PR 77032, PR 75538; bokeh issue 15320 |
| B6 | Resize properly | three's `setPixelRatio` calls `setSize`, which writes `canvas.width/height` (r180 `WebGLRenderer.js:589-640`). So a DPR change is a buffer reallocation. MDN: "Consider rendering to a smaller back buffer… reducing canvas.width and height and keeping canvas.style.width and height at a constant size". MDN also covers `ResizeObserver` with `device-pixel-content-box`. | three r180 source; MDN WebGL best practices |
| B7 | **Avoid synchronous GL calls; compile in parallel** | `getError`, `get*Parameter`, `getProgramParameter` and `readPixels` "cause synchronous stalls… can cause the entire page to jank (often including scrolling)". "Prefer KHR_parallel_shader_compile… non-blocking COMPLETION_STATUS query." texImage uploads "can cause pipeline flushes. Prefer doing uploads before starting drawing." | MDN WebGL best practices |
| B8 | `compileAsync` | r180 `WebGLRenderer.js:1394-1460`: "makes use of the KHR_parallel_shader_compile WebGL extension… recommended… whenever possible". It polls `program.isReady()` every 10 ms. Only shader programs are covered. **Textures, shadow-map targets, the transmission target and MSAA buffers are still allocated on first render.** | three r180 source |
| B9 | **Static shadows** | `shadowMap.autoUpdate`/`needsUpdate` gate the shadow pass (r180 `WebGLShadowMap.js:66-75,120`). "If your scene is static, only update the shadow map when something changes." "Make the shadow texture as low resolution as possible." "Bake lighting and shadow maps to reduce the number of lights." | three r180 source; discoverthreejs tips |
| B10 | **`PCFSoftShadowMap` ignores `shadow.radius`** | r180 `LightShadow.js:66-80`: "The property has no effect when the shadow map type is `PCFSoftShadowMap`… it is recommended to increase softness by decreasing the shadow map size instead." The PCF_SOFT shader is a fixed 9-tap bilinear kernel (`shadowmap_pars_fragment.glsl.js:164-196`). | three r180 source |
| B11 | **Transmission costs a second scene render** | r180 `renderTransmissionPass` re-renders all opaque objects into a per-camera target: `samples: 4`, half-float, `generateMipmaps: true`, `LinearMipmapLinearFilter`, at viewport × `transmissionResolutionScale` (`WebGLRenderer.js:1849-1921`). So each frame with glass on screen pays for opaque draws twice, an MSAA resolve and a mip chain. | three r180 source |
| B12 | **MSAA vs FXAA** | "On modern hardware built-in MSAA seems to be extremely cheap even on low-power mobile devices… FXAA or SMAA passes cause a considerable frame rate drop." The same page says to cap pixel ratio: "At the expense of some very slight blurring… a considerable performance increase." **(Hypothesis: at DPR 2 on Apple tile GPUs, MSAA resolve is cheap, but 4× samples of 6.9 MP for each of several live canvases is real bandwidth. The pixel count, not the AA method, is the lever.)** | discoverthreejs tips |
| B13 | **HD-DPI** | Rendering at 1× and letting the browser upscale "is probably what you want, otherwise you're likely to get a slow framerate". The manual also has a section titled "Limiting maximum drawing buffer size". | three.js manual, *Responsive Design* |
| B14 | **Render on demand** | Do not render when nothing changed (`requestRenderIfNotRequested`). R3F: `frameloop="demand"`, `invalidate()`. "Calling invalidate multiple times will not render multiple times." | three.js manual, *Rendering on Demand*; R3F *Scaling performance* |
| B15 | **Adaptive quality** | R3F `PerformanceMonitor` example: "starts out with 1.5, if the system falls below the bounds it goes to 1, if it's fast enough it goes to 2". Movement regression: "effects, textures, shadows will slightly reduce quality until still-stand". drei `AdaptiveDpr` implements this by calling `setDpr(current * initialDpr)`, **which is a canvas resize**. detect-gpu assigns tiers 0–3 from gfxbench fps ("tier 3 (>= 60 fps)"). | R3F docs; drei `AdaptiveDpr.tsx`; pmndrs/detect-gpu README |
| B16 | **Draw calls** | "Each mesh is a draw call… no more than 1000 as the very maximum, and optimally a few hundred or less." Instancing gives "hundreds of thousands of objects in a single draw call." | R3F *Scaling performance* |
| B17 | **Scroll sync with one loop** | Lenis README: drive Lenis from GSAP's ticker (`gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`), "drives WebGL scroll scenes, GSAP ScrollTrigger, and parallax off one loop". JOYCO: with Lenis "JS becomes the single source of truth… DOM scroll and WebGL render happen from the same value in the same frame". A fixed canvas plus JS scroll is in sync. An absolute canvas plus native scroll needs 25% padding. Lusion: an absolute canvas re-offset each rAF to avoid drift without scroll-jacking. | Lenis README; JOYCO log 08; Lusion README; three manual "Syncing up" section |
| B18 | **OffscreenCanvas in a worker** | "the busy main thread does not influence the animation running on a worker." Caveats: three needs `style` stubs, no DOM, extra work for textures. Supported in Chrome 69, Firefox 105, Safari 16.4. **It moves CPU work only. It does nothing for GPU-bound frames.** | web.dev *OffscreenCanvas* |
| B19 | **Awwwards studios** | **Igloo Inc (Abeto):** three.js, three-mesh-bvh, Svelte, GSAP. "custom geometry exporters", "strategies for loading textures and compiling shaders, both during the initial load and in the background". UI done in WebGL with SDF text, to avoid DOM relayout. **Bruno Simon:** 2019, "no lights nor shadows… It's just illusions", with shadows baked in Cycles to PNG-8. On mobile, "clamped the pixel ratio". *Devlog 13: Performance* (doubled fps) covers instancing, a palette texture, culling whole areas, lazy loading and a cheap blur. **Active Theory:** built its own engine (Hydra) "optimized for maximum graphics throughput with reduced CPU usage". It has no public detail on canvas count. Reverse-engineering notes suggest GPU-tier gating, which is **unverified**. | Awwwards Igloo case study; Bruno Simon Medium case study and Devlog 13; Active Theory Medium |

---

## 3. Our failure modes: what the best sites do instead

### (a) GPU-bound full-screen frames at 6.9 MP with physical materials

- **What they do:** pay for fewer shaded pixels, and fewer expensive ones.
  - laian renders its only full-screen layer at 0.6 × DPR (`field.js:251`) and keeps 3D in small viewports.
  - Bruno Simon bakes light and shadow into textures and clamps DPR (B19).
  - three's manual says to render below native resolution or cap the buffer (B13). MDN says to render to a smaller back buffer and upscale (B6).
- **For us** (00-context, item 3): capping at 1.5 gave −25–40% slow frames, so pixel count is a first-order cost, not the whole story. The rest is per-pixel cost: clearcoat, transmission (B11) and the 9-tap PCF soft shadow (B10).
- **Fix:** **cap the drawing buffer by a pixel budget**, not a DPR constant. The approach is from the manual's "Limiting maximum drawing buffer size". An example budget is about 3.5–4.5 MP total on screen, at most 1.5–1.6 effective DPR on a 1728-wide viewport.
- **Fix:** move what is static into textures, so the near-photoreal look is precomputed instead of shaded live:
  - bake AO and contact shadows,
  - use an env-map "fake glass" instead of transmission where the glass does not need to refract moving objects.

### (b) 80–230 ms main-thread stalls on canvas resize

- **What they do:** **never resize a canvas outside a real window resize.**
  - laian sizes its canvases once and guards every `setSize` with a real-change check (`logos.js:86`, `visual.js:430`).
  - The scissor pattern (B1–B3) needs one canvas at viewport size forever, so nothing ever sleeps or wakes.
- The spec and engine sources confirm a resize reallocates and re-presents the buffer (B5). three's `setPixelRatio` is a resize (B6).
- So our sleeper in `keep.ts`, which shrinks to 1×1 and wakes, and every dynamic-DPR switch are self-inflicted long frames.
- **Fix:** if dynamic resolution is wanted, **render into a `WebGLRenderTarget` allocated once at full size and vary only the viewport** inside it, then upscale-blit. You can also keep two pre-allocated targets (1.0 and 0.66). drei's `AdaptiveDpr` resizes the canvas (B15), so do not copy that part.

### (c) Many WebGL contexts compositing at once

- **What they do:** **one context for all 3D, or one per kind of layer** (laian: 3 total, 1 full-screen).
- One context means:
  - shader programs, textures and env maps are shared and compiled once (B1),
  - only one context-limit slot is used (B4),
  - the compositor gets one full-screen layer instead of N stacked `alpha: true` canvases.
- **(Hypothesis, not measured: our stacked alpha canvases each present a full drawing buffer whenever they are drawn, per spec §Compositing. When two sections overlap during a scroll, both full 6.9 MP buffers are drawn, presented and blended.)**
- With one fixed canvas and scissor, the **shaded area across all scenes adds up to about one viewport, whatever the number of sections**. This is the structural fix for (a), (b) and (c) together.
- Lenis already makes scroll JS-driven, so a `position: fixed` canvas reading `lenis.scroll` in the same tick stays locked to the DOM (B17).

### (d) Arrival animations that redraw a whole scene every frame

- **What they do:** arrivals are **DOM or CSS (compositor) animations**, and WebGL cost stays flat.
  - laian's reveals are anime.js and CSS `clip-path` over a canvas that is drawing anyway (`main.js:223-295`).
  - Igloo animates text glitches in a shader by changing SDF offsets (B19).
  - Render-on-demand (B14) means a scene redraws only when its *view* changes.
- **Fix:** for us, a 1.6 s gsap timeline that calls `render()` every frame on a 6.9 MP physical scene, as each section enters (00-context, item 2), is the opposite of this.
  1. Drive the arrival with **CSS `transform`, `opacity` or `clip-path` on the canvas or its wrapper**. A WebGL canvas keeps showing its last frame when you don't draw, so this costs zero GPU.
  2. Or, if the motion must be inside the scene, animate only **cheap uniforms on a pre-rendered frame**. Examples: a reveal mask, an exposure ramp, or a full-screen quad sampling a texture rendered once.
  3. Or render the moving part at reduced resolution through the pre-allocated render target from (b), and switch back to full resolution for the final frame ("movement regression", B15).

---

## 4. What we should copy, ranked by first-pass impact

| Rank | Change | Why (evidence) | Effort | Visual cost |
|---|---|---|---|---|
| 1 | **Arrivals without per-frame scene renders.** Use CSS transform, clip-path or opacity on the canvas, or uniform-only reveals on a frame rendered once. Render a scene only when its camera, objects or lights actually change (render-on-demand). | Slow frames line up with arrival timelines (00-context, item 2). laian reveals are DOM-only (`main.js:223-295`). B14. | S–M (per section) | Low to medium. Arrivals become 2D-composited moves or masks instead of in-scene camera moves. In-scene moves can stay if rendered through rank 4's low-res target. |
| 2 | **One shared renderer and context with scissor and viewport per section**, on one fixed full-viewport canvas fed from the Lenis tick. Shared PMREM env, shared programs, shared textures. | B1–B4, laian `logos.js:1-3,104-108`, drei View. Removes N full-screen buffers, the sleeper, context eviction (the `env.ts` 14-context cap exists only because of this) and duplicate shader compiles. | L (architecture) | None if done right. Each section keeps its own scene, camera, tone mapping and exposure. |
| 3 | **Pixel-budget cap** on the drawing buffer, about 4 MP total, instead of DPR 2 at 6.9 MP per canvas. Possibly drop `antialias` once DPR is at least 1.5, and A/B it. | Measured −25–40% at a 1.5 cap (00-context, item 3). B12, B13. laian full-screen layer at 1.2× (`field.js:251`). | S | Slight softening on Retina, judged by eye. Mostly invisible on photoreal shading. |
| 4 | **No runtime canvas resizes.** Delete the 1×1 sleeper. Resize only on a debounced window resize. Any dynamic resolution goes through a once-allocated `WebGLRenderTarget` plus viewport, never `setPixelRatio` or `setSize`. | 80–230 ms stalls measured (00-context, item 4). B5, B6. laian guards (`logos.js:86`, `visual.js:430`). | S–M (rank 2 makes it automatic) | None |
| 5 | **Cut the sideboard's per-frame cost:** about 1,140 draw calls down to a few hundred through instancing and merging, and replace `transmission` glass with env-map refraction or a static pre-rendered transmission backdrop. | B11 (transmission re-renders the opaque scene into a 4×MSAA mip-mapped target each frame). B16 (draw-call guidance). laian's 20 draws. 00-context, item 3 (`transmissionResolutionScale` helped). | M | Low to medium. Glass stops refracting live moving objects, and a static backdrop usually reads the same. |
| 6 | **Bake what is static:** AO, contact shadows and floor shadows into textures (lightmaps). Lower shadow maps (4096 and 8192 → 1024–2048). Set `autoUpdate = false` on every static rig, as `hall.ts:152` already does. **Remove the dead `shadow.radius` settings**: they do nothing under PCFSoft. | B9, B10, B19 (Bruno Simon). 00-context, item 3 (freezing shadows "barely helped", so the per-pixel 9-tap sampling and the PBR cost matter more than the shadow pass). `radius` is set at `hall.ts:112`, `gallery.ts:87`, `sideboard.ts:118` and in Lab chapters. | M–L (needs a bake pipeline) | Low if baked well. Baked contact shadows often look better. |
| 7 | **Build and warm everything before the first scroll can reach it.** Use the 8 s hero opening (or a laian-style loader) for every scene's build, `compileAsync` and a first real-size render, so textures, shadow targets and MSAA and transmission targets are allocated too. Never `staged.now()` on the scroll path. | 300–350 ms "roles: built" freezes (00-context, item 1). laian waits on all models (`main.js:316-324`). B7, B8 (compileAsync covers programs only). B19 (Igloo). | M | None |
| 8 | **One rAF:** gsap.ticker drives `lenis.raf`, then a single render scheduler that renders only invalidated views. `gsap.ticker.lagSmoothing(0)`. | B17. It avoids several loops each rendering, and lets rank 1 and rank 2 coordinate. | S–M | None |
| 9 | **Device-tier defaults:** detect-gpu tier, then the starting pixel budget and the shadow and transmission tier, chosen **once at start-up**, plus an optional PerformanceMonitor that changes render-target scale (never canvas size). | B15. | S | None on high-end machines. Lower tiers get softer output. |
| 10 | OffscreenCanvas worker rendering | B18. Our slow frames have 2–5 ms of JS (00-context, item 2), so they are GPU or compositor bound and a worker would not fix them. Large refactor; DOM-tracked rects would need messaging. | L | None. **Not recommended now.** |

**The plain verdict on architecture:** the stutter is architectural. Seven or more independent full-screen, MSAA, DPR-2, physically shaded contexts, woken by resizing and each redrawn by its own arrival timeline, have a cost that rises and falls with every section entry. That rise is felt as the first-pass stutter. The reference sites do the opposite. They use one context (or a few), with a fixed buffer budget and a flat per-frame cost. Arrivals are composited instead of re-rendered, and every scene is built before it can be scrolled to. Ranks 1, 3 and 4 are cheap and should land first. Rank 2 is the real cure.

---

## Sources

- https://laian.dev/ (HTML), https://laian.dev/styles.css, https://laian.dev/js/main.js, https://laian.dev/js/field.js, https://laian.dev/js/logos.js, https://laian.dev/js/visual.js, https://laian.dev/js/work.js, https://laian.dev/js/thermal.js, https://laian.dev/js/projects.js
- https://threejs.org/manual/#en/multiple-scenes (source: https://raw.githubusercontent.com/mrdoob/three.js/dev/manual/pages/multiple-scenes.html)
- https://raw.githubusercontent.com/mrdoob/three.js/dev/manual/pages/rendering-on-demand.html
- https://raw.githubusercontent.com/mrdoob/three.js/dev/manual/pages/responsive.html
- https://raw.githubusercontent.com/mrdoob/three.js/r180/src/renderers/WebGLRenderer.js
- https://raw.githubusercontent.com/mrdoob/three.js/r180/src/renderers/webgl/WebGLShadowMap.js
- https://raw.githubusercontent.com/mrdoob/three.js/r180/src/lights/LightShadow.js
- https://raw.githubusercontent.com/mrdoob/three.js/r180/src/renderers/shaders/ShaderChunk/shadowmap_pars_fragment.glsl.js
- https://drei.docs.pmnd.rs/portals/view
- https://raw.githubusercontent.com/pmndrs/drei/master/src/web/View.tsx
- https://raw.githubusercontent.com/pmndrs/drei/master/src/core/AdaptiveDpr.tsx
- https://r3f.docs.pmnd.rs/advanced/scaling-performance
- https://github.com/pmndrs/detect-gpu
- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- https://registry.khronos.org/webgl/specs/latest/1.0/
- https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/html/canvas/WebGLRenderingContextBase.cpp
- https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/modules/webgl/webgl_rendering_context_base.cc
- https://issues.chromium.org/issues/40543269
- https://groups.google.com/a/chromium.org/g/graphics-dev/c/fmNedEEAYpA
- https://github.com/WebKit/WebKit/pull/77032
- https://github.com/WebKit/WebKit/pull/75538
- https://github.com/bokeh/bokeh/issues/15320
- https://discoverthreejs.com/tips-and-tricks/
- https://github.com/darkroomengineering/lenis (README)
- https://gsap.com/docs/v3/GSAP/gsap.ticker/
- https://github.com/lusionltd/WebGL-Scroll-Sync
- https://hub.joyco.studio/logs/08-webgl-scroll-sync
- https://web.dev/articles/offscreen-canvas
- https://www.awwwards.com/igloo-inc-case-study.html
- https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b
- https://www.youtube.com/watch?v=EhZwt9P4GP4 (Bruno Simon, Performance, Devlog 13)
- https://medium.com/active-theory/the-story-of-technology-built-at-active-theory-5d17ae0e3fb4
