# 04: Load, bundle and Lighthouse audit

Auditor: load/bundle/Lighthouse. This was static analysis of the existing production build in `.next/` (BUILD_ID `BMW6qJ5enWDDyJRhFb7EC`, built 2026-10-19 18:05). I made one GET of `http://localhost:3100/` and a few HEAD requests for asset headers. I did not drive a browser, run a build or edit `src/`.

Method: I split each Turbopack chunk into its modules with acorn, by walking the `TURBOPACK.push([...])` array. I identified modules by their export names and string literals. Sizes are raw bytes, gzip -9 and brotli, all from node zlib. I used the build manifests (`.next/diagnostics/route-bundle-stats.json` and `server/app/page_client-reference-manifest.js`) and the served HTML. I ran Lighthouse 13.5's own estimators (`~/.npm/_npx/.../lighthouse/core`) on the chunks.

The chunk names in the Lighthouse report come from an earlier build. I matched them by byte size:

| Lighthouse name | Current file | Evidence |
|---|---|---|
| `02zumrqfxzwqt.js` (81.6 KiB transfer) | `07dj.l--eshbe.js` | Both 346,301 B raw, 82.6 KB gz; the context doc gives the same size |
| `0tpd1nshf7mbp.js` (52.1 KiB) | `0zl1imy7-7lal.js` (the Lab bundle) | 52.6 KB gz |
| `0l7i~d4z4~j4i.js`, `02uu1numa3cek.js`, `10~x95jhs6ns3.js`, `0e-wrhqh4h3r5.js`, `0.71nvfk4z5p1.js`, `03gr70eoyvr64.js`, `0j4n8iobu5npl.js` | same names | same sizes |

---

## TL;DR

1. **The "3 s of script evaluation" is not parsing or evaluating the bundle.**
   - Lighthouse gives that chunk 6 ms of parse and compile.
   - The 3,026 ms is scene construction: shader compiles, PMREM environment generation, shadow-map setup and warm passes.
   - It runs inside `steps.ts`'s slice scheduler and `env.ts`'s `compileAsync` poller. Turbopack bundled both into the same chunk as three's `WebGLRenderer`. Lighthouse charges each task's self time to the script whose function the event invoked.
   - Splitting the bundle cannot remove this. It is the same work the runtime auditors see as "roles: built" freezes. The fix is architectural (see R1).
2. **A third of the eager JS on `/` is not needed for the first screen.**
   - Eager JS on `/`: 1.71 MB raw, 528 KB gz (the nomodule polyfill excluded).
   - About 180 KB gz of it is for sections below the fold.
   - The worst single item is three's `RectAreaLight` LTC lookup tables: 246 KB raw, 103 KB gz of numeric literals in the page chunk. Only the sideboard uses them, five screens down.
   - The whole Lab ships on `/` as well: all seven chapters, the full `content.json` (88 KB), `TessellateModifier` and the chess engine. The one page shows only the opening tree and Play.
3. **Most of the Lighthouse findings are Chrome-extension artefacts.**
   - "Minify JS, 110 KiB": Lighthouse's own estimator puts every first-party chunk under 3% savings, below its 10% threshold.
   - "Unused JS, 574 KiB": only 58 KiB of it is first-party.
   - "Legacy JS, 13 KiB": Next's built-in 0.6 KB gz polyfill module.
4. **What is real but secondary:**
   - Fonts gate the hero opening: Archivo 119 KB and JetBrains Mono 53 KB. About 75% of each Archivo file is `gvar` variation data for two axes.
   - The italic, 134 KB, is fetched at once whenever the page is opened at a hash.
   - The proxy runs on every static asset request.
   - `await connection()` makes every page dynamic.
   - Six render-blocking CSS files, 12.8 KB gz in total.

---

## 1. Every Lighthouse audit, real or extension-caused

The run was on `localhost:3100/#lab`, emulated desktop, Lighthouse 13.4.1 on Chromium 155, with extensions on. Four extensions injected scripts: `hdokiejnp…` (web-client-content-script, 895 KiB), `nkbihfbeo…` (contentscript and inpage, 443 + 113 KiB), `amfeiojho…` and `mlomiejdf…` (autoconsent, adblocker).

A note on the hash: `/#lab` changes the page's behaviour. With a hash the hero opening is skipped (`Hero.tsx`, `begin()`: `location.hash` leads to `finish()`). The italic is requested at once (`OnePage.tsx:75`). With no opening to wait for, `buildAhead` (`firstView.ts:19`) builds the hero, Roles, Work, Others and Play in the first ~3 s. On a plain `/` load, the same work runs after the 8 s opening, which is when the visitor starts scrolling.

### Metrics

