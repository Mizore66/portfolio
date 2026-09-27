# AUDIT.md: Phase 0 of the motion and 3D pass

Branch: `upgrade/motion-3d`. Brief: `UPGRADE_BRIEF.md` (supplied in chat). Date: 2026-09-27.

Phase 0 changed nothing on the site. The only committed changes are `/references/` added to `.gitignore` and this file.

## 0. What the owner needs to decide before Phase 1

**Decided 2026-09-27: the owner approved every recommendation below**, including the items deferred to gate A or Phase 2 (`?at=` for home board state, arrows from the game tree plus the engine's principal variation, the launch-test amendment, the new palette with black-and-white eval bars, and the ≤3 s autoplay opening with a camera push-in).

The brief conflicts with the codebase in five places. Each item gives a recommendation.

1. **`?move=` on the home page.** Today `/?move=<id>` is a server redirect to `/opening-preparation?move=<id>` (`src/app/(site)/page.tsx:28-34`, tested in `e2e/site/home.spec.ts`). The brief wants the home board to sync to `?move=`.
   **Recommendation:** keep the redirect so old shared links still work, and sync the home board to a new `?at=<id>`. The alternative is to repoint `?move=` on `/`, which changes where every link already shared lands.
2. **Candidate-move arrows.** The engine returns one principal variation, not a candidate list (`src/lib/chess/search-job.ts:39-53`). `REBUILD_BRIEF.md` §4.6 says the engine files are "vendor unchanged".
   **Recommendation:** leave the engine alone.
   - *Before* "Start engine": the arrows are the game tree's real alternatives at that position. Every sibling move in `GAME` (mainline, `variation` and `not-taken` nodes) gets an arrow, and its thickness comes from `CAREER_EVALS`. At `d4` those are `exd4`, `closed` (d6?) and `bb6`; at `nf3` they are `nc6`, `elephant` (d5!) and `philidor` (d6?!). Nothing is invented.
   - *After* "Start engine": one bold arrow for the best move, followed by fainter arrows for the rest of the principal variation.
   - The other route is to add MultiPV to the search worker, which means editing vendored engine files.
3. **Sticky-chrome test and the persistent canvas.** `e2e/site/launch.spec.ts:133-143` adds up the height of every `fixed` or `sticky` element touching the top of the screen and fails above 12%. A full-screen fixed `<Canvas>` behind the content (brief §7) counts as 100%.
   **Recommendation:** change the test to skip the `aria-hidden`, `pointer-events: none` canvas layer. That layer is background, not chrome. This needs the owner's approval because it edits a launch check.
4. **Palette authority.** `REBUILD_BRIEF.md` §7 B fixed the palette: slate ink, two board greys, annotation violet, and eval bars in pure black and white. The upgrade brief §6 asks for a new 4–6 colour palette drawn from the board material and book paper.
   **Recommendation:** the upgrade brief replaces the palette, but eval bars stay pure black and white. That is the chess convention, and screen-reader and forced-colours users already depend on it.
5. **The opening sequence: autoplay or scroll?** Illoca's opening is driven by scroll: the visitor moves the camera into the scene (see §2.1). Brief §4 asks for an autoplay replay of 3 s or less.
   **Recommendation:** keep the brief's version (plays once per session, any input skips it, never plays under reduced motion). Add a slow camera push-in from a wide, high angle to the analysis framing. The push-in carries Illoca's feeling of entering a place; the autoplay suits visitors who skim.

These can wait until gate A or Phase 2:

- **Mobile LCP starts over budget.** It is 2.71 s locally, against the 2.5 s limit (§4). The owner should decide which measurement gates §8.
- **`/lab` has no index.** Only `/lab/learned-evaluator` exists. The information-architecture proposal would make `/lab` a new page.
- **Home has no keyboard stepping yet.** ←, →, Home and End for moving through the game are new. Today the board's arrow keys only move between squares after "Start engine" (`AnalysisBoard.tsx:201-211`).
- **No server-rendered board image is in use.** `src/components/site/StaticBoard.tsx` (server-rendered SVG, unit-tested, imported nowhere) is the obvious poster and no-WebGL fallback.
- **The CSP is same-origin.** `connect-src 'self'` (`src/lib/csp.ts:33`) blocks drei's default Draco decoder, which loads from gstatic. Draco, Meshopt and Basis (KTX2) decoders must be served from `/public`. `'wasm-unsafe-eval'` and `worker-src 'self' blob:` already allow them to run.
- **Cursor rules overlap.** §4 says links turn the cursor into a piece glyph, but also that all body text keeps the native cursor. **Recommendation:** use the glyph on navigation, calls to action, project cards and graph marks only. Links inside paragraphs keep the native cursor.
- **The brief's "+0.38" is Deriv's eval** (10. Nbxd2, 38 cp). The latest move, 10…Bg4 (FaultLine), is +0.64 (`src/content/site/career-evals.ts`). The brief only uses the number as a typography sample; nothing needs to change.
- **The notes file has a different name.** It is `references/VIDEO_REFERENCE.md`, singular, not `VIDEO_REFERENCES.md`.

---

## 1. Protecting the repo and extracting frames

- `/references/` is now in `.gitignore` (confirmed with `git check-ignore`). No `.mov` or `references/` file was ever tracked (`git ls-files` is empty), so no history was rewritten.
- **ffmpeg is not installed** on this machine. Playwright's bundled ffmpeg only encodes VP8 and cannot decode these H.264/HEVC files. I did not install anything. Instead I built a 30-line Swift tool on macOS's own AVFoundation (`AVAssetImageGenerator`, zero tolerance) that does the same job as the brief's command: fixed frame rate, 1280 px wide, JPEG.
- All three clips run longer than 30 s (Illoca 44 s, PX PUSH 74 s, Revelatio 60 s), so the main pass used **1 fps** as the brief specifies. Because 1 fps drops transitions, I added **4 fps bursts** around each named transition in `references/<site>/_dense/<moment>/`. Contact sheets are in `references/_sheets/`.
- Kept frames stay in `references/<site>/`. Everything else moved to `references/<site>/_discarded/`. Nothing was deleted, and the `.mov` files are untouched.
- `px/frame_013–016` show the owner's own desktop (a Mail/System Settings dialog) instead of the site. They are in `_discarded/` and not described here.

| Site | Kept | Discarded | Dense bursts |
|---|---|---|---|
| Illoca (`ilioca.mov`) | 29 | 16 | opening 0–7 s, sidebar 6.5–10 s, angled pricing 27.5–31.5 s, angled footer 32.5–38 s |
| Revelatio | 21 | 39 | CRT and text scramble 13–20 s, route to contact 38.5–42 s, contact footer 45.5–48.5 s |
| PX PUSH | 30 | 44 | title 0–3 s, logo dock 16–19 s, glitch transition 23.5–27 s, floppy disk 31.5–35.5 s, page transition 52.5–56 s |

---

## 2. Reference teardown, one entry per moment in the owner's notes

### 2.1 Illoca: the opening frames

- **Frames:** `ilioca/frame_001–007`; dense `ilioca/_dense/opening/` (0–7 s).
- **What happens:**
  1. The page opens on an illustrated 3D room: a person at a drafting desk by a window over a city skyline. It uses two flat colours, a cobalt blue and a warm paper beige, with no gradients.
  2. The headline "Design at the speed of thought" sits *above* the scene, not on it.
  3. When the visitor scrolls (0–1.25 s), the headline leaves upward and the camera starts moving.
  4. From 1.5–3 s the camera arcs from a frontal view to a high over-the-shoulder view and settles above the desk.
  5. From 4–5.5 s a flat sheet on the desk flips up out of the plan, turns over and lands with an isometric sketch printed on it. The person's hand and pencil move as they draw.
- **Likely technique:** a WebGL scene (unlit, toon-style flat shading, baked shadows as geometry) with a camera path scrubbed by scroll (ScrollTrigger `scrub` driving camera position and target along a spline). The flipping sheet is a plane with a keyframed rotation.
- **Chess translation (§3 confirmed, with one addition):** the board replays the game from the starting position to 10…Bg4. Borrow the camera move as well as the replay: start high and wide, looking down at the board on the table as a whole object, then push in to the analysis framing while the moves play. The push-in gives the "entering an environment" feeling; a replay on its own would feel like a tutorial.
- **Note versus frames:** the note calls it "an animation of someone designing a plan". The frames show the drawing happens *during the scroll-driven camera move*, not as a timed intro. See decision 5.

### 2.2 Illoca: scroll transitions with incoming sidebars

- **Frames:** `ilioca/frame_008–016, 020, 021, 024, 025`; dense `ilioca/_dense/sidebar/`.
- **What happens:**
  1. At a waypoint the WebGL viewport **narrows**. Its left or right edge moves inward and uncovers the paper background beneath.
  2. In the freed column, a text block (small handwritten-style kicker, large title such as "Augmented Sketch", two lines of body copy, "Watch the demo") slides in about 40 px from the page edge and fades up.
  3. When the next waypoint arrives, the panel slides back out, the viewport widens to full bleed again, and the next panel enters on the *other* side ("Adaptive Massing" on the right, then "Prompted Plans" on the left, "Agentic Refinement" on the right, "Instant Facades" on the left).
  4. Text never sits on top of the canvas.
- **Likely technique:** a pinned section. A scrubbed timeline animates `clip-path: inset()` on the canvas wrapper and `x` plus `opacity` on the panel. The camera keyframes move in step, so the subject stays centred in the narrower viewport.
- **Chess translation (§3 confirmed, refined):** margin annotations, as printed in a games book. Two changes from Illoca:
  - They sit in **one** outer margin, always the same side, because a chess book never alternates.
  - They slide in beside the text entry they annotate (Experience, Selected work), not beside the board, and move a short distance at reading pace.
  - Illoca's clip rule carries over: annotation text never overlaps the canvas.
  - Sources are existing copy only: `OVERLAP_NOTE` and `RETRIEVAL_SPLIT` (`src/content/site/roles.ts:3-7`) and each claim's `context` line (`src/content/site/claims.ts`, e.g. `derivGoService`: "running in staging, not production.").
- **Note versus frames:** none.

### 2.3 Illoca: the final frames arriving at an angle

- **Frames:** `ilioca/frame_028–031, 033–037`; dense `ilioca/_dense/angled-pricing/`, `angled-footer/`.
- **What happens:**
  1. After a navy "Open Letter" section with slowly tumbling 3D letter-blocks, a **manila folder** with a "PRICING" tab rises from the bottom edge tilted about −8° and straightens to 0° as it reaches the top (27.75–29 s). The pricing cards on it are placed a little crooked, like paper on a desk.
  2. The next folder ("FAQS" tab) arrives the same way (30–33.75 s).
  3. The last folder then **leaves** upward at an angle (34–35 s) and uncovers a blueprint: a white-line isometric drawing of the logo on blue.
  4. Finally the footer card rises tilted about −3° and settles flat (35–35.25 s). A beige corner of the last folder stays pinned top-left.
  5. Scrolling back up reverses all of it.
- **Likely technique:** DOM sections with `transform: rotate()` and `translateY` scrubbed by ScrollTrigger, and `transform-origin` at a bottom corner. No WebGL is needed for the folders. The blueprint is a static SVG or a line render.
- **Chess translation (§3 confirmed, improved):** the ending is the game's unfinished position, the `outlook` node already in the data (`game.ts:543-555`): "11. …", titled "The Open File", with the contact links attached. Two parts:
  - The **scoresheet** slides across the table at a slight angle and settles, as Illoca's folders do. This is DOM and cheap.
  - The **board is framed from a low, raking camera angle** with White to move.
  - Keeping the tilt on the paper and the camera move on the board uses Illoca's real mechanism and avoids flying the 3D board around.
- **Note versus frames:** none. The frames show the "angle" is *paper tilting and settling*, not a camera angle, which suits a scoresheet well.

### 2.4 Revelatio: the title screen made of coloured `@` characters

- **Frames:** `revelatio/frame_001, 011, 012, 019–023`; dense `revelatio/_dense/crt-scramble/`; full-resolution crop confirms the glyphs.
- **What happens:**
  1. A live video of the team plays inside a **CRT-shaped screen** (a rounded rectangle with barrel-curved edges).
  2. Each pixel cell of the video is drawn as a monospace glyph, `@ M 8 # $ 6 2 ? / .`, picked by brightness and **tinted with that cell's video colour**.
  3. When the page loads (17.0–17.5 s) the screen **powers on** as a thin horizontal line that opens vertically.
  4. The headline ("Branding, Product Design & Code. One integrated vision.") decodes from symbol noise (`Bra++?!%* Pr#@?@!…`) to the real words, left to right, in about 0.75 s.
  5. On scroll, the screen scales up and flattens to full bleed.
- **Likely technique:** a WebGL fragment shader over a video texture. It divides the screen into cells, maps each cell's luminance to an index in a glyph atlas, and multiplies by the sampled colour. The curvature is barrel distortion of the UVs plus a mask. The text decode is a character-scramble tween.
- **Chess translation (§3 confirmed, narrowed):** used only in the engine view, where the board is redrawn the way an engine prints it:
  - The ramp uses chess characters. Squares are `.` for light and `:` for dark (or `+`), pieces are `K Q R B N P` (upper case for White, lower case for Black), and the border carries files `a–h` and ranks `1–8`. `+` and `#` mark check and mate. Colour comes from the board material, not from video.
  - **Drop the CRT shape and the power-on line.** Those belong to televisions. Terminal chess engines printed plain text boards with coordinates, so that is the chess-world version.
  - Drop the headline scramble too: decoding the eval readout would be decoration, and the eval is a fact.
- **Note versus frames:** the note says "coloured `@` symbols". The crop shows a mixed ramp (`@ M 8 # $ 2 6 ? /`) in which `@` marks only the brightest cells.

### 2.5 Revelatio: the custom cursor

- **Frames:** `revelatio/frame_003, 019, 021, 034, 036, 049, 051`.
- **What happens:**
  - A plain **white dot about 8 px across** sits exactly at the pointer, with no visible lag in any frame.
  - Over the interactive footer wordmark a small grey pill reading "Click to interact" rides next to the dot.
  - Native browser UI, such as the "Please fill out this field" validation bubble on the contact form, still appears, so the dot only adds to the pointer and never covers it.
- **Likely technique:** a `position: fixed` element moved with `transform` inside `pointermove` (no easing), `pointer-events: none`, plus a label shown by a `data-cursor` attribute on hover targets.
- **Chess translation (§3 confirmed, sharpened):** Revelatio's dot *is* the dot an analysis board draws for a legal move. So:
  - Over the board, the pointer shows the legal-move dot and the square under it highlights.
  - Over navigation, calls to action, project cards and graph marks, it becomes a small piece glyph that steps one square on click.
  - Body text and inline links keep the native cursor.
  - Fine-pointer devices only. Turned off under reduced motion. Never eased.
- **Note versus frames:** none.

### 2.6 Revelatio: the "Get in touch" page

- **Frames:** `revelatio/frame_041, 044–048, 054, 055`; dense `revelatio/_dense/to-contact/`, `contact-footer/`.
- **What it does:**
  1. **Route transition:** fade to black (0.25 s), hold (about 0.75 s), then the page fades up.
  2. **Two columns.**
     - Left: one large sentence ("Got a project in mind, a wild idea, or just want to say hey? We're all ears.") and a two-state toggle (Local client / International client).
     - Right: a *conversational* form in which every label is a question ("What should I call you?", "Where do I reach you?", "How did you find me?", "Which services do you need?" as chips, a budget select, a delivery date, "Tell me about your project", "Send Request"). "Book a call" is pinned bottom-left.
  3. **Place and time:** a blurred office photo with the address, and **two live clocks**: "Your Timezone (AS) 04:46:00" beside "Revelatio Timezone (BR) 17:46:00".
  4. **Link list** ("Let's build something together": Get a quote / Join our team / Just say hello). Each label decodes from scrambled characters.
  5. **Footer wordmark** drawn in characters. Clicking it drops every character to a heap on a baseline, and then they rise and reassemble.
- **Likely technique:** a native form with CSS; `Intl.DateTimeFormat` with `timeZone` for the clocks; a character-scramble tween; a 2D canvas particle system with simple gravity for the wordmark.
- **Chess translation (proposal, to be decided at gate A):**
  - The two clocks map almost directly onto a **chess clock**, with two faces:
    - *Your time*: the visitor's local time, running, with a lit flag.
    - *Anas*: Malaysia Time, from the existing `IDENTITY.location` "Bandar Sunway, Selangor, Malaysia", stopped, because Black has just moved (10…Bg4).
    - It is White's move, and the visitor plays White.
  - The contact channels (Email, Copy email, LinkedIn, GitHub, phone, Résumé) become rows on the scoresheet under "11. …". They are the same links and copy already in `Contact.tsx` and `CONTACT_LINKS`.
  - **No form:** there is no backend, and the brief forbids new copy.
  - **Leave out** the physics wordmark (§5 bans particle fields) and the scramble links (decoration).
  - The clock needs two short new labels ("Your time" and the owner's name). These are UI labels, not new copy, but they are flagged for approval.
- **Note versus frames:** none.

### 2.7 PX PUSH: the title screen

- **Frames:** `px/frame_001, 002, 003, 005, 006, 008`; dense `px/_dense/title/`.
- **What happens:**
  - A cloud-flight WebGL sky fills the screen behind a **CRT overlay** (scanlines, bloom and vignette on every page).
  - One huge condensed headline, "On-Demand Design Department ●", scrolls sideways as a marquee under a hairline rule.
  - A **chrome 3D badge** spins in the centre, so its edge shows as it turns.
  - Two small details sit in the corners: a little monitor window bottom-left that cycles through work thumbnails, and terminal-style mono copy bottom-right ("Welcome to PX PUSH… Scroll down to access department").
- **Likely technique (Codrops case study, 7 Aug 2026):**
  - The badge is an SVG loaded with `SVGLoader`, extruded with bevels, and lit with a metalness and clearcoat material under a PMREM environment.
  - The clouds are 8,000 planes merged into one buffer geometry, with a custom shader for edge fade and fog.
  - The CRT is pure CSS: a scanline bar animated over 8 s, a repeating line pattern, `backdrop-filter` bloom, and a vignette PNG.
- **Chess translation (§3 confirmed):** one confident idea, the board by itself with the name and headline set in notation-grade type. No marquee (that is PX's signature), no CRT, no sky. The PX lesson is *restraint around one object*, not its props.
- **Note versus frames:** none.

### 2.8 PX PUSH: scroll transitions

- **Frames:** `px/frame_017–019, 025–027, 030, 032, 039, 058`; dense `px/_dense/logo-dock/`, `glitch-transition/`.
- **What happens, in order of importance:**
  1. **The logo docks.** As the hero scrolls away, the chrome badge shrinks from the centre into the middle of the header and stays there. Its spin follows **scroll velocity**: faster scrolling spins it faster, and reversing the scroll reverses the spin.
  2. **Paragraph fill.** Words in body paragraphs darken from grey to ink as they scroll into place.
  3. **Headline assembly.** Words of a headline appear scattered and move into position ("a", "new level", "you'll" → "It's a whole new level — you'll wonder how you managed before.").
  4. **CRT band wipes.** Horizontal blue bars tear across the screen between colour sections.
  5. **Stacked list.** A sticky list pins each item ("Totally async", "Fixed monthly rate", …) and folds the previous one down to a single row.
- **Likely technique (Codrops):**
  - Lenis is ticked by hand from the GSAP clock through one `tickLenis` hook, so smooth scrolling and every ScrollTrigger run on one heartbeat. It is off on mobile.
  - Logo spin: `target = clamp(-velocity * strength)`, decayed by ×0.9 each frame and lerped at 0.16.
  - Marquee title words use `stagger: { each: 0.03, from: "random" }` with a `rotationX` perspective.
  - Effects are attached **declaratively** through attributes (`effect__titleRandom`, `effect__fadeOut`, `effect__separatorIn`) by one function that runs after every page load. This is exactly the registrar in brief §7.
- **Chess translation:**
  - **Docking, with a better version:** the hero board docks into the existing sticky board pane (`.board-pane`, `site.css:53`, 380 px on desktop) as the visitor scrolls into the career. The board they watched play becomes the board that follows their reading.
  - **Velocity spin: rejected.** A board does not spin, and §6 asks for motion that is "unhurried, weighted, deliberate".
  - **CRT band wipes: rejected** (television-world).
  - **Paragraph fill: rejected**, because it holds facts back until the visitor scrolls. That breaks `REBUILD_BRIEF` "facts never sit behind interaction".
  - **Headline assembly:** becomes the brief's annotation reveal (move number, then move, then glyph), on major section titles only.
  - **The declarative registrar is adopted as it stands.**
- **Note versus frames:** none.

### 2.9 PX PUSH: 3D assets

- **Frames:** `px/frame_033–036, 049, 054–056`; dense `px/_dense/floppy/`, `page-transition/`.
- **What happens:**
  - A **3.5″ floppy disk** (glTF) sits beside the pricing marquee. It rotates and tilts with scroll progress, turning edge-on as the pricing rows pass, and its glossiness map is recoloured at runtime on a canvas.
  - The chrome badge reappears large on every page start.
- **Likely technique:** a separate Three.js build for each asset (logo, clouds, disk) with scroll-scrubbed transforms. Codrops gives no asset sizes.
- **Chess translation (§3 confirmed):** the board and its six pieces are the only 3D asset. They are instanced turned pieces, and they appear in one persistent canvas (brief §7) rather than one build per asset. PX's use of *one object beside the text, moving with scroll* becomes: the moved piece lifts and settles in the docked board as each section's move comes up.
- **Note versus frames:** none.

### 2.10 PX PUSH: separate portfolio, profile and journal pages

- **Frames:** `px/frame_048, 050, 051, 054, 056, 059, 060, 064`; dense `px/_dense/page-transition/`.
- **What happens:**
  - Index, About and Journal are separate routes. They share a header (logo, the chrome badge in the centre, Index / About / Journal / "Get started ●") and a footer (a giant distorted wordmark).
  - Each page opens on a marquee of its own name ("About ● About ●", "Journal ● Journal ●").
  - **The page transition, in order:**
    1. The nav label scrambles.
    2. The content clears to black.
    3. The badge comes from the header to the centre of the empty page.
    4. A hairline rule draws in.
    5. The marquee title slides up behind the rule as a mask.
    6. The badge spins, the body appears, and the badge docks again as the visitor scrolls.
  - About holds the company, "Department Heads" portraits that turn through 15 angles as you scroll, and FAQs.
  - Journal is a list of articles. Each article opens as a sheet of office paper with punch holes, drawn with a CSS mask, sliding over the list. Every article keeps its own URL, canonical, OG tags and BlogPosting schema.
- **Likely technique:** Nuxt route transitions that wait on a page-ready event, with the badge's WebGL canvas kept alive across routes.
- **Chess translation (§3 confirmed):** split this site into `/` (short overview), `/work`, `/about` and `/lab` (the journal). The **persistent board** plays the role of PX's persistent badge: on a route change the canvas stays mounted and the camera re-frames, so the board is the thread between pages.
  - Opening a project: its piece slides to its square, then the page changes; going back plays the move in reverse ("takeback", brief §4).
  - Every Journal article keeps its own URL and schema. That matches the current rule that `/projects/*` and `/lab/*` URLs never change.
- **Note versus frames:** the note says "tertiary page for journalism". The frames show it is a *journal* (written articles), which matches the brief's `/lab` as journal.

---

## 3. Codebase audit

### 3.1 Stack

- Next.js **16.2.4** on the App Router with Turbopack builds, and React **19.2.4**. `experimental.globalNotFound` is on.
- Styling is Tailwind **v4** (`@theme` in `src/app/(site)/site.css`, 337 lines).
- Runtime dependencies: `next`, `react`, `react-dom`, `pdfkit`, `@vercel/analytics`.
- **three, @react-three/\*, gsap, lenis and zustand are all absent.** State is plain React: one context, `GameContext` in `src/components/game/FrontGame.tsx:20`, holding `useState(nodeId)`.

### 3.2 Routes, all in the `src/app/(site)/` group unless noted

| Route | Source | Notes |
|---|---|---|
| `/` | `page.tsx` | `?path=ml\|product\|devtools` filters the work list. `?move=<id>` and `?tape=1` redirect to `/opening-preparation`. |
| `/projects/[slug]` | `projects/[slug]/page.tsx` | `generateStaticParams`, `dynamicParams = false`. Slugs: `faultline`, `gemini-teleportal`, `circuitmindai` (featured); `rexcheck`, `veridian`, `multi-agent-graphrag`, `mirrorfi`, `financial-risk-predictor`, `distributed-lead-scorer` (archive); `slm-distillation-engine` (lab group). |
| `/lab/learned-evaluator` | static | The only lab route. There is no `/lab` index. |
| `/opening-preparation` | reads `?move=` | Canonical is `?move=X` unless X is `d4`. |
| `/colophon` | | |
| `/print-edition` | `src/app/print-edition/route.ts` | Letter by default, A4 with `?paper=a4`. Excluded from the sitemap. |
| OG images | `opengraph-image.tsx` for home, each project, opening-preparation and lab | 1200×630 via `src/lib/og.tsx`. |
| `/icon`, `/sitemap.xml`, `/robots.txt`, global 404 | `src/app/` | |

Redirects:
- `/about` → `/#about` and `/archive` → `/#work` (`next.config.ts:25-30`). **The information-architecture split turns `/about` into a real page, which reverses the first of these.**
- `src/proxy.ts` sends www and the `*.vercel.app` alias to the apex with a 308.

### 3.3 Anchors on the home page

- Sections: `#main`, `#proof` (hero), `#career` (graph), `#work`, `#experience`, `#skills`, `#education`, `#lab`, `#about`, `#contact`, `#the-game` (board pane).
- Roles: `#deriv`, `#skribble-lab`, `#monash-university`, `#western-digital`, `#setel`, `#petronas`.
- Projects: one per project slug (featured cards and archive `<li>`s). A project hidden by `?path=` loses its anchor.
- Claims: `#claim-<id>`.
- The header nav links to `/#work`, `/#experience`, `/#lab`, `/#about` and `/#contact` (`SiteHeader.tsx:4-10`).

All of these need client-side redirects if the information-architecture split goes ahead.

### 3.4 The career-to-move data (single source of truth)

- **Moves:** `src/content/site/game.ts`.
  - Types: `GameNode` has `id`, `parent`, `type` (`mainline | variation | not-taken`), `uci`, `san`, `moveNumber`, `color`, `sym`, `title`, `fact`, `commentary`, `links`, `claims` and `career`.
  - `LATEST_MOVE = "faultline"` (10…Bg4), `DEFAULT_MOVE = "d4"`.
  - The game ends on the `outlook` node, "11. …", which carries the contact links.
- **Engine evals:** `src/content/site/career-evals.ts` (`CAREER_EVALS` in centipawns, measured at 6,000 nodes).
- **Line:** `src/content/site/line.ts` (Giuoco Piano, C54, 20 plies).
- **Dates:** in `roles.ts`, `projects.ts` and `education.ts`, joined by `career.ts` (`careerPoints()`).
- **Helpers:** `game-tree.ts` (`moveLabel` → "10…Bg4", `enginePliesTo`, `gameNode`, `resolveMove`).
- **Consequence for the store:** the brief's "current move index" should be a **node id** (`GameNode.id`), not an integer. The tree has side lines, and ids are what `?move=` and every test already use.

### 3.5 The 2D board, chart and engine

- **Board:** `src/components/game/AnalysisBoard.tsx`, a CSS grid of divs that become buttons after "Start engine". The position is a list of `{from,to}` plies replayed by `src/lib/chess/replay.ts` (FEN is not used).
  - Screen-reader text: `describePosition` (L40–48, "White: king e1, …"), rendered as `sr-only` at L288, plus a polite live region (L289–291).
  - Keyboard: a roving tabindex, arrows move between squares, Enter or Space plays, Escape clears. This only works after the engine starts.
- **Chart:** `src/components/game/CareerGraph.tsx`, hand-written SVG with a `ResizeObserver`. Each point is an `<a>` that calls `select(nodeId)`. **"Show as a table"** is a native `<details>` at L173–197 and needs no JavaScript.
- **Engine:** clicking "Start engine" runs `await import("@/lib/chess/engine")`.
  - `src/lib/game/engine-client.ts:23` creates the worker lazily (`search.worker.ts`, module worker).
  - Search goes to depth 12 in a 1.5 s budget.
  - `nnue.wasm` (6.4 KB) and the learned weights load only when "Learned" is chosen.
  - Output: depth, nodes/s, eval, one principal variation and the best move. The search pauses when the tab is hidden.
- **Static board image:** none is in use. `StaticBoard.tsx` exists, server-rendered and tested, but nothing imports it.
- **Animation today:**
  - CSS only: the button press, a 1.5% thumbnail zoom, the eval-bar height, and a scroll-driven reading bar on mobile.
  - `animationPlan` (`replay.ts:181`, an 80 ms stagger) is dead code.
  - A global `prefers-reduced-motion` rule turns off every animation and transition (`site.css:335-337`).

### 3.6 Fonts and tokens

- Fonts come from `next/font` in `src/app/(site)/fonts.ts`:
  - Schibsted Grotesk 400/500 for sans.
  - Literata italic for the commentary voice.
  - Noto Sans Symbols 2, cut down to the chess glyphs.
  - Commit Mono 400 for mono, with `preload: false`.
- **Tabular figures are used nowhere** (no `tnum` or `font-variant-numeric`). The real ellipsis `…` is already used in `moveLabel`.
- Tokens: `--color-ink #14181d`, `--color-muted #4a5561`, `--color-rule #d7dde3`, `--color-board-light #e4e8ec`, `--color-board-dark #7d8a99`, `--color-annotation #6d3fd6`, `--color-paper #ffffff`.
- There are no easing or duration tokens and no dark mode (`colorScheme: "light"`).

### 3.7 Metadata

- The origin is `NEXT_PUBLIC_SITE_URL ?? "https://anasqumhiyeh.dev"` (`src/lib/site.ts:2`).
- Canonicals are set per page.
- JSON-LD: `personSchema` and `websiteSchema` in the layout, `projectSchema` on project pages, an inline `Article` on the lab page. All go through `SiteJsonLd.tsx` with the CSP nonce.
- The sitemap lists `/`, `/opening-preparation`, `/lab/learned-evaluator`, the 10 projects and `/colophon`.

### 3.8 Guardrails the upgrade must keep

- **CSP** (`src/lib/csp.ts`):
  - `default-src 'self'`, `img-src 'self' data: blob:`, `connect-src 'self'` plus Vercel analytics, `worker-src 'self' blob:`.
  - There is no `unsafe-eval`, but `wasm-unsafe-eval` is allowed.
  - All 3D assets and decoders must therefore be served from our own origin.
- **Tests that motion work will touch** (`e2e/site/launch.spec.ts`):
  - With reduced motion, `document.getAnimations()` must be zero (L180–186).
  - The site must read with no JS and with no CSS (L188–206).
  - Sticky chrome may cover at most 12% of the screen (L133–143; see decision 3).
  - The home page must be under 14,000 px tall.
  - Touch targets must be at least 44 px.
  - There must be no overflow from 320 to 1920 px.
  - Forced colours and Save-Data must work.
- **Tests in `e2e/site/game.spec.ts`:** no engine requests or worker before "Start engine", and weights only for Learned.
- **`REBUILD_BRIEF.md`:**
  - Chess is "a tool, not a costume".
  - Facts never sit behind interaction.
  - No autoplay loop anywhere.
  - Engine files are vendor unchanged.
  - Save-Data skips decorative loads. The whole 3D chunk counts as decorative, so it should be skipped under Save-Data.

---

## 4. Performance baseline

Local production build (`next build && next start`, Next 16.2.4 Turbopack), Lighthouse 12.8.2, headless Chrome. Mobile uses the default Moto G Power emulation with slow 4G; desktop uses `--preset=desktop`. Each figure is the median of 3 runs. PageSpeed Insights (production) could not run because its anonymous daily quota was used up. The owner's last production run was 95 / 100 / 100 / 100 with LCP 2.1 s (`docs/superpowers/2026-09-25-owner-review.md`).

| Route | Form factor | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | FCP | LCP element |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 96 | 100 | 100 | 100 | **2.71 s** | 0.000 | 9 ms | 1.21 s | `<p class="hero-subline">` (text) |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.61 s | 0.000 | 0 ms | 0.33 s | `<h1 class="hero-statement">` (text) |
| `/projects/faultline` | mobile | 97 | 100 | 100 | 100 | **2.64 s** | 0.000 | 8 ms | 1.21 s | FaultLine proof-page screenshot `<img>` |
| `/projects/faultline` | desktop | 100 | 100 | 100 | 100 | 0.65 s | 0.000 | 0 ms | 0.33 s | same `<img>` |

Lighthouse 12/13 crashed against Chrome 151 while taking the full-page screenshot, so every run used `--disable-full-page-screenshot`. Without that flag the renderer closes on the tall home page.

**Mobile LCP is already over the §8 limit of 2.5 s before any work starts**, by 0.14–0.21 s under Lighthouse's simulated slow 4G. The owner's production run measured 2.1 s. Either way there is no headroom. **Recommendation:**
- Make the §8 gate the production run, confirmed by field data.
- In Phase 4, first move the hero text's LCP earlier (preload the Schibsted weight the hero uses; check `font-display`), before anything 3D is added.
- Keep the LCP element text or the static board image, as §8 requires.

Initial JavaScript, measured in Playwright (the sum of every script response on load, gzip level 9):

| Route | Scripts | Decoded | Gzipped |
|---|---|---|---|
| `/` | 9 | 547.1 KB | **159.7 KB** |
| `/projects/faultline` | 9 | 531.0 KB | 153.8 KB |

**§8 budget:** home initial JavaScript may reach **189.7 KB gzipped** at most (+30 KB). Everything 3D must load in a lazy chunk after the page is interactive.

---

## 5. The "Must not regress" list and what already tests it

Phase 5 will tick every row.

| Item | Covered today by |
|---|---|
| All routes return 200, including `/print-edition` in both paper sizes | `e2e/document.spec.ts`, `e2e/site/print.spec.ts` |
| `/projects/*`, `/lab/*`, `/opening-preparation`, `/colophon` | `e2e/site/project.spec.ts`, `game.spec.ts`, `launch.spec.ts` |
| `?path=` filters and the back link keeping the filter | `e2e/site/home.spec.ts`, `project.spec.ts` |
| Every `?move=` id resolves; `/?move=` redirects | `e2e/site/game.spec.ts`, `home.spec.ts` |
| Legacy fragment ids, including `#the-game` | `e2e/site/home.spec.ts` |
| Copy, numbers, qualifiers and footnotes word for word | `src/**/front-page.test.tsx`, `claims.test.ts`, `projects.test.ts`, `roles.test.ts`. **Add in Phase 5:** a snapshot of the rendered text on every route. |
| One source for moves, dates and evals | `game.test.ts`, `line.test.ts` |
| "Show as a table" | `e2e/site/game.spec.ts` (table toggle) |
| Engine loads only on user action | `e2e/site/game.spec.ts`, `home.spec.ts` |
| Screen-reader position text | `AnalysisBoard.tsx:40-48`. **Add:** an assertion in e2e. |
| Metadata, OG, canonical, JSON-LD | `schema.test.ts`, `project.spec.ts`, `print.spec.ts` (OG is PNG) |
| Full content in the server HTML before JavaScript | `launch.spec.ts:188-206` (no-JS and no-CSS reading) |
