# 02: GPU and 3D scene architecture audit

Auditor: GPU / scene architecture. Static analysis of `src/` at the committed state and of three r180 in `node_modules/three` (`src/constants.js:1`, `REVISION = '180'`). I did not drive a browser.

Mesh, triangle and material counts below come from headless scripts. They import the real `piece()`, `SCULPTURE` and content JSON and build the geometry in Node. The scripts are in `docs/perf-audit/.gpu-scratch/count{,2,3,4}.ts`. Rerun with `npx tsx --tsconfig ./tsconfig.json docs/perf-audit/.gpu-scratch/countN.ts`.

**Labels.** "Measured" means a number from `00-context.md` or one of these scripts. "Model" means my estimate from shader and source reading. It is a hypothesis until the runtime auditor checks it.

---

## 0. Summary

The stutter on the first pass comes from GPU fill and pass count, and the architecture multiplies it.

- **The arrival bursts.** Each section's arrival re-renders a full 6.9 MP canvas every frame for 1.6–1.8 s, through heavy shaders:
  - the day hall evaluates **9 analytic lights plus IBL on every pixel**;
  - the sideboard renders the whole scene **twice per frame**, because of transmission, and adds an LTC area light.
- **Hidden concurrency.**
  - A canvas that is half on screen still shades all of its pixels.
  - The hero keeps drawing both of its canvases, with shadow passes and about 1,000 draws, at 30 fps while any sliver of it is visible.
  - Seven separate contexts each hold an MSAA buffer and their own programs. The sleeper resizes them, and every resize is a measured 80–230 ms stall.

**Easy wins with no change to the look.** Several large savings change no pixel:
- the spot-skip patch is missing from the hall and the gallery;
- the sideboard's ~1,140 draws are mostly 268 tiny brass meshes drawn three times each;
- merged geometry is left un-indexed, which inflates vertex work about 5.8×;
- static shadow maps are re-rendered every frame.

**Target architecture.**
- One renderer on one fixed canvas, with per-section viewport and scissor and a stencil seam.
- Dynamic resolution through an internal render target, so the canvas never resizes.
- The material and light reductions above.
- The owner decides on the few changes that alter the look (§5).

---

## 1. Facts common to every scene