| Metric | Value | Real? |
|---|---|---|
| Performance | 72 | Mixed. TBT drives it. |
| FCP | 0.4 s | Real and good. |
| LCP | 0.9 s | Real and good. The LCP element is a `span` (masked display type raised by gsap). |
| TBT | 600 ms | Mostly real. 17 of the 20 long tasks are first-party (see the long-tasks row). |
| CLS | 0 | Real. |
| Speed Index | 1.9 s | Real, inflated a little by extension CPU. |

### Insights and diagnostics

| Audit | Number | Verdict |
|---|---|---|
| Forced reflow | `10~x95` (react-dom) 40 ms, `03gr70` 31 ms, `0.71nv` (gsap) 27 ms, Lab chunk ~8 ms | **Real, small** (~105 ms in total). Sites: `03gr70:1:5133` is the sleeper's `getBoundingClientRect` (`keep.ts`); `03gr70:1:2353` is `restColours` doing `getBoundingClientRect` then `getComputedStyle` per line (`seam.ts:137-138`); `0.71nv:1:54050` is gsap's `getComputedStyle` helper; `0j4n` is lenis reading `scrollHeight` (0 ms). React's 40 ms is the commit phase running the sections' layout effects, which measure the DOM. |
| Network dependency tree | max critical path 2,144 ms | **Real, but caused by the hash.** It ends at the italic woff2 (131.9 KiB), which `/#lab` requests at once (`OnePage.tsx:75`). On `/` the italic waits for the `load` event. |
| Preconnect | none needed | n/a |
| Render-blocking requests | 6 CSS files, 80–120 ms each (emulated) | **Real, low impact.** 54.7 KB raw, 12.8 KB gz in total (§4.3). |
| Legacy JavaScript | 13 KiB, all in `10~x95` | **Not actionable.** The flagged polyfills (`trimStart`, `flat`, `at`, `hasOwn`, `fromEntries`) are one Next-internal module (id 66849) of 1,387 B raw, 596 B gz. Lighthouse reports a whole-file figure. Next ships it regardless of browserslist. |
| LCP breakdown | TTFB 170 ms, element render delay 1,290 ms | **Real, by design.** Text is held under masks (`visibility: hidden` / `yPercent: 135`) until JS raises it, so render delay is JS-gated. On `/` the hero name is gated by the fonts plus the stage build (`Hero.tsx:190-197`). |
| 3rd parties | all four are extensions | **Extension.** |
| Minimize main-thread work | 4.8 s | Mixed: about 0.6 s is extensions and unattributable. |
| Reduce JS execution time | 3.9 s (first-party 3,538 ms eval) | **Real, but mislabelled.** See §3. |
| Minify JavaScript | 110 KiB | **Extension only.** Lighthouse's own `computeJSTokenLength` on every eager first-party chunk gives 0.2–2.6% savings. The audit ignores anything under 10% (`unminified-javascript.js:23`), so no first-party chunk can be listed. Turbopack minification is on (`turbopackMinify` defaults to true for builds, per `08-turbopack.md`). |
| Reduce unused JavaScript | 574 KiB | **Mostly extension.** First-party is 58.1 KiB: `02uu1` (three core) 33.2 KiB and `10~x95` (react-dom) 24.9 KiB. The rest is extension or unattributable. |
| Long main-thread tasks | 20 | **17 are first-party**, all attributed to `02zumrqfxzwqt.js`: 53–123 ms each, between 1,326 and 3,128 ms. Also one in the Lab chunk (55 ms) and two in the document (73 ms and one more). Extensions add 298 ms. |
| Enormous payloads | 886 KiB total, 756.8 KiB first-party | Real (§2). |
| DOM size | 1,249 elements; `svg.op-tree` has 780 children | Real, acceptable. The search-tree SVG is the Lab opening. |
| Passed | cache lifetimes, compression, server response 128 ms, font-display, image delivery, CLS culprits, non-composited animations | — |
| Best practices | CSP host allowlist; no COOP; no Trusted Types; no HSTS preload | Security, not performance (§4.4). |
| "Modern HTTP" | localhost serves HTTP/1.1 | Local only. Vercel serves HTTP/2 or HTTP/3. |

---

## 2. What `/` loads

### 2.1 Initial chunks (from the served HTML, which agrees with `route-bundle-stats.json`)

The served HTML has 17 `<script src>` tags. All are `async`. `03~yq9q893hmn.js` is `noModule`, so modern browsers never fetch it. `route-bundle-stats.json` gives `/` `firstLoadUncompressedJsBytes` = **1,713,030**.

