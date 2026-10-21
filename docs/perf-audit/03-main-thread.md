# 03: Main thread, scroll and scene lifecycle (static audit)

Auditor: main thread, scroll and lifecycle. Static analysis only: no browser was driven against :3100. Every claim cites
file:line or a number from `00-context.md`. Anything not measured is marked **(hypothesis)**, with a way to check it.

Geometry used throughout: desktop 1728×996, so H = 996 px. The one page's sections, top to bottom:

- hero [0, H)
- roles [H, 2H)
- work [2H, 3H)
- archive (Others) [3H, 4H)
- lab-open [4H, 5H)
- ch7 (Play, a 2H section with a sticky pin) [5H, 7H)
- contact [7H, 8H)

---

## 0. Verdict in one paragraph

The first pass is slow because the page does most of its 3D work at the moment the visitor scrolls, and for one reason
only: it is their first time there. On a second pass the scenes are static and no WebGL frame is drawn, so the
compositor just moves finished canvases (1–2 slow frames). On the first pass, four separate mechanisms put
full-resolution GPU work, or a main-thread wait on the GPU, inside the scroll:

1. **Arrival timelines.** Each section's first view starts a 1.6–1.8 s gsap timeline that redraws the whole scene every
   frame. These overlap one another, and overlap the hero's idle bob.
2. **The sleeper.** It resizes 6.9 MP canvases at scroll pauses, and sometimes inside the scroll handler itself. Each
   resize is a GPU-sync stall of 80–230 ms.
3. **Deferred builds.** Every build, compile, warm and first draw is held until the 8 s opening ends, so all of it lands
   in the window where the visitor starts scrolling. Up to four sliced builders then run at once, and a section reached
   early finishes its build synchronously.
4. **Lenis.** It moves the page from a main-thread rAF, so every one of the stalls above stops the scroll itself, not
   just a canvas.

Points 1–3 are **lifecycle design, not tunables**. Every section owns a full-screen, MSAA, 2× WebGL context. That forces
the memory cap. The memory cap forces sleep/wake resizing. The arrival choreography is live 3D camera motion that starts
mid-scroll by construction (firstView at 30 % visible). The tunables in section 3 (seam paint, React re-renders, forced
reflows, the hero bob) are real but second order.

---

## 1. What runs on the main thread during a scroll frame

### 1.1 The scroll itself (Lenis)

- `src/components/shell/Shell.tsx:52` creates `new Lenis({ autoRaf: true, lerp: 0.1 })`.
- Lenis registers `wheel` with `{ passive: false }` (`node_modules/lenis/dist/lenis.mjs:255,283`) and calls
  `preventDefault()` on it (`lenis.mjs:614,627`).
- It then moves the page with `window.scrollTo` from its own rAF loop (`lenis.mjs:722-726`).

So the page scrolls **only when the main thread runs a frame**. A native or compositor scroll would keep moving through
a long task. Here, any long task freezes the page: a sync build, a GPU-blocked `setSize`, or gsap's style reads.

Lenis's rAF loop runs on every frame forever (`autoRaf`). Its own cost is negligible. Two side effects matter more:

- The lerp tail extends each scroll by about 0.5–1 s of small per-frame scrolls.
- That tail keeps every scroll handler below firing for that whole time.

### 1.2 Every listener, observer and loop on `/`

**Window `scroll` listeners**