| Property | Value | Evidence |
|---|---|---|
| Context per canvas | `new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })` | `src/lib/three/env.ts:27` |
| Pixel ratio | `min(devicePixelRatio, 2)`. At 1728×996 CSS that is 3456×1992 = 6.88 MP per full-screen canvas | `env.ts:33` |
| MSAA | `antialias: true` gives a multisampled default framebuffer plus a resolve each frame. About 230 MB per canvas at 2× (the code's own figure) | `env.ts:27`, `src/lib/three/keep.ts:49` |
| Alpha | Every canvas is `alpha: true`, so the compositor must blend each one even where the scene paints an opaque background (hall, gallery, sideboard, Lab) | `env.ts:27`, e.g. `hall.ts:107`, `gallery.ts:55` |
| Tone mapping | ACES Filmic, applied in each material's fragment shader (no extra pass) | `env.ts:34` |
| Shadows | `shadowMap.enabled = true`, `type = PCFSoftShadowMap`, `autoUpdate` left at three's default `true` unless a scene sets it | `env.ts:35`, `three/src/renderers/webgl/WebGLShadowMap.js:66,75` |
| Shadow sampling | PCFSoft is **16** `texture2DCompare` per shadowed light per pixel, each an RGBA8 fetch plus an unpack. PCF is **17**. Plain PCF is not cheaper in r180 | `three/.../ShaderChunk/shadowmap_pars_fragment.glsl.js:68-81,131-162,164-198`, `WebGLShadowMap.js:24` (RGBA depth packing) |
| `shadow.radius` | **Ignored under PCFSoft.** Only the PCF and VSM branches read `shadowRadius`. Every `shadow.radius = 5..9` in the codebase does nothing | `shadowmap_pars_fragment.glsl.js:135-138` vs `164-198`; e.g. `hall.ts:112`, `gallery.ts:87`, `sideboard.ts:118` |
| Lights per fragment | three unrolls a loop over every light of each type in every lit material. A spot at intensity 0 still runs `getSpotLightInfo` and the full `RE_Direct` BRDF. There is no early-out | `ShaderChunk/lights_fragment_begin.glsl.js` (spot loop), `lights_pars_begin.glsl.js:143-166` |
| Physical cost per light | Clearcoat adds a second GGX lobe per light. Sheen adds a sheen BRDF per light | `lights_physical_pars_fragment.glsl.js:485-499` |
| Environment | Each renderer builds its own PMREM from `RoomEnvironment`. That is a build-time GPU job, repeated in every context because contexts cannot share textures | `stage.ts:59`, `hall.ts:108`, `gallery.ts:57`, `sideboard.ts:80`, `lab/kit.ts:44` |
| Transmission | Any material with `transmission > 0` makes three render **every opaque object again** into a full-viewport, **4× MSAA, HalfFloat** render target. It then resolves and **regenerates mipmaps every frame** | `three/src/renderers/WebGLRenderer.js:1649,1859-1870 (samples: 4 at 1865, HalfFloat at 1863),1887,1919-1922` |
| Spot-skip patch | `patchSpots` wraps each spot in `if (spotLight.color != vec3(0))`, so the GPU skips dark spots. **Only the sideboard and ch4 use it** | `src/lib/three/lights.ts:12-29`; used at `sideboard.ts:153`, `ch4.ts:51` |

**Geometry per piece** (measured, `count.ts`/`count4.ts`). Full detail, then LOD:

| Piece | Meshes (full) | Tris (full) | Tris (LOD) | Notes |
|---|---|---|---|---|
| P | 3 | 19,552 | 7,992 | lathe at 96 segments (`pieces.ts:152`), ball sphere 48×32 (`:153`) |
| N | **19** | **78,856** | 27,534 | 28-ring head (`:74`), 11 mane spheres 24×16 (`:98`), 2 eyes, 2 mouth tubes (`:103`), collar lathe 96 (`:178`) |
| B | 4 | 31,056 | 10,656 | groove tube 80×8 (`:158`) |
| R | 3 | 29,032 | 13,120 | |
| Q | 12 | 28,352 | 12,168 | 8 coronet points as separate meshes (`:162`) |
| K | 4 | 23,596 | 7,412 | |
| Full 32-piece set | 184 | **972,504** | | `count3.ts` |

Each bishop groove and knight mouth calls `MAT.dark()`, which makes a **new material** every time (`pieces.ts:103,158,125`). That defeats material grouping wherever meshes are merged by material, as in the hall's bake.

---

## 2. Per-scene inventory

Cost model: "light units" per shaded pixel. 1 unit is one Standard direct-light BRDF, about the ALU of one GGX plus Lambert. The other weights:

| Term | Units |
|---|---|
| Clearcoat | +0.6 per light |
| PCFSoft shadow lookup | +1 per shadowed light |
| IBL | about 1.5 |
| RectArea LTC | about 3 |
| Skipped spot | about 0.1 |

The index is shaded MP × units, before MSAA resolve and compositing. **It is a model, not a measurement.** It ranks the scenes. It does not give milliseconds.

### 2.1 Hero (`src/components/hero/stage.ts`)

| Item | Value |
|---|---|
| Canvases / contexts | **2** (day and night), one scene drawn twice (`stage.ts:57-58,202-203`). Each is full-screen at 6.88 MP. The night canvas is CSS-clipped to the seam polygon (`hero.css:10`) but **renders all of its pixels** |
| Meshes | 64 RoundedBox tiles (588 tris each, `stage.ts:85`) + 8 frame parts + 32 **full-detail** pieces (`stage.ts:103`) = **256 meshes** |
| Shadow casters | **All 256.** `add()` forces `castShadow = true` on every mesh, including felts and grooves that `piece()` had turned off (`stage.ts:82`) |
| Shadow lights | Day: sun DirectionalLight 2048² (`:65-66`). Night: SpotLight 2048² (`:67-68`). `autoUpdate` is default, so **re-rendered every frame on both canvases** |
| Lights per fragment | Day: hemi + dir(sh) + IBL. Night: spot(sh) + 2 dir (`floatKey`, `rim`) + point (`amber`) + hemi + IBL (`:64-72`) |
| Materials | Tiles, frame and pieces are all MeshPhysical with clearcoat (`:75-78`, `pieces.ts:119-120`) |
| Tris per pass | about 1.01 M. About **4 M tris per frame** (2 canvases × main + shadow) |
| Draw calls per frame | Model: 256 × (main + shadow) × 2 canvases = **about 1,024** |
| When it draws | The opening runs about 8 s at 60 fps with scroll locked (`Hero.tsx:181`). Then the **idle bob runs at 30 fps whenever any pixel of the hero intersects the viewport** (`Hero.tsx:123-135`, IO at `:135`) |
| Index | Day ≈ 6.88 × ~35% coverage × 4.8 ≈ 12. Night ≈ 6.88 × ~35% × 9.5 ≈ 23. About **35 per frame idle**, about 70 during the opening when the board fills the frame. Add about 1,024 draws and about 4 M tris |

### 2.2 Roles: the day hall (`src/components/roles/hall.ts`)

| Item | Value |
|---|---|
| Canvases | 1, full-screen (`roles.css:4`) |
| Meshes | Room: floor, wall, 7 window panes (`hall.ts:114-118`). Each table is baked by material (`hall.ts:83-101`): about 14–20 merged meshes per table, swollen by the per-piece `MAT.dark()` materials. Model total about 140. **Measured about 120 draws per frame** |
| Shadow lights | One sun DirectionalLight at **4096²** (`:111-113`). `autoUpdate = false`, drawn on the first 3 frames only (`:152-153,178`) |
| Lights per fragment | hemi + sun(sh) + **7 SpotLights** (the table lamps, `:130-131`) + IBL. The lamps sit at intensity 0 unless a name is hovered (`:176`), but **the hall does not use `patchSpots`** (imports at `:6-14`). So every pixel of the 6.88 MP frame evaluates 7 dark spots |
| Materials | Floor, wall, tables and chairs: Standard. Pieces: Physical clearcoat ivory and ebony (`:70`) |
| Geometry | Pieces are LOD. Measured: **1.81 M tris** across the 7 sets (`count2.ts`). `bake()` makes everything non-indexed (`hall.ts:89`), so the vertex shader runs **about 5.4 M times per frame** for pieces that are a few dozen pixels tall. Re-indexing would make it about 0.93 M (merged ratio 5.2–6.0×, `count4.ts`) |
| When it draws | Its arrival: a gsap timeline that calls `render()` every frame for **1.8 s** (`RolesIndex.tsx:70-71`). Also on hover (0.7 s tweens, `:92-99`) |
| Index | 6.88 × (hemi 0.2 + dir 2 + 7 spots × ~1.1 + IBL 1.5 + clearcoat on pieces) ≈ 6.88 × 13.5 ≈ **93**, the highest per-pixel cost on `/`. Plus 5.4 M vertex invocations |

### 2.3 Work: the gallery (`src/components/work/gallery.ts`)

| Item | Value |
|---|---|
| Canvases | 1, full-screen (`work.css:4`) |
| Meshes | Floor + 64 tiles + 3 plinths + 3 sculptures (5 + 19 + 5 meshes) = 97 (`:62-84`) |
| Shadow casters | 3 plinths + all 29 sculpture meshes. `castShadow` is forced on every sculpture mesh (`:81`) |
| Shadow lights | **3 SpotLights at 2048²** (`:85-88`). `autoUpdate` is never turned off, so **3 shadow passes every frame** even though nothing in the room moves |
| Lights per fragment | hemi + ambient + 3 spot(sh) + IBL (`:59`). No `patchSpots` |
| Materials | Floor, tiles and plinths: Standard. FaultLine: Physical with clearcoat and sheen (`pieces.ts:121`). Teleportal: Standard aluminium. CircuitMind: Standard basalt with roughnessMap and bumpMap (`pieces.ts:123`) |
| Tris | About 153 k sculpture tris (`count.ts`), each seen by about one spot's shadow frustum |
| Draw calls | Model: 97 main (some frustum-culled) + about 33 shadow (each narrow spot sees mostly its own piece). **Measured about 135** |
| When it draws | Arrival timeline of **1.8 s**: camera, room.k and lights (`WorkIndex.tsx:85-94`). Hover tweens of 0.4 s |
| Index | 6.88 × (0.4 + 3 × 1.3 + shadow when inside a cone + IBL 1.5) ≈ 6.88 × 6.5 ≈ **45** |

### 2.4 Others: the sideboard (`src/components/work/sideboard.ts`)

| Item | Value |
|---|---|
| Canvases | 1. The section is `max(100vh, 860u)` tall (`work.css:51-52`) |
| Meshes (measured) | Floor, table, 64 tiles + frame (`:84-88`), and 7 sculptures: veridian 3, **mirrorfi 19**, risk 19, leadScorer **31** (30 slices, `sculptures.ts:100-110`), **graphRag 268** (one brass material, `sculptures.ts:112-130`), distillation 8, rexcheck 4. That is **352 sculpture meshes, about 419 in all** |
| Shadow casters | 334 sculpture meshes + table + frame = about 336 (piece defaults; graphRag sets `castShadow` on every node and edge, `sculptures.ts:119,122`) |
| Shadow lights | One lamp SpotLight at 2048² (`:116-118`). `autoUpdate` is default, so **re-rendered every frame** |
| Lights per fragment | hemi + lamp spot(sh) + 7 narrow spots (skipped at intensity 0 by `patchSpots`, `:111-113,153`) + **RectAreaLight** (LTC: 2 LUT fetches plus 4-edge integration on every lit pixel, `:119-120`; `lights_physical_pars_fragment.glsl.js:439-470`) + IBL |
| Materials | Physical clearcoat: ash, ivory (×31 slices), obsidian. **Transmission:** `blackGlass` (mirrorfi, transmission 0.82, clearcoat 1) and `glass` (distillation, transmission 1) (`sculptures.ts:84-90`) |
| Passes per frame | (1) shadow: about 336 draws. (2) **Transmission pass: every opaque object again**, about 400 draws, at full canvas resolution into a 4× MSAA HalfFloat target, then a resolve and a full mip chain (`WebGLRenderer.js:1859-1922`). (3) Main: about 419 draws |
| Draw calls | Model: 336 + ~400 + ~419 ≈ 1,155. **Measured about 1,140.** graphRag alone is about 268 × 3 ≈ **800 of them** |
| Tris per pass | About 305 k (`count.ts`), × 3 passes |
| When it draws | Arrival timeline of **1.6 s** (`Others.tsx:78-82`). Hover tweens (`:105-110`) |
| Index | 6.88 × (0.2 + 2.3 + 0.7 + 3 LTC + 1.5) ≈ 6.88 × 7.7 ≈ 53 per pass. The transmission pass shades the floor, table and board again, so about **2 × 53 ≈ 106**. Add the mip chain of a 6.9 MP RGBA16F target, the 4× resolve, and about 1,140 draws |

### 2.5 Lab section on `/`: Play (`src/components/lab/ch7.ts`)

| Item | Value |
|---|---|
| Canvases | **2** (day and night) full-screen (`lab.css:46`). Night is clipped by `.seam-dark` (`shell.css:5`) but renders full |
| Meshes per side | Floor + board (64 + 1, `board.ts:26-31`) + 32 full-detail pieces (184 meshes, `ch7.ts:93`) ≈ 250. Shadow casters about 141 |
| Shadow lights | Day: dir 4096². Night: spot 4096² (`ch7.ts:66-69`). `autoUpdate` default |
| Lights per fragment | hemi + key(sh) + IBL |
| Materials | Physical clearcoat pieces, Standard board |
| Draw calls per render | About 391 per side, **about 782 per render**. About 3.9 M tris |
| When it draws | Only on change (`ch7.ts:89-90`, `Lab.tsx:142-153`): first sight, a wake, a move. **Not every scroll frame** |
| Index | 2 × 6.88 × ~4.5 ≈ **62** per render, but rarely drawn |

### 2.6 `/lab` chapters (`src/components/lab/ch1..ch6.ts`, `kit.ts`)

Each chapter has one or two full-screen canvases (`chapters.tsx:13-20`, `kit.ts:41-48`). While its section is pinned it is **re-rendered on every scroll frame in which its progress changed** (`Lab.tsx:142-153`).

| Ch | Canvases | Shadow lights | Lights per fragment | Notable cost | Index |
|---|---|---|---|---|---|
| 1 | 2 | Day dir **4096²** (`ch1.ts:33-35`). Night spot 2048² (`:60-61`). autoUpdate on | Day hemi + dir. Night key spot + rim spot | 64 columns in Physical clearcoat (+ sheen porcelain, `:38`). Learned knight with 38 meshes (`count.ts`) | ≈ 70 |
| 2 | 2 | Key **4096²** per side (`ch2.ts:62-68`) | hemi + key | Day sheets use a 6-material array, so each InstancedMesh is 6 draws per pass (`:73-77`). 16 transparent DoubleSide planes and lines (`:84-89`) | ≈ 55 |
| 3 | 1 | Key dir **4096²** (`ch3.ts:75-77`) | hemi + key + fill dir | 3 knights (19 meshes each), worker-roughened geometry | ≈ 35 |
| 4 | 2 | **Two 8192² maps**, about 0.5 GB each with colour plus depth (`ch4.ts:90`). `autoUpdate = false` but **dirty on every scroll frame while pieces drop or hop** (`:122,160,171`) | hemi + key + 1 pool spot moved per pixel (`:46-59,99`) | **1,599 pieces** (`count3.ts`), LOD: **18.6 M tris per pass**. Non-indexed merge (`:35`) makes it **55.8 M vertex invocations per pass**. × (main + shadow) × 2 sides ≈ **220 M vertex invocations per scroll frame** | Geometry-bound. **The heaviest frame in the site** |
| 5 | 2 | Key **4096²** (`ch5.ts:73-76`) | hemi + key + rim dir | 128 stones of 2,208 tris (`:65`). Porcelain (clearcoat + sheen) and Physical clearcoat (`:80-84`) | ≈ 70 |
| 6 | 1 | **6 SpotLights, each a 2048² shadow** (`ch6.ts:37-38`). autoUpdate on, and they move with the scroll (`:63`) | hemi + **6 spot(sh)** + IBL | 6 shadow passes per frame. Every pixel pays 6 BRDFs plus up to 6 × 16 shadow fetches | ≈ 105 |

---

## 3. Per-scene cost table (one page `/`, desktop 1728×996 at DPR 2)

| Scene | Canvases × MP | Draws / frame | Shadow passes / frame (map) | Analytic lights / px | Physical? | Transmission | Tris / frame | Draws during first pass | Index (model) |
|---|---|---|---|---|---|---|---|---|---|
| **Sideboard** | 1 × 6.88 | **~1,140** measured | 1 (2048², every frame) | 2 live + 7 skipped + **RectArea** + IBL | Yes (clearcoat) | **Yes: second full scene pass + mips** | ~0.9 M | 1.6 s arrival at 60 fps | **~106** + 1,140 draws |
| **Day hall** | 1 × 6.88 | ~120 measured | 0 (4096², frozen) | **9 (7 dark spots unskipped)** + IBL | Pieces | No | **5.4 M vertex invocations** | 1.8 s arrival at 60 fps | **~93** + vertex |
| **Hero** | **2** × 6.88 | **~1,024** model | **2** (2048², every frame) | Day 2 + IBL. Night 5 + IBL | **Everything** | No | **~4 M** | 30 fps idle while any of it is visible, **overlapping Roles' arrival** | ~35 idle (×2 canvases), ~70 in opening |
| **Play** | **2** × 6.88 | ~782 model | 2 (**4096²**) per render | 2 + IBL | Pieces | No | ~3.9 M | On first sight and on wake (plus a resize stall) | ~62 per render |
| **Gallery** | 1 × 6.88 | ~135 measured | **3** (2048², every frame, static scene) | 5 + IBL | One piece | No | ~0.3 M | 1.8 s arrival at 60 fps | ~45 |

Rank by per-frame GPU cost while drawing: **Sideboard > Hall > Hero (both canvases) ≈ Play > Gallery.**

Rank by first-pass impact, weighted by how long and how concurrently each draws: **Hall and Hero overlap**, then **Sideboard**, then **Gallery**, then Play.
- The hall's arrival starts while the hero is still partly on screen and drawing both canvases at 30 fps.
- The gallery and sideboard arrivals can overlap on a fast scroll. Both trigger at a 0.3 threshold (`WorkIndex.tsx:82`, `Others.tsx:90`).

On `/lab`: ch4 is in a class of its own (geometry), then ch6, then ch1 ≈ ch5, ch2, ch3.

**Agreement with measurements.** The model's draw counts match the measured ones: hall 120 against ~140 modelled, gallery 135 against ~130, sideboard 1,140 against 1,155.

The measured responses fit a mix of fill-bound and resolution-independent cost:
- **DPR 1.5 cut slow frames by only 25–40%.** DPR 1.5 removes 44% of the pixels, so a purely fill-bound frame would improve more.
- **Freezing shadows barely helped.** Of the scenes drawing on `/`, only the sideboard, gallery and hero have live shadow passes, and those passes are geometry-light.

The resolution-independent remainder is a hypothesis:
- the GPU-process and ANGLE cost of about 1,000 draws per frame (sideboard, hero);
- mip generation of the transmission target;
- the hall's 5.4 M vertices;
- compositing several full-screen alpha layers, two of them clip-path masked.

None of these show in a renderer-process JS profile, which fits "JS is 2–5 ms in 33–58 ms frames". **The runtime auditor should confirm this with a GPU-process trace** (`chrome://tracing`, categories `gpu`, `viz`, `ANGLE`).

---

## 4. Ranked root causes

1. **Arrival animations re-render full-resolution, fill-heavy scenes every frame, and partly visible canvases shade 100% of their pixels.**
   - Each arrival is a gsap timeline with `onUpdate: draw` for 1.6–1.8 s (`RolesIndex.tsx:70`, `WorkIndex.tsx:85`, `Others.tsx:78`).
   - At a section boundary, two or three canvases are partly visible and each one shades its full 6.88 MP. Hero day + hero night + hall is **20.6 MP** of shading for one screen of visible pixels.
   - This is architectural: separate full-screen canvases cannot shade only their visible part.

2. **The two most expensive shaders on `/` carry avoidable per-pixel work.**
   - **Hall:** 7 dark spot lights evaluated everywhere (`hall.ts:130-131`, no `patchSpots`). That is about 55% of its per-pixel light work, and removing it changes no pixel.
   - **Sideboard:** transmission forces a second full-scene render into a 4× MSAA HalfFloat target, with mips, every frame (`sculptures.ts:86,89`; `WebGLRenderer.js:1859-1922`). The RectAreaLight adds LTC on every pixel of both passes (`sideboard.ts:120`).

3. **The hero keeps drawing in the background.**
   - The idle bob draws **both** canvases at 30 fps, each with a live shadow pass (`Hero.tsx:126-133`, `stage.ts:202-203`).
   - It does so while the hero is even 1 px on screen (`Hero.tsx:135`). That is exactly when the hall's arrival runs.
   - Every hero frame is about 1,024 draws and about 4 M tris.

4. **Draw-call volume from unmerged static sub-meshes.**
   - Sideboard: graphRag's 268 meshes × 3 passes ≈ 800 of 1,140 draws (`sculptures.ts:112-130`). leadScorer's 30 slices make another ~90.
   - Hero: 256 meshes × 4 passes.
   - The cost lands in the GPU process (ANGLE validation, uniform upload per Physical draw), not in renderer JS. This is a hypothesis to confirm with a GPU-process trace.

5. **Seven WebGL contexts.**
   - Seven MSAA framebuffers, about 1.6 GB at 2× (`keep.ts:58-61`).
   - The sleeper resizes canvases to manage that memory, and each resize stalls for a measured 80–230 ms (`keep.ts:63-66`, `00-context.md` item 4).
   - Each context compiles the same Physical programs and builds its own PMREM. Each uploads the same piece geometry again.
   - The compositor blends one alpha layer per canvas. The hero night and Play night are also clip-path masked (`hero.css:10`, `shell.css:5`).

6. **Wasted vertex work from non-indexed merges.**
   - `toNonIndexed()` before `mergeGeometries` with no `mergeVertices` afterwards multiplies vertex invocations 5.2–6.0× (measured, `count4.ts`).
   - The hall pays 5.4 M per frame where 0.93 M would do (`hall.ts:89`).
   - ch4 pays 55.8 M per pass where about 9.6 M would do (`ch4.ts:35`).

7. **Static shadow maps re-rendered every frame.** Gallery (3 maps), sideboard (1), Play (2), hero idle, ch1/2/3/5/6. The measured effect is small, but it costs nothing to fix where nothing moves.

8. **Config with no effect.** `shadow.radius` is ignored under PCFSoft. Switching to PCF would not save time (17 taps against 16) and would switch the radius back on, which changes the look.

---

## 5. Alternatives evaluated

Visual cost is marked **none** (pixel-identical), **subtle**, or **visible**. Savings are orders of magnitude from the model, not measured.

### (a) One shared WebGLRenderer, one fixed full-screen canvas, viewport and scissor per section ("View" tracking)

**Design.**
- A single `position: fixed` canvas behind the page.
- Each frame, for every section whose DOM rect intersects the viewport, set `setViewport` and `setScissor` to the visible part of that rect and render that section's scene with its camera. Use `setViewOffset` so the framing is the same as now.
- The seam split (day and night, `hero.css:10`, `shell.css:5`) becomes a **stencil polygon**. Draw the current seam polygon (`--seam`, `--seam-o` from `seam.ts:73`) into stencil, render day where stencil = 0, then night where stencil = 1. Day and night together shade one screen's pixels, not two.
- The DOM paper and type layers stay over the canvas as now. Section backgrounds become transparent where the 3D shows.

**GPU saving.**
- **Shaded pixels per frame are capped at one screen** (6.88 MP), against 2–3 screens at boundaries now. That is **2–3× less fill at exactly the moments that stutter.**
- Night canvases (hero, Play, Lab chapters) stop shading their hidden half: about 2× on those scenes at all times.
- One MSAA buffer instead of seven: about 1.4 GB less resident memory. **No sleeper and no canvas resizes**, so the 80–230 ms stalls are gone.
- One program cache and one PMREM. Shared piece geometry is uploaded once, not once per context, which cuts build-time GPU work.
- One compositor layer instead of up to seven blended alpha layers, and no clip-path render surfaces.
- It does **not** reduce cost when a single heavy section fills the screen. That needs (c) and (d).

**Visual cost:** **none** if done right. The shaders, cameras and tone mapping are the same.

**Effort:** large, about 2–4 weeks.
- `env.ts`, `keep.ts` (the sleeper is deleted; scenes are kept as scene graphs, not canvases) and `steps.ts`/`warm.ts` change.
- Every scene's `render()` takes a viewport.
- Label projection and picking move from `canvas.clientWidth` to section rects (`gallery.ts:126-137`, `sideboard.ts:160-169`, `hall.ts:166-171`).
- The seam stencil is new.
- Detail-page stages (`project/stage.ts`, `roles/replay.ts`, `notfound/pawn.ts`) move over too.

**Risk:** medium.
- Native compositor scrolling (touch on phones, where Lenis does not smooth by default) moves the DOM a frame before the main-thread rAF can re-render the fixed canvas. The 3D then appears to swim by up to a frame. This is drei View's known drawback.
- Desktop wheel scrolling through Lenis is main-thread driven and stays in sync.
- Mitigation for phones: keep per-section canvases there, or put the canvas inside a sticky container per pinned section.
- Page transitions and view transitions must be re-tested.

### (b) Render on demand, with frozen shadows and baked lighting for static scenes

**Current state.** Hall, gallery, sideboard and Play already render only on change (`hall.ts:4`, `gallery.ts:5`, `sideboard.ts:6`, `ch7.ts:86-90`). That does not help the arrivals, which change every frame.

**Freeze shadows where nothing moves:**
- gallery: always;
- sideboard: re-mark `needsUpdate` only when `lift`, `fade` or `keep` change (`sideboard.ts:141-149,180-181`);
- Play: only on a move;
- hero: after the blast there is no floor, so the shadows are inter-object only.

Saving: small to medium. The sideboard drops about 336 draws per frame, the gallery 3 depth passes. **Visual: none** (hero after the blast: subtle).

**Baked lighting.** The hall is fully static apart from its lamps. The floor and wall shadow from the sun could be baked into a texture: render the shadow-receiving floor once into a lightmap, or set `receiveShadow` false and use a prebaked shadow-catcher plane.
- Saving: removes 16 shadow fetches per pixel on floor and wall. That is about 10% of the hall's fragment work, and only after the spot fix.
- Effort: medium, because the bake merges geometry without UVs (`hall.ts:90`) and lightmaps need UV2.
- Visual: subtle.
- **Low priority.** The measurement "freezing shadows barely helped" agrees.

### (c) Cheaper material and light setups

| Change | Saving (model) | Visual | Effort |
|---|---|---|---|
| **`patchSpots` on the hall** (7 dark lamps) | Hall fragment work about **−45 to −55%** | **None.** A uniform-coherent branch, as `lights.ts:7-10` documents | About 1 h |
| `patchSpots` on the gallery | Small during arrival (spots are at DIM, not 0). Helps once a piece is opened | None | About 1 h |
| **Remove transmission from mirrorfi** (black glass at 0.82 transmission over 0.35 attenuation reads nearly opaque) | Sideboard: removes the whole second pass while distillation keeps its glass. **Only if both are changed** does the frame drop about 2× | **Subtle** for mirrorfi. **Visible** for distillation: the core seen through glass loses its refraction if faked with alpha-blended Fresnel glass | 0.5–2 days |
| `transmissionResolutionScale = 0.5` | Transmission target 4× fewer pixels (measured "helped a little") | Subtle: softer refraction | 1 line |
| **RectAreaLight to an env bake** (put an emissive panel in the RoomEnvironment scene used for PMREM) | Removes LTC from every pixel of both sideboard passes, about −20% | Subtle: rough surfaces are the same. Glossy reflections of the panel move into the env, and arguably improve | About 1 day |
| Physical clearcoat to Standard **for the hall's pieces only** (seen at 20–60 px) | Small pixel share, but cheaper vertex and fragment programs | **None to subtle** at that size | 1 h |
| Physical to Standard on hero, Play, board tiles | About −30% per light on those pixels | **Visible**: loses the lacquer double highlight the approved key frames show. **Not recommended** | |
| PCFSoft to PCF | **About 0** (17 taps against 16) | Visible: switches the dead `radius` values back on | No |
| Shadow maps 4096 to 2048 (hall, ch1/2/3/5/7), 8192 to 4096 (ch4) | Memory: −48 MB per 4096 map, −384 MB per 8192 map. Fill: −75% per shadow render (matters only for ch4 and live maps) | Subtle: slightly softer, blockier shadow edges | 1 line each |
| Antialias off + FXAA/SMAA | On Apple TBDR GPUs MSAA is resolved on-tile, so a post-AA pass may cost **as much as it saves** (hypothesis). Saves about 220 MB per canvas | Visible: shimmer on thin geometry (grooves, graphRag's 0.006-radius edges, tubes) during camera moves | Medium |
| Cap DPR at 1.5 | Measured: frames over 33 ms −25 to 40% | Subtle: softness on Retina, mostly hidden by MSAA | 1 line. **Cannot be switched live** with per-section canvases (resize stalls). With (a) it can, through an internal render target |
| `alpha: false` where the scene paints its own background (hall, gallery, sideboard, Lab chapters) | Compositor treats the layer as opaque: no blend | None, unless forced-dark-mode handling needs alpha (`stage.ts:200-201` explains the hero day needs it) | Small |

### (d) Merging and instancing (the sideboard's ~1,140 draws)

**graphRag.** Merge its 268 node and edge meshes (one brass material, static inside its group) into **one** mesh: `sculptures.ts:112-130`. The group still lifts as a unit.

**leadScorer.** Merge its 30 ivory slices into one: `sculptures.ts:100-110`.

**Pieces in general.** Merge each piece's same-material sub-meshes at build:
- a knight is 16 Physical meshes, so it becomes 1 plus the dark detail;
- a queen is 11, so it becomes 1;
- keep the felt separate, because `sideboard.ts:104,147` hides it by mesh.

Re-index after merging (`mergeVertices`). Make `MAT.dark()` a shared singleton (`pieces.ts:125`) so the hall's per-material bake collapses further.

**Hero.** 64 tiles become 2 `InstancedMesh`es (maple and walnut), with the last-move highlight as instance colour (`stage.ts:78,174`). Merging each piece's sub-meshes takes its 184 piece meshes to about 64.

**Saving.**
- Sideboard: about 1,140 draws down to **about 150**.
- Hero: about 1,024 down to **about 300**.
- Hall: about 120 down to about 80.
- In time this is the GPU-process command cost. My hypothesis is several ms per frame at about 1,000 draws through ANGLE-Metal with Physical uniform uploads. The runtime trace must confirm it.
- The re-indexing part is pure GPU vertex saving: **hall 5.4 M down to about 0.93 M vertex invocations, ch4 about 220 M down to about 38 M per scroll frame.**

**Visual cost:** **none.** **Effort:** 1–2 days. **Risk:** low. The fade, shadow and felt logic must be re-pointed from per-mesh to per-piece lists.

### (e) Pre-rendered video or image sequences for arrivals

**What the arrivals are.** They are deterministic camera moves over static rooms, plus a light ramp:
- hall: camera from y + 3 down to rest over 1.8 s (`RolesIndex.tsx:53,71`);
- gallery: camera from high and far, `room.k` 0 to 1 (`WorkIndex.tsx:65,89-90`);
- sideboard: camera from high, `room.k` 0 to 1 (`Others.tsx:81-82`).

**Video.** Needs a clip per aspect ratio and framing (`gallery.ts:102-114`, `sideboard.ts:125-133` adapt to the window) and per breakpoint. That is about 3–8 MB per clip at 3456×1992.
- YUV 4:2:0 compression **bands and blocks on near-black floors** (`0x0e0e0f`, `0x09090a`).
- The hand-off to live WebGL must match to the pixel.
- **Visible risk, high effort. Not recommended.**

**Pre-rendered still, animated on the compositor.** Render the final frame once in idle time (the scenes already do a "first draw" ahead: `WorkIndex.tsx:67`, `Others.tsx:62`, `RolesIndex.tsx:54`). During the arrival, animate the **canvas element** itself with a CSS transform for the camera drift and a brightness or opacity ramp for `room.k`, then hand back to live rendering.
- In these rooms every light and the env scale linearly with `room.k` (`gallery.ts:147-149`, `hall.ts:176-177`, `sideboard.ts:179-183`). So the linear image is exactly k × final. ACES makes a CSS brightness ramp only approximate.
- Saving: **arrival GPU cost drops from about 100 frames of full 3D to 1 frame** plus compositing, the largest single cut possible.
- **Visual: visible.** A 2D move has no parallax: the hall's 3-unit rise would read as a slide or zoom, not a crane. The light-up curve is close but not identical.
- Effort: small to medium. Risk: low technically, but **this is the owner's call.**

---

## 6. Recommended target architecture

### Phase 1: no look change (about 2–4 days)

1. `patchSpots` on the hall, and on the gallery for parity: `hall.ts` after the build, as at `sideboard.ts:153`.
2. Merge same-material static sub-meshes and re-index every merge. Covers graphRag, leadScorer and piece internals; `hall.ts:89`; `ch4.ts:35`. Share `MAT.dark()`. Instance the hero tiles.
3. Freeze static shadow maps:
   - gallery: `r.shadowMap.autoUpdate = false`, with `needsUpdate` on the first frames, as in the hall at `hall.ts:152-153`;
   - sideboard: re-mark on lift, fade or keep;
   - Play: re-mark on a move.
4. Stop the hero's idle bob while the hero is less than about 50% on screen or while another section's arrival is running. Today the guard is any intersection (`Hero.tsx:135`). Scissor each hero canvas to its side of the seam: at minimum the night's bounding box, the side right of `seam − seam-o`.
5. Set `alpha: false` on the scenes that paint an opaque background.

Expected: the hall about −50% fill, the sideboard about −30% draws-and-passes cost, the hero's background load gone during the Roles arrival.

### Phase 2: the architecture (about 2–4 weeks)

Move to option (a):
- one renderer on one fixed canvas, with per-section viewport and scissor;
- a stencil seam instead of two canvases;
- dynamic resolution by rendering into an internal render target at 1.0–1.5× during arrivals and fast scrolls and at 2× at rest, then blitting, so the canvas is never resized;
- delete the sleeper and the resize path from `keep.ts`;
- one PMREM and one program cache.

Keep per-section canvases on touch devices if the one-frame lag of native scrolling shows.

### Phase 3: for the owner to decide (these alter the look)

- mirrorfi without transmission, and distillation's glass approach;
- the RectAreaLight baked into the env;
- Standard materials for the hall's pieces;
- a 1.5× ceiling during motion (cheap once Phase 2 is in);
- arrivals as compositor animations of a pre-rendered frame (5e).

On `/lab`, fix ch4 first, because it outweighs everything else:
- re-index its merged geometry;
- cap shadow re-renders to about once per 100 ms while scrubbing, or drop the shadow map to 4096²;
- give ch6's six shadowed spots the ch4-style single-spot trick (`ch4.ts:41-59`), or a lower map size.