| Chunk | Raw | gzip | br | Contents |
|---|---:|---:|---:|---|
| `07dj.l--eshbe.js` (= LH `02zumrqfxzwqt`) | 346,301 | 82,562 | 69,805 | three `WebGLRenderer`, `PMREMGenerator`, `ShaderChunk`/`UniformsLib` (module 8560, 330,540 B; **299,706 B of it is GLSL string literals**), `RoomEnvironment`, **`lib/three/steps.ts`**, `pieces.ts` (8,928), `sculptures.ts` (5,275), **`lib/three/env.ts`** (1,405) |
| `0l7i~d4z4~j4i.js` | 300,702 | 122,875 | 89,880 | The page's section components. `Others` + `sideboard.ts`: 259,089 raw / 107,867 gz, of which **248,008 raw / 102,630 gz is the inlined `RectAreaLightTexturesLib` LTC tables**. Hero + `stage.ts`: 17,419. WorkIndex: 9,941. RolesIndex: 6,236. Contact: 4,453. OnePage: 2,351. Opening line: 1,026. |
| `02uu1numa3cek.js` | 231,956 | 62,326 | 51,359 | three core (module 90072, 189 exports in one hoisted module) |
| `10~x95jhs6ns3.js` | 227,314 | 70,808 | 60,626 | react-dom client |
| `0zl1imy7-7lal.js` (= LH `0tpd1…`) | 160,140 | 52,558 | 44,089 | **The whole Lab**: `Lab.tsx` hoisted with `chapters.tsx`, ch1–ch7, `kit`, `tree`, `game`, `Play` (module 72549, 58,314 / 21,314 gz). Also **the full `content/content.json`** (74452, 88,462 / 27,450 gz, all 20 top-level keys including `resume`, `claims`, `legacyDesignV2`, `openQuestions`), an opening-positions list (11995, 6,370), lab-data, the `cast.worker` and `play.worker` loaders, `blocks.ts`, `firstView.ts`, the `lights.ts` patch |
| `0e-wrhqh4h3r5.js` | 140,798 | 38,266 | 32,994 | Next app-router client |
| `0.71nvfk4z5p1.js` | 77,033 | 30,234 | 27,488 | gsap core |
| `0d3shmwh5_nmn.js` | 54,646 | 12,816 | 11,240 | Next layout router and segment runtime |
| `0pqt~8bl3ukh4.js` | 44,414 | 9,197 | 7,975 | Next runtime |
| `0h2_jdjm3rcn7.js` | 32,720 | 9,344 | 8,256 | Next bootstrap (`rootMainFiles`) |
| `0j4n8iobu5npl.js` | 31,337 | 10,302 | 9,243 | lenis (27,577), `@vercel/analytics` |
| `09k2w--w91jtn.js` | 30,029 | 12,067 | 10,818 | **The chess engine** + NNUE types (15,532 / 6,340 gz), **`TessellateModifier`** (3,717; only ch3 uses it), `hallSteps` (5,390), project stage, `warm.ts`, positions |
| `03gr70eoyvr64.js` | 22,173 | 8,945 | 7,995 | `keep.ts`, `trace.ts`, `sweep.ts`, `seam.ts`, `scroll.ts`, `cards`, Next `Link` |
| `turbopack-0g6j-pduhgr_i.js` | 10,580 | 4,159 | 3,743 | Turbopack runtime |
| `0u~yk._pz7a72.js`, `0cj_2vktdgtw~.js` | 2,887 | 1,462 | — | NotFound and PageTransition client refs (layout and template) |
| **Total eager JS** (excluding nomodule) | **1,713,030** | **527,921** | **~437 K** | |
| `03~yq9q893hmn.js` (noModule) | 112,594 | 39,373 | — | legacy polyfills; never fetched by modern browsers |

**Attribution of the eager gzip bytes (528 KB):**

- Framework (React, Next, Turbopack): ~145 KB.
- three: ~145 KB (core + renderer). Needed for the hero; cannot be deferred.
- gsap + lenis: ~40 KB. Needed.
- Hero and shell: ~20 KB.
- **Below the first screen: ~180 KB (34%).**
  - Others + LTC: 108 KB.
  - Lab bundle: 53 KB.
  - Engine chunk: 12 KB.
  - Roles, Work, Contact: ~8 KB.

### 2.2 The questions asked

- **Is all of three in one eager chunk?**
  - No: it is in two, the core at 232 KB and the renderer at 346 KB, and both are eager. The hero needs both for the first screen, so that is correct.
  - The renderer's size is almost all GLSL (`ShaderChunk`/`ShaderLib` are referenced by `WebGLRenderer` itself), so it cannot be tree-shaken.
  - The three core is one hoisted module of 189 exports. Turbopack's default tree-shaking is "reexports-only" (`turbopackTreeShaking: false`, `08-turbopack.md` table). Lighthouse puts 33 KiB of it unused.
- **Unused three addons:**
  - `RectAreaLightUniformsLib`/`TexturesLib`: 103 KB gz, eager, used only by the sideboard (`sideboard.ts:11,119`).
  - `TessellateModifier`: 3.7 KB, eager, used only by Lab ch3 (`cast.ts:7`), which is not on `/`.
  - `RoomEnvironment`, `RoundedBoxGeometry` and `BufferGeometryUtils` are used by the hero.