| What | Where | Runs | Layout reads | Cost |
|---|---|---|---|---|
| OnePage `onScroll` → `steer()` | `src/components/home/OnePage.tsx:42-51,71` | every scroll event | `window.scrollY` (`:46`). It forces layout if styles are dirty; Lighthouse attributes 1 ms to it (`lighthouse-docs.txt:61`, chunk `0l7i~d4z4~j4i.js:1:299267` maps to `f=window.scrollY`). It toggles `data-nav-away` on `.site` when the direction changes. | small |
| OnePage `follow` | `OnePage.tsx:31-39` | one rAF per scroll burst | `getBoundingClientRect` on 6 sections (`:35`); `history.replaceState` on a section change (it carries `__NA`, so Next's patched replaceState returns early: `node_modules/next/dist/client/components/app-router.js:268-273`) | small |
| blocks `refresh` → `apply` | `src/lib/seam/blocks.ts:27,31-69,86` | one rAF per frame while scrolling | Desktop: about 14 `getBoundingClientRect` per frame (`:53,57,63`). It writes `--seam` per block (`:64`) and on `.site` (`setSeam`, `seam.ts:68-74`). | small JS; large style and paint cost inside the seam bands (§3.1) |
| blocks settle → `restColours(true)` | `blocks.ts:68`, `src/lib/seam/seam.ts:127-140` | 150 ms after each scroll stops | **Forced layout in a loop**: it writes `e.style.color = ""` and then reads `getBoundingClientRect` and `getComputedStyle`, per line, across about 40 `[data-vt-line]` elements. This is the Lighthouse forced reflow at `03gr70eoyvr64.js:1:2353` (mapped). | one task of a few ms per pause **(hypothesis)** |
| keep (sleeper) `onScroll` | `src/lib/three/keep.ts:87,96,115,80` | every scroll event | `wakeNear()` → `check()` per scene. Each **asleep** scene calls `away()` → `getBoundingClientRect` (`:73`). This is the Lighthouse forced reflow at `03gr70eoyvr64.js:1:5133` (mapped, 31 ms total). It can call `wake()` → `stage.resize()` → `setSize` **inside the scroll handler** (§2.3). | usually small; **80–230 ms when it wakes a scene** |
| Lab `onScroll` | `src/components/lab/Lab.tsx:260-267,270` | every scroll event, on the whole page from load | `active()` and `progressOf()`: `offsetHeight` plus `getBoundingClientRect` (`:159,161`) after OnePage's attribute write. **`place()` → `setTags(new object)` (`:237,265`) re-renders the whole Lab tree on every scroll event** (§3.2). | about 1–3 ms per event **(hypothesis)** |
| Hero `early` | `src/components/hero/Hero.tsx:88` | only until the hero is built | — | none |

**rAF loops**

| What | Where | Runs | Cost |
|---|---|---|---|
| Hero idle bob | `Hero.tsx:126-134` | rAF every frame from the end of the opening, for the whole visit; draws at 30 fps while any part of the hero is on screen (`:135`, `rootMargin -1px`) | **2 full-screen renderers × (shadow pass + main pass) every 33 ms** (`src/components/hero/stage.ts:202-203`; shadow `autoUpdate` is left at its default, true). Off screen the loop only returns early. |
| Scene draw (rAF-coalesced) | Roles `RolesIndex.tsx:32-35`; Work `WorkIndex.tsx:37-41`; Others `Others.tsx:33-37` | every frame of any gsap tween with `onUpdate: draw` (arrival, hover) | a full render. Off screen by more than 25 % of a screen, the frame is owed instead (`src/lib/motion/firstView.ts:41-48`). |
| gsap ticker | gsap | while tweens are live | small JS. Tween init reads `getComputedStyle` (§3.4). |
| Lab `drawAll` | `Lab.tsx:142-153` | one rAF per scroll event | Play is `still`, so it draws only when forced (`:148-149`) |
| Sliced builds and warms | `src/lib/three/steps.ts:38-41,56-77`, `src/lib/three/warm.ts:19-39` | one slice per frame **per builder** | 8 ms, and up to 50 ms when frames are slow (§2.2) |
| FrameMeter | `src/components/shell/FrameMeter.tsx:102-117` | only with `?fps` | negligible |

**Other sources**

| What | Where | Runs | Cost |
|---|---|---|---|
| Cursor | `src/components/shell/Cursor.tsx:19-27` | `pointermove` only, not scroll | one transform write and two `closest()` calls; fine |
| Contact clock | `src/components/contact/Contact.tsx:23-28` | `setInterval` at 1 Hz from load, even off screen | one tiny React render per second; fine |
| IntersectionObservers | about 20 (sleeper ×6, nearScreen ×3, firstView ×4, buildAhead ×3, Others `seen`, hero, Lab `seen`/`near`) plus Next `<Link>` prefetch | per frame while moving | negligible to compute. Their **callbacks** fire the heavy work (§2). |

Not a scroll cost:

- **The view-transition setup.** `next.config.ts:7` and `src/components/shell/PageTransition.tsx:32` take effect only
  for transition-lane commits. React starts a view transition only for those
  (`react-dom-client.production.js:13896-13930`). Nothing during the scroll is a transition: scroll setStates are
  continuous-lane, and `replaceState` bypasses the router.
- **`Room.tsx`**: it is not on `/`.
- **Chrome's re-render on a section change**: about 10 links.

### 1.3 Order inside one frame, and forced reflow

Scroll events dispatch first. In the frame's rAF phase, callbacks run in registration order:

1. gsap tick, which writes tween values.
2. The scene draw requested in the previous frame. It reads `canvas.clientWidth/clientHeight` in `place()`:
   `src/components/roles/hall.ts:136-142`, `src/components/work/gallery.ts:94-113`,
   `src/components/work/sideboard.ts:122-132`, `src/components/lab/kit.ts:53,58`.
3. `blocks.apply`, which writes `--seam`.

So the render's layout read normally comes **before** the seam write, and it only pays a small style recalc for gsap's
transform writes. This works by accident of callback order. If a draw ever runs after `apply`, it forces a whole-tree
style recalc and layout per frame inside the seam bands. **Fix (XS):** have each scene cache W/H from its resize path
(a ResizeObserver or the existing `onResize`), not read `clientWidth` on every render.

Lighthouse's forced reflows (`lighthouse-docs.txt:56-62,88-95`), mapped to source through the built chunks:

| Lighthouse entry | Source | When |
|---|---|---|
| `10~x95jhs6ns3.js:2:8421`, 40 ms | React's scheduler loop (`performWorkUntilDeadline`) | layout read inside commits at mount: `claim` → `replaceChildren` followed by the sleeper's `away()` (`keep.ts:74`), `OnePage.follow()`, `restColours` |
| `03gr70eoyvr64.js:1:5133`, 31 ms | `keep.ts:73` `away()` | at mount (`sleeper()` construction) and in scroll checks |
| `0.71nvfk4z5p1.js:1:54050`, 27 ms | gsap CSSPlugin `getComputedStyle` | most likely the Lab tree's 805 `fromTo` inits (§3.4) and the arrival tweens' first reads |
| `03gr70eoyvr64.js:1:2353` | `seam.ts:137` `restColours` | after each scroll stops |

---

## 2. Scene lifecycle

### 2.1 The pieces

- **`buildAhead`** (`src/lib/motion/firstView.ts:19-33`) waits until the opening is over, then builds on an IO with
  `rootMargin 100%` or a `requestIdleCallback` (timeout 4000 ms), whichever comes first.
  - The IO fires once at load, while `data-intro="pending"`. Its callback is ignored (`:24`) and never fires again,
    because the intersection state does not change.
  - So for Roles and Work, **the margin trigger is dead on a first load with the opening**. Only the 600 ms poll and
    rIC path (`:26-30`) starts them.
- **`staged`** (`steps.ts:96-108`): `start()` builds in slices; `now()` **finishes synchronously**.
  - Roles, Work and Others call `now()` from their firstView callback through `build()`: `RolesIndex.tsx:59,69`,
    `WorkIndex.tsx:72,84`, `Others.tsx:67,76`.
  - This is the measured 300–350 ms "roles: built" freeze (`00-context.md` §1).
- **`sliced`** (`steps.ts:56-77`) runs one slice per frame per builder. Each builder has its own post loop.
  - **There is no global queue.** Three or four builders put three or four slices into every frame.
  - The slice length grows when frames are slow: `lengthOf` gives up to `frameMs/2`, at most 50 ms (`:42-44`).
    `frameMs` is shared by all builders (`:37,40`). This is **positive feedback**:
    - builders slow the frames, so every builder's slice grows, so frames slow further;
    - four builders at 33 ms frames take 16 ms each, which is about 66 ms per frame;
    - those frames are about 80 ms, so slices grow to 40 ms each, which is 160 ms per frame, and it stops only at the
      50 ms cap. **(hypothesis; the math follows from the code. Check `__trace` for "step n took" bursts right after the
      opening.)**
- **`warmScenes`** (`warm.ts:19-60`) makes one 1-pixel scissored render per slice, six objects per pass (`:23,32-38`).
  The scissor does not cover what the GPU actually spends time on:
  - The **shadow pass** clears the scissor (`node_modules/three/src/renderers/webgl/WebGLShadowMap.js:99`) and renders
    at full map size (hall 4096², gallery 3 × 2048², sideboard 2048², Play 2 × 4096²) on every pass.
  - Transmission (`node_modules/three/src/renderers/WebGLRenderer.js:1859-1887`) sizes its MSAA half-float target to the
    full viewport.
  - Pass counts follow the mesh count. The sideboard draws about 1,140 calls (`00-context.md` §2), so it needs about
    190 passes, which is about 190 frames, about 3 s of GPU-touching slices **(hypothesis on pass count)**.
- **"First draw"** happens as soon as warming ends, "wherever the page is": `RolesIndex.tsx:54`, `WorkIndex.tsx:67`,
  `Others.tsx:62`.
  - It is the first full-resolution frame, and for the sideboard the first transmission-target allocation.
  - Play **never gets a first draw ahead**. Lab draws only chapters that are on screen (`Lab.tsx:147,181`), so Play's
    first full frame (2 renderers × (4096² shadow + main)) is drawn on the frame it comes on screen.
- **The sleeper** (`keep.ts:70-115`) works by distance from the screen:
  - It sleeps a scene beyond 2 screens and wakes it within 2 screens, but only after the scroll has been still for
    250 ms, one change per 50 ms (`:96-107`).
  - It wakes **at once, inside the scroll handler**, any scene still asleep within half a screen (`:80,96,115`).
  - Sleeping is `canvas.width = 1` (`:50`). Waking is `stage.resize()` → `renderer.setSize` (`WebGLRenderer.js:620-642`).
  - Both reallocate the drawing buffer and **wait on the GPU**: 80–230 ms measured, `00-context.md` §4.
- **Play wakes itself.** `chapter7.render()` → `place()` → `size()` → `setSize` on **every render** (`ch7.ts:84,213`,
  `kit.ts:58`).
  - Lab warms Play while it is far off (`Lab.tsx:176-180`), and that render brings both canvases back from 1×1 to
    3456×1992 (two GPU-sync resizes) at an arbitrary time.
  - Then `zz.built()` (`:181`) puts them back to sleep at the next pause (two more resizes).
  - Lab's comment at `:126-127` acknowledges this. Before the visitor even reaches Play, its two canvases can be
    resized up to 3 times each.
  - Whether three's same-size `canvas.width = …` assignment on every Play render costs anything in Chrome is a
    **hypothesis** to check (per spec it resets the bitmap).

### 2.2 Timeline of the first pass, by time and scroll position

Desktop, no hash, first visit (the opening plays).

| When / scrollY | Main thread | GPU / GPU-sync | Long-task or stall risk |
|---|---|---|---|
| **t ≈ 0–2 s**, black page | Hydration. Layout effects: `claim`, the sleeper `away()` reads (forced layout in commit, 40 + 31 ms in Lighthouse), `driveBlocks`. Hero built in slices (`Hero.tsx:93-100`). | Hero's 2 contexts, PMREM (sync PMREM shader compile per context), `compileAsync` ×3 (`stage.ts:217-221`) | Lighthouse TBT. Scroll is possible before the lock; `early` (`Hero.tsx:86-88`) then cancels the opening. |
| **t ≈ 2–10 s**, opening, scroll locked (`Hero.tsx:180`) | gsap timeline; quality guard (`:148-156`). Every other build waits (`firstView.ts:17,27`; `Lab.tsx:224`). | Hero 2 × (shadow + main) per frame. `stage.lower()` → `setPixelRatio` → `setSize` mid-opening if frames average over 22 ms (`stage.ts:225-228`). | GPU-sync resize during the opening (not the scroll) |
| **E = end of opening** | `lockScroll(false)`; `restColours(true)` (forced layout loop); hero idle bob starts (`Hero.tsx:159`) | Hero bob: 2 × (shadow + main) at 30 fps | — |
| **E + 0…0.6 s** | The Roles, Work and Others poll timers fire their rIC (`firstView.ts:26-30`): **three sliced builders start within about 600 ms of each other**. Lab's queue (`Lab.tsx:222-233`) starts **Play's build** once the scroll has been still for 300 ms: a fourth builder. | WebGL context creation ×5 (hall, gallery, sideboard, Play ×2). PMREM ×5 (each a sync shader compile plus a cube render). | 3–4 slices per frame, growing to 50 ms each (§2.1 feedback) |
| **E + about 1–5 s** | Compile → warm (one pass per frame per scene) → first draw. Then `zz.built()`: Roles, Work and Others are at most 2 screens away, so they stay awake; Play is 4 away and sleeps at the next pause (`keep.ts:79`). Then Play's warm wakes it (§2.1), and it sleeps again. | Warm passes with full-size shadow passes; sideboard transmission target allocated at first draw; **Play: 2 → 4 → 6 canvas resizes** | **A visitor who scrolls in this window scrolls through all of it.** This is `00-context.md` §1. |
| **y 0 → 0.2H** | Every scroll event: OnePage, keep, Lab (`setTags` re-render), blocks rAF | Hero bob (30 fps); compositing of hero (2 alpha canvases) | — |
| **y 0.2H → 0.8H** (seam band hero→roles, 0.559 → 1) | `setSeam` writes `--seam` on `.site` every frame: **style recalc of the whole `.site` subtree**. Layout of `hero::before` width (`hero.css:5`) and `.roles-dark` inset (`roles.css:7`). | **Repaint and raster** of the moved solid panels, and of clip-path masks that change every frame: chrome paper layer (fixed, full screen, `shell.css:11-14`), hero night canvas slot (`hero.css:10`), hero paper type layer with 24 composited letters (`hero.css:12,18`) | per-frame paint and raster **(hypothesis on cost)** |
| **y ≈ 0.3H**: Roles firstView (`RolesIndex.tsx:67-74`, threshold 0.3) | `build()`: **`scene.now()` synchronous finish if not done** (300–350 ms measured). gsap timeline init. | **The hall draws every frame for 1.8 s** (about 120 draws; 4096² PCF shadow on the first frames, `hall.ts:152-153,178`), **at the same time as the hero bob** (hero still visible until y = H) | GPU-bound frames, 33–58 ms measured (`00-context.md` §2) |
| **y ≥ H** | Hero leaves the screen: the bob stops drawing (`Hero.tsx:130`) | — | — |
| **y 1.2H → 1.8H** (seam band roles→work, 1 → 0) | Whole-tree style recalc every frame; `.work-paper` width changes (`work.css:7`) | Repaint of `.roles-dark` and `.work-paper` (up to a full screen each) and the chrome mask | per-frame raster **(hypothesis)** |
| **y ≈ 1.3H**: Work firstView (`WorkIndex.tsx:83-98`) | sync finish risk; timeline init; `setPos` (one React render) | **The gallery draws every frame for 1.8 s**: 3 spot shadows at 2048² (`gallery.ts:87`, `autoUpdate` true) plus main, so 4 scene passes per frame. **The Roles arrival can still be drawing** (nearScreen keeps it until y > 2.25H). | overlapping arrivals |
| **y ≥ 2H** | The sleeper wants **Play** awake at the next 250 ms pause (`keep.ts:81`) | **2 × `setSize` 1×1 → 3456×1992 at the pause**, GPU-sync, likely while an arrival is still drawing | **80–230 ms each** |
| **y ≈ 2.3H**: Others `seen` (`Others.tsx:73-91`) | sync finish risk; timeline init | **The sideboard draws every frame for 1.6 s**: shadow pass (`sideboard.ts:118`, `autoUpdate` true) + transmission pass (`sculptures.ts:86,89`) + main ≈ **3 × about 1,140 draws** per frame at 6.9 MP with MSAA | **the worst arrival** |
| **y > 3H**, first pause | The sleeper puts the **hero** to sleep (2 canvases, one per 50 ms) | GPU-sync shrink: 5–30 ms when still (`keep.ts:63-64`), more when an arrival or the next band is drawing | stall at the visitor's pause |
| **y 3.2H → 3.8H** (band archive→lab-open, 0 → 0.305) | Whole-tree style recalc and seam masks every frame | — | — |
| **y ≈ 3.3H**: lab-open firstView (`Lab.tsx:301`, `grow`, `:291-298`) | **805 `fromTo` tweens** created in one task. Each init reads `getComputedStyle` after the previous `startAt` write (§3.4). | SVG of 805 lines repainted every frame for about 0.84 s | **30–50 ms task (hypothesis)**; per-frame full-screen SVG raster |
| **y > 3.5H** | If Play is still asleep (no pause since y = 2H), **`wakeNear` wakes it inside the scroll handler** (`keep.ts:80`) | **2 × GPU-sync resize in one handler: about 160–460 ms with the scroll frozen** (Lenis) | **the largest single stall possible on the first pass** |
| **y > 4H**, pause | Roles sleeps | GPU-sync shrink | stall |
| **y 4.2H → 4.8H** (band lab-open→Play, 0.305 → about 0.529) | Whole-tree style recalc and masks; Play's night canvas is clipped by a polygon (`Lab.tsx:133`) | — | — |
| **y ≈ 4H+**: Play comes on screen | Lab `seen` → `drawAll(true)` (`Lab.tsx:154-156`). If Play is still in slices: **`build(7, true)` → `b.finish()` synchronously** (`:155,197-199`). | **Play's first full frame**: 2 × (4096² shadow + main), never drawn ahead | long frame |
| **y > 5H / 6H**, pauses | Work, then Others, sleep | GPU-sync shrinks | stalls |
| **y 6.2H → 6.8H**, contact firstView at about 6.3H | DOM-only arrival (`Contact.tsx:62-77`); a small seam change | — | none of note |

### 2.3 Where a long task or a GPU-sync stall can land during the first scroll

1. **The sync build finish** on firstView or `seen`: `steps.ts:105` via `RolesIndex.tsx:69`, `WorkIndex.tsx:84`,
   `Others.tsx:76`, `Lab.tsx:155,197`. 300–350 ms measured.
2. **Sliced builders running at once**, with adaptive slices up to 50 ms each: `steps.ts:42-44`, and no queue across
   sections.
3. **Synchronous steps that cannot be sliced**:
   - `new WebGLRenderer` (context creation);
   - `PMREMGenerator.fromScene`, a sync compile plus render, once per context: hero ×1, hall, gallery, sideboard,
     Play ×2 (`hall.ts:108`, `gallery.ts:57`, `sideboard.ts:80`, `kit.ts:44`);
   - `bake` and `mergeGeometries` (`hall.ts:83-101`);
   - procedural piece geometry.
   - Any of these over 30 ms is logged as "step n took" (`steps.ts:69`).
4. **Warm passes and the first draw** while scrolling (`warm.ts:34`; the `timed(... first draw)` calls).
5. **Sleeper shrink at a 250 ms pause** (`keep.ts:99-107`). It is GPU-sync, and the visitor usually resumes scrolling
   within a frame or two of it.
6. **Sleeper wake inside the scroll handler** (`keep.ts:80,115`). GPU-sync, with the scroll frozen.
7. **Play's self-resize when it renders** (`ch7.ts:84,213` → `kit.ts:58`), triggered by its warm (`Lab.tsx:180`).
8. **The Lab tree's tween creation** (`Lab.tsx:295`).
9. **Arrival frames**: these are GPU-bound, not long tasks. JS takes 2–5 ms of a 33–58 ms frame (`00-context.md` §2).

---

## 3. Second-order costs (tunable)

### 3.1 Seam bands: style recalc, layout and paint every frame

During about 60 % of a screen around each section boundary, `blocks.apply` (`blocks.ts:50-66`) calls `setSeam`, which
writes two custom properties on `.site` every frame (`seam.ts:72-73`). `--seam` is inherited, so every descendant of
`.site` without its own value gets a style recalc. Off-screen blocks have their own `--seam` (`blocks.ts:64`), and that
stops the recalc from going further into their subtrees.

**Layout and paint triggered by `--seam`**

- `.hero::before { width: var(--seam) }` (`hero.css:5`)
- `.roles-dark { inset: 0 0 0 var(--seam) }` (`roles.css:7`)
- `.work-paper` and `.others-paper { width: var(--seam) }` (`work.css:7,54`)

These are non-composited boxes up to a full screen in size. Moving their edge invalidates both the old and the new
visual rect, so they are repainted and re-rastered at 2× on every band frame **(hypothesis on cost; check with Rendering
→ Paint flashing)**.

**Clip-path polygons that change every frame**

These are `.seam-dark` and the copies of it: `shell.css:5,14`, `hero.css:10,12`, `lab.css` (via `.seam-dark`), and
Contact. Chrome draws a clip-path polygon on a composited layer as a synthesized mask, and repaints the mask when the
path changes. `sweep.ts:44-50` already found these masks to be as large as the polygon. On screen in the bands:

- the chrome paper layer, which is `position: fixed; inset: 0` (`shell.css:11-14`);
- the hero's night canvas slot, a mask over a 6.9 MP WebGL layer;
- the hero's paper type layer, whose 24 letters are permanently `will-change: transform` (`hero.css:18`). This makes the
  layer a render surface under the mask.
- Play's night canvas (`Lab.tsx:133`).

**Fixes**

During a scroll the seam is always vertical (tilt 0: `blocks.ts:66` calls `setSeam(at)`). That allows the following,
none of which changes the look:

- (a) Move the solid panels with `transform: translateX(...)` on a composited layer, not with `width`/`inset`. Effort S.
- (b) For the paper copies (chrome, hero type, canvases), use a rectangular `overflow: hidden` wrapper translated to
  the seam, with the content counter-translated. Keep the polygon only while a sweep is tilting (`data-seam-moving`).
  Effort M.
- (c) Write `--seam` only on the blocks on screen and on `.chrome-frame`, not on `.site`. Or register it with
  `@property` as `inherits: false`. Effort S.
- (d) Drop `will-change` from `.hero .ch` once the opening is done. gsap's `force3D: "auto"` composites them during the
  tween anyway. Effort XS.

### 3.2 React re-renders during the scroll

- **The Lab on every scroll event.** `Lab.tsx:265` calls `place()`, which calls
  `setTags(Object.fromEntries(...))` (`:237`). That is a new object each time, even when empty. So every scroll event
  anywhere on the page schedules a continuous-lane render of `<Lab>`:
  - `Open`, which maps **805 SVG `<line>` elements** with two `toFixed` each (`Lab.tsx:73-76`; 805 lines counted with
    the real layout at 1728×996: depths 2/6/12/20/35/64/111/200/355);
  - two copies of Play's controls;
  - Play's `OpeningPick`.

  There is no React Compiler (`next.config.ts`) and no `memo`. No DOM changes, but about 1,000 fibers are reconciled per
  event. **Hypothesis: 1–3 ms per scroll event.** This matches the 2–5 ms of JS seen in slow frames. Check with React
  DevTools' profiler, or Performance → "Commit" entries during a scroll.

  **Fix (XS, no visual change):** call `setTags` only when a tag set has actually changed (compare with the previous
  value), and `memo` the `Open` component.
- **`setPos` (Work, Others)** runs only in `adopt` and on resize (`WorkIndex.tsx:56,67,101`; `Others.tsx:48,62,93`).
  It does **not** run on scroll.
- **`setFocus`** runs on hover. When the cursor rests over the page while the wheel scrolls, Chrome updates `:hover`
  and fires boundary events (`mouseenter`) as links pass under the pointer. The `onMouseEnter` handlers on role names
  (`RolesIndex.tsx:165`) and work labels (`WorkIndex.tsx:167`) then start 0.4–0.7 s tween sets with `onUpdate: draw`
  (`RolesIndex.tsx:88-101`, `WorkIndex.tsx:113-119`, `Others.tsx:105-115`). That is **extra full-scene redraws in the
  middle of the scroll**. **(hypothesis: depends on where the pointer rests; check with a trace with the mouse at the
  screen's centre.)**

  **Fix (S):** ignore `mouseenter` while `lenis.isScrolling`.
- **`section.set` → Chrome**: about 10 links, once per section change. Fine.
- **Hydration**: the whole page is client components (1,249 elements, Lighthouse). This is a load cost, not a scroll
  cost.

### 3.3 The hero idle bob

`Hero.tsx:123-134` draws both renderers at 30 fps whenever any pixel of the hero is on screen (`:135`). Each draw is two
shadow passes plus two main passes (`stage.ts:202-203`; hero renderers keep `shadowMap.autoUpdate = true`). On the way
down it overlaps the whole of the Roles arrival, from y = 0.3H to y = H.

**Fix options**

- Pause the bob as soon as the visitor scrolls: on a Lenis `scroll` event, or once `scrollY > 0`. Resume when back at
  the top and still. Effort XS. **Look change:** the field stops bobbing while the page moves, which is hard to notice
  while scrolling.
- Freeze the shadows during the bob. **Look change:** shadows between floating pieces stop following them. The owner's
  measurements say this "barely helped" elsewhere.

### 3.4 gsap style reads at arrivals

- CSSPlugin reads `getComputedStyle` when a tween first initialises (`node_modules/gsap/CSSPlugin.js:1387,1406,1410`,
  and `_parseTransform` at `:821`).
- The Lab tree's 805 `fromTo` tweens (`Lab.tsx:295`) render their `startAt` immediately. Each one's init then reads
  computed style straight after the previous line's style write.
- Lighthouse shows 27 ms of forced reflow in gsap's `getComputedStyle` (`0.71nvfk4z5p1.js:1:54050`, mapped).

**Fix (S, no visual change):** grow the tree by drawing it, not with 805 tweens. One tween on a progress value that sets
`stroke-dashoffset` per depth group, or 9 tweens (one per depth) on a CSS variable that the lines read.

### 3.5 Compositing hazards on top of the 6.9 MP canvases

- **`alpha: true` on every renderer** (`src/lib/three/env.ts:27`). Hall, gallery, sideboard and Play all paint an opaque
  `scene.background`, yet their layers are marked non-opaque. So the compositor blends each full-screen canvas over what
  lies beneath and cannot skip the layers below. Only the hero's day canvas needs alpha (`stage.ts:200-202`).
  **Fix (XS):** `alpha: false` for the opaque scenes. **Check:** no look change expected; verify the canvas edge colour.
- **`antialias: true` at a pixel ratio of 2** (`env.ts:27,33`): 4× MSAA at 6.9 MP. This is about 230 MB per canvas
  (`keep.ts:49`) and is the reason the sleeper exists. GPU auditor's area.
- **`mix-blend-mode: difference`** on `.resume-link` (`globals.css:35`) is overridden to `normal` inside the chrome
  (`shell.css:22`). Not a live hazard.
- **`backdrop-filter`, CSS `filter`, animated `mask`**: none in the stylesheets.
- **`position: fixed` full-screen layer**: `.chrome-frame` (`shell.css:11`) is the only one on `/`. It is cheap except
  for its clip mask in the seam bands (§3.1).
- **Animated non-composited properties**:
  - `--seam`-driven `width`/`inset`/`clip-path` (§3.1);
  - `stroke-dashoffset` on 805 SVG lines (§3.4);
  - `box-shadow` and `color` transitions on hover (`roles.css:17`, `work.css:23`, which also transitions `font-size`, a
    layout property);
  - `.others-tags .tag` has a static double `text-shadow` (`work.css:70`); fine.

---

## 4. Ranked root causes of first-pass stutter

Each root cause is marked either **[design]**, where the architecture is the problem, or **[tunable]**.

1. **[design] Arrivals redraw the heaviest scenes, every frame, at full resolution, during the scroll, only on the first
   pass.**
   - Where: `RolesIndex.tsx:70`, `WorkIndex.tsx:85`, `Others.tsx:78` (`gsap.timeline({ onUpdate: draw })`, 1.6–1.8 s);
     firstView threshold 0.3 (`firstView.ts:5`), so they start mid-scroll by design.
   - They overlap each other: nearScreen keeps an arrival drawing until 25 % of a screen off (`firstView.ts:41`).
   - They overlap the hero bob (§3.3).
   - Per frame: sideboard ≈ shadow + transmission + main ≈ 3 × 1,140 draws; gallery 4 scene passes; hall about 120.
   - This alone accounts for the difference between 45–50 frames over 33 ms on the first pass and 1–2 on the second:
     the second pass draws no WebGL frames at all.
2. **[design] One full-screen MSAA 2× WebGL context per section, hence the sleeper, hence GPU-sync resizes on the
   scroll's timeline.**
   - Shrink at pauses: `keep.ts:99-107`. Wake inside the scroll handler: `keep.ts:80,115`.
   - Play resizes itself on render: `ch7.ts:84,213`, `kit.ts:58`, set off by its warm at `Lab.tsx:180`.
   - 80–230 ms per resize (`00-context.md` §4), multiplied by 2 for the two-canvas scenes.
   - Under Lenis each one is a frozen scroll (§1.1).
3. **[design] Every build is deferred until the opening ends, then run unqueued.**
   - Up to four builders at once (`firstView.ts:26-30`, `Lab.tsx:222-233`), with positive-feedback slice growth
     (`steps.ts:42-44`).
   - Synchronous `now()` finishes when a section is reached early (`steps.ts:105`).
   - Warm passes with full-size shadow and transmission passes (`warm.ts`).
   - First draws "wherever the page is", and none ahead for Play.
   - All of this lands exactly when an eager visitor starts scrolling.
   - Per-context duplication makes it bigger: PMREM, shaders compiled once per context (7 contexts), shadow maps.
4. **[tunable] Seam bands**: whole-tree style recalc, layout of large panels and clip-mask repaints every frame across
   about 60 % of a screen at each of five boundaries (§3.1).
5. **[tunable] The hero bob** draws 2 renderers with shadows at 30 fps through the hero→roles transition (§3.3).
6. **[tunable] Main-thread scroll work**: the Lab re-render on every scroll event (805-line SVG, §3.2); layout reads per
   event (Lab `progressOf`/`active`, sleeper `away()` for asleep scenes, blocks' 14 `getBoundingClientRect` calls); the
   `restColours` forced-layout loop after every pause; gsap style reads at arrivals (805 tweens at lab-open).
7. **[design, by choice] Lenis.** Main-thread scrolling turns every hitch above into a frozen scroll, and its lerp tail
   keeps the per-frame handlers running for longer. Keep it if the feel is required, but the main thread must then stay
   below about 8 ms (on a 120 Hz panel) or 16 ms at every point of the first pass, with no GPU-sync calls at all.
8. **[tunable] Compositing**: alpha canvases (`env.ts:27`), permanent `will-change` letters under a mask (`hero.css:18`).

---

## 5. Fixes

Ordered by impact on the first pass. Effort: XS < ½ day, S ≈ 1 day, M ≈ 2–4 days, L ≈ 1–3 weeks. Look and motion changes
are flagged.

### A. Architecture (the actual cure)

**A1. A canvas pool with stable context ownership, instead of one full-screen context per section.** L, medium risk, no
look change.

- Keep 3 long-lived renderers and canvases, all at viewport size, so no canvas ever changes size during a scroll.
- Assign each scene to a fixed pool slot by section index: slot = index mod 3, which keeps its GPU resources in one
  context.
- Move a canvas between sections by DOM re-parenting. The context and its buffers survive the move.
- Draw the newly assigned scene once when the canvas is moved, ahead of view.
- This deletes the sleeper entirely (no resize ever, so no 80–230 ms stalls).
- It cuts drawing-buffer memory from 7 × about 230 MB to 3, which is the reason the sleeper exists.
- It removes 4 context creations, 4 PMREM builds and their duplicated shader compiles.
- The hero's day/night pair can become one canvas split by scissor at the seam. During a scroll the seam is vertical, so
  a scissor rect is exact. Tilted sweeps need a second scissored pass or a stencil.
- Static scenes keep being scrolled by the compositor for free. That is the advantage of this design over a single fixed
  canvas, which would have to redraw on every scroll frame.

**A2. Make the arrivals stop costing a full scene render on every scroll frame.** Pick one:

- (a) Draw the arrival at reduced resolution into an offscreen render target, upscale it to the canvas, and draw the
  settled frame at full resolution. No canvas resize, so no GPU sync. M–L effort, medium risk.
  - **Look change:** slightly softer during the 1.6–1.8 s motion; the settled frame is identical.
  - This needs a tone-mapping and output pass, because three applies tone mapping only when drawing to the screen.
    Verify against the current frames.
- (b) Start an arrival only when the section is at least 80–90 % in view **and** the scroll has been still for about
  150 ms, and cancel it to its end state if the visitor scrolls on. S effort.
  - **Motion change:** arrivals no longer play under a moving page.
- (c) Replace the 3D camera settle with a compositor-only move of the already drawn canvas (a CSS transform on the
  canvas element), keeping the light ramps but drawn once every few frames. S–M effort.
  - **Look change:** the parallax of a real camera move is lost.
- Whichever is picked: never let two arrivals draw at once. Cancel a previous section's arrival to its end state as soon
  as the next starts (XS).

**A3. Move scene construction out of the scroll window.**

- Bake the procedural geometry (pieces, rounded boards, merged hall tables) into binary assets at build time, so a
  "build" is only context creation, upload and an async compile. M effort, no look change. **(hypothesis that geometry
  is a large share of build time; check `__trace` "step n took" entries.)**
- Use one global build queue, nearest scene first, one builder at a time, with a fixed 6–8 ms slice. Remove the adaptive
  `lengthOf` growth, or make it consider only frames that had no slice in them. S effort, no look change.
- Never `finish()` synchronously when a section is reached. Hold the arrival until the scene is in (type can rise
  first). S effort.
  - **Motion change:** the 3D can arrive a beat after the type when the visitor outruns the build.
- Give every scene, including Play, its first full draw ahead of view, and only while the scroll is still. XS effort.
- Consider running the Roles build during the opening's last, lighter seconds (after the blast, while the name settles).
  S effort. **Motion risk:** it can cost the opening some smoothness; it was moved out before because it froze the
  opening for 400 ms. With a proper queue and fixed slices it would cost far less.

### B. Lifecycle fixes inside the current design

These are the "if A1 is not done yet" fixes.

- **B1. Never resize in the scroll handler.** Remove the immediate wake from `onScroll` (`keep.ts:96`, `check` at `:80`)
  and wake earlier at pauses (for example within 3 screens), so a scene is always awake before it is reached. XS effort,
  no look change. Risk: if the visitor never pauses, a scene can show its 1×1 frame. Mitigate by keeping the
  first-pass-down scenes awake until they are behind the visitor.
- **B2. Do not sleep anything during the first pass down.** Sleep only scenes the visitor has already passed, only when
  the page has been idle for more than 2 s, never within 1 s of an arrival, and never during a seam band. XS effort, no
  look change. It costs memory: about 1 GB at 2× while scrolling down. Combined with A2(a) or a 1.5 pixel ratio, that is
  acceptable.
- **B3. Play must not resize when it renders.** Size its canvases only in `resize()` (`ch7.ts:84,214`; `kit.ts:58`), not
  in `render()`'s `place()`, and do not warm a sleeping canvas. XS effort, no look change.
- **B4. `alpha: false` for the opaque scenes** (`env.ts:27`): hall, gallery, sideboard, Play day and night. XS effort.
  No look change expected; verify the edges.
- **B5. Pause the hero bob while scrolling** (§3.3). XS effort. **Motion change**, barely visible.

### C. Main-thread and paint tunables

All of these leave the look and motion unchanged.

| Fix | Where | Effort |
|---|---|---|
| Stop the Lab re-render on every scroll event: call `setTags` only on a real change; `memo` `Open` | `Lab.tsx:237,265` | XS |
| Seam bands: move panels with transforms, use rect wrappers for the paper copies, take `--seam` off `.site` (§3.1 a–c) | `blocks.ts:62-66`, `seam.ts:68-74`, `hero.css`, `roles.css`, `work.css`, `shell.css` | S–M |
| Drop the permanent `will-change` on the hero letters | `hero.css:18` | XS |
| Lab tree: one progress tween instead of 805 `fromTo` | `Lab.tsx:291-298` | S |
| `restColours`: read every rect first, then write every colour; skip it entirely while scrolling | `seam.ts:130-139` | XS |
| Scenes cache W/H from resize, not `clientWidth` on every render | `hall.ts:136`, `gallery.ts:94`, `sideboard.ts:122,128`, `kit.ts:53` | XS |
| Lab `onScroll`: cache section tops and heights on resize (no `offsetHeight` or `getBoundingClientRect` per event) | `Lab.tsx:123,159,161` | XS |
| Ignore `mouseenter` focus changes while Lenis is scrolling | `RolesIndex.tsx:165`, `WorkIndex.tsx:167`, `Others.tsx:163` | XS |
| Delete OnePage's `scrollY` read and attribute toggle from the hot path, or rAF-throttle `steer` | `OnePage.tsx:45-51` | XS |

### Suggested order

1. **B1, B3, B4 and the C1 Lab re-render.** Same day; no look change. These remove the biggest single stalls (Play's
   wake and self-resize).
2. **A3 queue and no sync finish, then B2.** This addresses the "scroll right after the opening" case.
3. **A2.** This is what removes the 45–50 slow frames of the steady first pass. It needs an owner decision on (a), (b)
   or (c), because all three touch motion.
4. **C seam work.**
5. **A1.** This is the structural end state that deletes the sleeper and its whole class of stalls.

---

## 6. How to confirm the hypotheses (for the runtime-trace auditor)

All of these can be checked on :3100 with `?fps` and the `window.__trace` log, without code changes:

- **Builders running at once:** look for `roles`, `work` and `other projects` "step n took" lines interleaved within
  about 1 s of the opening's end, and for slices over 8 ms (§2.1).
- **Play's resize cycle:** look for "lab chapter 7: asleep", then "warm", then "woken" or a `setSize` self-time burst.
  Trace names come from `keep.ts:77-78`.
- **The Lab re-render on every scroll event:** a "Commit" entry on every scroll event in the Performance panel, with the
  mouse still.
- **Seam-band paint:** Rendering → Paint flashing over y ∈ [0.2H, 0.8H] and [1.2H, 1.8H]; Layers panel for mask layers
  on `.chrome-frame`, the hero's `.night` slot and its paper type layer.
- **Hover-driven redraws:** a trace with the mouse resting at the screen's centre versus at the edge of the window.