- **Is the Lab's code loaded on `/`?** Yes, all of it.
  - `Lab.tsx:17` imports `SPECS` from `chapters.tsx`, which statically imports `chapter1`…`chapter7` and `Play` (`chapters.tsx:4-11`). On `/`, `Lab` renders only spec 7 (`Lab.tsx`, `section ? specs.filter(x => x.id === 7)`).
  - ch2, ch3, ch5 and ch6 import `content` from `@/content/site`, which pulls the whole 120 KB `content.json` into the client. `seam.ts:21` states a policy of keeping `content.json` out of the client bundle.
  - **Workers and the opening book are lazy**:
    - `play.worker.ts` is an async worker chunk (`0xhrazif0hl5_.js` + its runtime). It is created only on Start (`game.ts:187`).
    - `cast.worker.ts` is created only by ch3.
    - `public/engine/openings.json` (487 KB) is fetched on the first opening search (`game.ts:213`).
    - The NNUE weights (410 KB) and `nnue.wasm` are fetched in the worker on Start (`play.worker.ts:28-30`).
  - The engine itself (15.5 KB) ships eagerly because `game.ts` (Play) uses `legalPlies`/`playPly`.
- **Only one dynamic `import()`** exists in the app: `NotFound.tsx:22`. Nothing else is code-split below route level.

### 2.3 Other payload

- **HTML for `/`:** 142,675 B raw, 18.8 KB gz, 13.1 KB br.
  - The RSC flight data is 99.6 KB of that.
  - **76 KB is the Lab opening tree** (`lab-tree.json`, 2,009 nodes). It is passed as a prop from the server (`page.tsx` gives `tree={lab.tree}`; `pages.ts:8`).
  - It compresses to ~6 KB gz, but it is re-sent on every visit, because the HTML is `private, no-cache`.
- **Route duplication** (not first-impression, but worth knowing):
  - The renderer chunk exists as three files with identical bytes in a different module order: `026i7n1apz.41.js` (work and roles detail), `07dj.l--eshbe.js` (`/`) and `0rk84riqhcmzg.js` (`/lab`).
  - The Lab bundle exists twice (`063y0._jdsbno.js` and `0zl1imy7-7lal.js`), and the engine chunk three times.
  - So `/` → `/lab` downloads the 82 KB gz renderer again under a new name.

---

## 3. What the "3 s of script evaluation" really is

**Lighthouse's own numbers say it is not parse or compile.** Its table gives `02zumrqfxzwqt.js` 3,105 ms total CPU, **3,026 ms script evaluation and 6 ms script parse**. Parse and compile for the whole page is 180 ms.

**Evaluating the chunk at load is trivial.** Its top level defines classes and builds the `ShaderChunk` string table. Nothing there renders.

**How Lighthouse attributes time.** In Lighthouse 13.5 (`core/lib/tracehouse/main-thread-tasks.js`, `_computeRecursiveAttributableURLs`):

- A `FunctionCall` task is attributed to `args.data.url`, the script that defines the invoked function.
- A `TimerFire` is attributed to the URLs of the task that installed the timer.
- `getExecutionTimingsByURL` adds each task's self time to that URL (`task-summary.js:65-79`).

So any long WebGL call made inside a callback defined in this chunk is billed to the chunk as "script evaluation". That includes `linkProgram`, waits on program completion, `texImage2D` for 2048² shadow maps, and PMREM cube renders.

**Turbopack put the scene scheduler in this chunk.** The chunk's module list (acorn split) includes:

- module 19595/47265 = `src/lib/three/steps.ts` (`ahead`, `run`, `sliced`, `staged`) and `pieces.ts`.
- module 34512 = `src/lib/three/env.ts` (`renderer`, `madeDuring`, the `compileAsync` poller).

`steps.ts` runs every slice from `channel.port1.onmessage` (`steps.ts:33-40`), a function defined in this chunk. `env.ts`'s `compileAsync` polls with `setTimeout(check, 10)` (`env.ts:57-59`), also installed from this chunk. As a result, every slice of the following lands under this URL:

- `stageSteps` (hero),
- `hallSteps` (roles), `gallerySteps` (work), `sideboardSteps` (others),
- `chapter7` (Play),
- **every `warmScenes` pass** (`warm.ts:19` runs through `sliced`),
- every poll of `compileAsync`.

**This matches the trace.**

- The 17 long tasks of 53–123 ms between 1.3 s and 3.1 s are slices that overran their 8 ms budget. A slice cannot stop inside a step, and these steps are heavy:
  - `pm.fromScene(new RoomEnvironment(), 0.04)` renders a cube and runs blur passes, compiling its own programs. It runs once per renderer, in 8 modules: `stage.ts:59`, `hall.ts:108`, `gallery.ts:57`, `sideboard.ts:80`, `kit.ts:44`, …
  - Warm passes upload 2048² shadow maps and compile every material variant.
  - `lengthOf()` (`steps.ts:44`) stretches the budget to as much as 50 ms when frames are slow. During builds frames are slow, so the slices grow exactly when the GPU is busiest.
- In the `/#lab` run there is no opening to wait for, so the hero, Roles, Work, Others and Play were all built and warmed in that window. On a plain `/` load the same seconds of work start when the 8 s opening ends (`firstView.ts:15-31`, `Lab.tsx` `queue()`). That is the start of the visitor's first scroll: the "roles: built" freezes in `00-context.md` §1.
- In three r180, `WebGLProgram.getUniforms()` → `onFirstUse()` calls `getProgramParameter(LINK_STATUS)` and `new WebGLUniforms(gl, program)` synchronously (`node_modules/three/src/renderers/webgl/WebGLProgram.js:918-1024`). Any program drawn before `isReady()` blocks the main thread until the driver finishes linking. That shows up as JS self time.

**Conclusion.** The 3 s is main-thread scene construction and GPU program and texture work, scheduled from this chunk. Hypothesis: the larger share is GPU-sync waits, not JS. This fits the runtime finding that JS inside slow frames is only 2–5 ms (`00-context.md` §2). I have not measured the split per step; a CPU profile of the slices would settle it.

- Splitting or lazy-loading the bundle will not shrink this number.
- Only less work or moving the work will: fewer contexts and programs, no build in the scroll window, or work off the main thread.
- There are 7 WebGL contexts on `/`: hero ×2, hall, gallery, sideboard and Play ×2 (`env.ts:7-9`). Each compiles its own copy of every program and generates its own PMREM environment, because WebGL programs and textures cannot be shared across contexts. That multiplication is architectural.

---

## 4. Fonts, CSS, dynamic rendering, images, caching

### 4.1 Fonts (`src/app/layout.tsx:11-27`, `src/app/fonts/`)

I parsed the three WOFF2 files' tables in node.

| File | Bytes | Glyphs / codepoints | Axes | `gvar` (uncompressed) | `glyf` | Preloaded |
|---|---:|---|---|---:|---:|---|
| `Archivo.woff2` | 119,352 | 499 / 384 | wght 100–900, wdth 62–125 | 299,140 | 49,200 | yes (`Link` header) |
| `Archivo-Italic.woff2` | 134,528 | 499 / 384 | wght 100–900, wdth 62–125 | 338,440 | 56,416 | no (`preload: false`) |
| `JetBrainsMono.woff2` | 53,248 | 750 / 428 | wght 100–800 | 57,198 | 45,952 | yes |

- **The hero opening waits for the roman and mono fonts**, up to 2.5 s (`Hero.tsx:190-191`). That puts 172 KB on the path to the first animated frame.
- The CSS uses these Archivo values:
  - weights 300, 400, 500, 600, 700, 800, 900;
  - `wdth` 80, 100, 108 and 112 (via `font-variation-settings`).
- No CSS value comes near the wdth extremes 62 or 125. The `gvar` table holds deltas for the full design space and is three-quarters of each file.
- Hypothesis, not measured: restricting `wdth` to 80–112 with fontTools `varLib.instancer` (L4 axis-range limiting) cuts the roman file substantially. My estimate is 119 KB → ~70–90 KB.
- The italic is used only at default weight and width (`.op-voice`, ch6 `.voice`, `.tag i`) and at wght 300 / wdth 80 (colophon specimen, `colophon.css:22`). A two-instance or narrow-range italic should be ~25–40 KB instead of 134 KB.
- Codepoints: the subsets carry Latin Extended-A/B (128 codepoints). Content needs Latin-1 plus `ć Ł ź` (opening and game names in `openings.json`/`games.json`), the punctuation `– — ’ “ ” … → − ±` and the arrows `↓ ←`. Trimming to that saves little next to `gvar`, so it is not worth doing on its own.
- **On `/#…` the italic is fetched at once** (`OnePage.tsx:75`: `if (hash || …) italic()`). This is the 2,144 ms critical chain in Lighthouse.

### 4.2 CSS: six render-blocking files

They are loaded per component import order (`page_client-reference-manifest.js` `entryCSSFiles["/page"]`):

| File | Raw | gz | Contents |
|---|---:|---:|---|
| `0unzgu5261mvi.css` | 11,193 | 3,001 | globals + `@font-face` + chrome |
| `05ai-b93sc0sm.css` | 2,814 | 899 | hero |
| `0gwb987~2z_-_.css` | 7,476 | 1,755 | roles |
| `0c_l2wqns_9xb.css` | 6,667 | 1,537 | work + others |
| `0dcw90yt7y.6e.css` | 19,636 | 3,597 | lab |
| `01qqy9hjuiyi8.css` | 5,045 | 1,412 | contact |
| **Total** | **54,661** | **12,801** | |

These are separate files because each section imports its own `.css`. `experimental.cssChunking` (default `true`) only merges where Next can work out the order (`05-config/01-next-config-js/cssChunking.md`).

FCP is 0.4 s and production is HTTP/2, so the cost is one parallel round trip on the first visit. `experimental.inlineCss` would remove it. The docs list the trade-offs: global only, styles duplicated into the RSC payload, and no separate caching (`inlineCss.md`). The HTML is already `no-cache`, so inlining 12.8 KB gz into every response is a net loss for returning visitors. **Low priority.**

### 4.3 `await connection()` and the CSP nonce

**What it does.**

- `layout.tsx:44` calls `await connection()`. `proxy.ts` sets a per-request nonce and `Cache-Control: private, no-cache` (`proxy.ts:22-31`).
- The prerender manifest lists only the icons, so every page, `/` included, is server-rendered per request.

**What the docs say.** The Next 16 CSP guide (`02-guides/content-security-policy.md`, "Static vs Dynamic Rendering with CSP") confirms that nonces require dynamic rendering, disable static optimisation and CDN caching, and are incompatible with PPR.

**Measured on localhost:**

- TTFB 58 ms (identity encoding) and 123 ms (gzip).
- Lighthouse saw 128–170 ms. Its "Document request latency" audit passed.

**Hypothesis, unmeasured:** in production on Vercel, a cold serverless render adds hundreds of ms that a static, CDN-cached page would not have.

**The alternative the docs offer** is `experimental.sri` with a static CSP header. It "allows you to maintain static generation", and the Turbopack build path supports it (`build/turbopack-build/impl.js:125`).

- Caveat: App Router emits inline `self.__next_f.push(...)` scripts, and the docs' SRI example CSP has no `'unsafe-inline'` and no hashes. This must be verified on a build before adopting. It is also a security-policy decision (brief §4.7) for the owner.
- First-impression impact is modest: TTFB only. The 8 s opening dominates what the visitor perceives.

**Proxy on static assets.**

- The matcher is `/:path*` (`proxy.ts:36`). The build's `functions-config-manifest.json` confirms a Node.js proxy matching every path.
- So every `_next/static` request, about 25 on a first load, goes through the proxy first. It exits early through the `ASSET` regex, but it still runs.
- The proxy docs say Proxy "will be invoked for every route" and recommend excluding `_next/static`, `_next/image` and similar through the matcher (`03-file-conventions/proxy.md`, "Matcher"; the CSP guide's matcher example).
- `SECURITY_HEADERS` are already applied to `/:path*` through `next.config.ts` `headers()`, so excluding static paths from the proxy loses nothing.
- `ASSET` does not match `.m4a`. The `/sound/*.m4a` files therefore get a nonce and `private, no-cache` (measured with a HEAD request).

### 4.4 Images in `public/`

- Nothing in `public/` loads on `/`.
- The covers (`public/work/*/cover.webp`) are used only by `Study.tsx:50` through `next/image` on project pages.
- The `og/*.jpg` files are meta only.
- The "Improve image delivery" audit passed.

### 4.5 Caching headers (measured with HEAD)

| Asset | Cache-Control | Note |
|---|---|---|
| `/_next/static/**` | `public, max-age=31536000, immutable` | good |
| `/` (HTML) | `private, no-cache` | required by the nonce |
| `/engine/openings.json` (487 KB), `/engine/*.bin`, `nnue.wasm` | `public, max-age=0` | Revalidated on each use. Not on the first-impression path (Play only). |
| `/sound/*.m4a` | `private, no-cache` | Comes from the proxy (the regex misses `.m4a`). Only fetched when sound is turned on. |

Text compression: gzip only on `next start`. Vercel adds br, which saves a further ~17% on JS.

---

## 5. Recommendations, ranked by impact on the first impression

The first impression means time to a smooth, interactive first screen plus a smooth first scroll. Savings are computed from the numbers above unless marked as hypotheses. None of these changes alter the look, except where flagged.

### R1. Treat the "3 s" as architecture, not bundle size. Highest impact.

**Problem.** §3 shows the cost is scene construction and GPU program work run through `steps.ts`/`warm.ts`/`env.ts`. On `/` it starts as the opening ends, right when the visitor scrolls.

**Options from the load side.** The runtime and GPU auditors own the detail.

- **(a) One shared WebGL context.** Render all sections into one canvas through scissor and viewport, with a section → viewport mapping (the drei `View` pattern, the laian.dev approach).
  - Today each program and each PMREM environment is built up to 7 times on `/`, once per context.
  - One context compiles each material variant once and generates one PMREM.
  - Expected: the shader-compile and PMREM part of the 3 s shrinks roughly in proportion to the context count. Hypothesis; the per-step split is unmeasured.
  - Effort: XL. Risk: high (keep.ts, sleeper and seam layering all assume per-section canvases).
  - Visual: none if done right.
- **(b) Move the work off the main thread.** Build and render in a worker with `canvas.transferControlToOffscreen()` (three supports OffscreenCanvas).
  - Compile stalls and `setSize` stalls then block the worker, not scroll or input.
  - Effort: XL. Risk: high (DOM-driven tags, gsap timelines and IntersectionObservers would need a message bridge).
- **(c) At minimum, do every build and warm while the scroll is locked by the opening**, then never during the first scroll.
  - The opening's own frames would hitch. That trade-off was rejected before (`firstView.ts:21-23`), so this needs the owner's judgement.
  - Alternatively, make the opening light enough that builds can run beside it.
  - Effort: M. Risk: the opening's smoothness.

### R2. Lazy-load the sideboard's LTC tables. -103 KB gz eager. Effort S–M, no visual cost.

- `RectAreaLightUniformsLib` is 248 KB raw / 102.6 KB gz of numeric literals. It is the largest single item on `/` after three and React, and it is used five screens down (`sideboard.ts:11,119`).
- **Fix:** move `sideboard.ts`, or just the `RectAreaLightUniformsLib` import, behind `import()`. `steps.ts` already lets a step yield a promise (`steps.ts:4-7`), so `sideboardSteps` can `yield import(...)` before `init()`.
- Kick the import off from `buildAhead`'s idle slot. The `staged.now()` fallback runs straight through without awaiting, so it must check that the module has arrived. If it has not, defer the build one frame rather than building without the panel light. Otherwise the look would change.
- **Saves:** 19% of eager gzip JS. That is ~0.08 s at Lighthouse desktop throughput (10 Mbps) and ~0.5 s on slow 4G (1.6 Mbps) before hydration, so before the hero stage build can start.
- Hypothesis: a few ms of parsing 50k-element array literals at startup is also saved.
- Docs: `02-guides/lazy-loading.md`, "Loading External Libraries" (`import()` in a client component). `next/dynamic` is not needed because this is a library, not a component.

### R3. Ship only the Lab section's code on `/`. -~60 KB gz eager on `/`. Effort M, no visual cost.

- `chapters.tsx` statically imports ch1–ch7, so `/` carries all seven chapters plus `content.json` (27 KB gz), `TessellateModifier` and the cast-worker loader.
- **Fix:**
  - (1) Give the one page a spec list with only ch7. For example, `/lab` imports `chapters.tsx`, while `section` mode imports a `chapters-section.ts` holding `chapter7` and `Play`. Or make ch1–ch6 `() => import("./chN")` factories, which also lets `/lab` stream them.
  - (2) Stop importing `content` from `@/content/site` in client chapter modules (ch2:8, ch3:9, ch5:11, ch6:10). Pass the copy as props from the server, as the other sections do. This is the policy already stated in `seam.ts:21`.
- **Saves on `/`:**
  - `content.json` 27.5 KB gz.
  - ch1–ch6, ~15–20 KB gz (estimate: the hoisted Lab module is 21 KB gz with all seven).
  - Tessellate 1.5 KB.
  - The worker-loader stubs.
- `/lab` also benefits: it currently downloads the same 88 KB `content.json`.
- Docs: `lazy-loading.md`. For components, `next/dynamic` server-renders by default (`ssr: true`) and preloads the chunk (`shared/lib/lazy-dynamic/loadable.js`, `preload-chunks.js`). Play needs that, so keep Play static and lazy-load only the chapter factories, which are plain generator functions, through `import()`.

### R4. Instance the Archivo fonts. -~30–50 KB on the opening's critical path, -~100 KB italic. Effort S–M, no visual cost if the ranges cover the values used.

- **Roman:** limit `wdth` to 80–112 and `wght` to 300–900 with `fonttools varLib.instancer` (L4 range limiting). Hypothesis: 119 → ~70–90 KB. The opening waits for this file (`Hero.tsx:190`).
- **Italic:** instance to the two styles used (default, and wght 300 / wdth 80). Hypothesis: 134 → ~25–40 KB.
- Also stop fetching the italic at once on hash arrivals (`OnePage.tsx:75`) unless the target section uses it. Only `#lab` does, and there only in the one `.op-voice` line.
- No Next API change: `next/font/local` keeps working with the new files (`02-components/font.md`).
- Visual check needed: render the colophon specimen and the `wdth` 108/112 display lines before and after.

### R5. Exclude static assets from the proxy matcher. Effort S, no visual cost.

- Use a negative-lookahead matcher per the proxy and CSP docs, for example `'/((?!_next/static|_next/image|engine/|sound/|favicon.ico|icon|apple-icon).*)'` with the `missing` prefetch-header conditions from the CSP guide. Keep the canonical-host redirect for page paths.
- **Saves:** one proxy invocation per static request (about 25 on a first load).
- Locally that is negligible. On Vercel it removes a middleware hop from every chunk and font request; the size of that saving is a hypothesis.
- Also fixes `.m4a` getting `private, no-cache`.

### R6. Decide static vs nonce rendering. Effort M, security trade-off: owner decision.

- Option: `experimental.sri` plus a static CSP lets `/` be prerendered and CDN-cached (CSP guide, "Subresource Integrity").
- First verify on a build that inline flight scripts pass the CSP.
- **Saves:** dynamic-render TTFB on every visit, and cold starts on Vercel. The size is a hypothesis.

### R7. Low impact: worth doing once the above are in

- **Move the Lab tree out of the RSC payload.** Import `lab-tree.json` in the client module so it is cached immutably with the chunk. This removes 76 KB raw / 6 KB gz from every HTML response. Effort S.
- **Forced reflows.** `restColours` interleaves `getBoundingClientRect` and `getComputedStyle` per line (`seam.ts:137-138`): read everything first, then write. The sleeper's per-scroll `getBoundingClientRect` (`keep.ts`) can use the IntersectionObserver entries it already has. Total ~70 ms. Effort S.
- **`turbopackTreeShaking: true`** (experimental, `08-turbopack.md`) could drop some of the 33 KiB of unused three core. Risk: experimental flag.
- **`renderer.debug.checkShaderErrors = false` in production.** three's own docs suggest it for performance (`WebGLRenderer.js:141-145`). It removes three info-log calls per program at first use. `WebGLUniforms` still blocks if a program is not linked yet, so the gain is small; awaiting `compileAsync` before first draw matters more (R1).
- **Cache headers for `/engine/*` and `/sound/*`** through `next.config.ts` `headers()`. These files are not content-hashed, so use something like `max-age=86400, stale-while-revalidate`. Not first impression.

### Not worth doing

- **"Minify JS 110 KiB":** an extension artefact. First-party chunks are minified, with less than 3% estimated savings each.
- **"Legacy JS 13 KiB":** a 0.6 KB gz Next-internal polyfill module that cannot be configured away.
- **"Unused JS 574 KiB":** only 58 KiB is first-party, and most of that is three core and react-dom, which are needed.
- **Splitting the three renderer chunk further:** it is needed for the first screen, and 87% of it is GLSL that `WebGLRenderer` references.
- **Inlining CSS:** FCP is already 0.4 s, and the HTML is not cacheable (see §4.2).

---

## Evidence index

- **Chunk-to-module maps:** `/tmp/split.cjs`, which walks the acorn AST of `TURBOPACK.push([...])`.
- **Module identity by export:**
  - 8560 exports `PMREMGenerator`, `ShaderChunk`, `UniformsLib`, `WebGLRenderer`.
  - 31935 exports `RoomEnvironment`.
  - 47265 exports `ahead`, `run`, `sliced`, `staged`.
  - 34512 exports `madeDuring`, `renderer`.
  - 70884 exports `Others`.
  - 72549 exports `Lab`.
  - 74452 is `content.json` (keys `meta`…`openQuestions`).
  - 56843 is the engine (`ARCH_128`, `INPUT_FEATURES`).
  - 82593 is `TessellateModifier` (`maxEdgeLength`).
- **Sizes:** node `zlib.gzipSync` (level 9) and `brotliCompressSync` on `.next/static/chunks/*`.
- **Eager list:** `/tmp/home.html` (one GET, 2026-10-19), `.next/diagnostics/route-bundle-stats.json` and `.next/server/app/page_client-reference-manifest.js`.
- **Lighthouse internals:** `~/.npm/_npx/ffe2131771d88588/node_modules/lighthouse/core/`. Specifically `lib/tracehouse/main-thread-tasks.js` (attribution), `lib/tracehouse/task-summary.js`, `lib/tracehouse/task-groups.js`, and `audits/byte-efficiency/unminified-javascript.js` (thresholds).
- **Next 16 docs:**
  - `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`
  - `02-guides/content-security-policy.md`
  - `03-api-reference/03-file-conventions/proxy.md`
  - `03-api-reference/04-functions/connection.md`
  - `03-api-reference/05-config/01-next-config-js/cssChunking.md`
  - `03-api-reference/05-config/01-next-config-js/inlineCss.md`
  - `03-api-reference/08-turbopack.md`
  - `03-architecture/supported-browsers.md`
