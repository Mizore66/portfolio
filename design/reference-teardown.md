# Reference teardown

Copied on 2026-09-28 from §2 of the v2 `AUDIT.md` (motion and 3D pass, 2026-09-27), as REDESIGN_BRIEF.md §6 Phase 0 step 4 asks.

**Read the "Chess translation" bullets as history, not direction.** They were written for v2, whose fixed points (the sidebar board pane, the analysis-board layout, "no new copy", facts never behind interaction) no longer apply. The "What happens", "Likely technique" and "Note versus frames" parts are the reusable teardown. Frame paths refer to `/references/` (gitignored, local only).

## The owner's notes

Verbatim from `/references/VIDEO_REFERENCE.md` (the brief calls it `VIDEO_REFERENCES.md`; the file is singular):

> ilioca: I like the beginning and ending frames of the site as it immerses the user in an environment that feels different than a website as the screen shows an animation of someone designing a plan. I also like transitions through the scroll animations with the incoming sidebars explaining more, along with the final frames coming in from an angle giving some life to the site
>
> revelatio: I only like their title screen with the tv screen made out of coloured @ symbols, i find it very creative along with the custom cursor. They're Get in touch page is a neat idea too
>
> px: Title screen is gorgeous and simplistic really giving brand identity without looking corporate it;s very personal flavoured. Scroll transitions where amazing as well, along with their usage of 3D assets. Lastly i like how they seperated their portfolio and profile to be seperate pages along with tertiary page for journalism

## 2.1 Illoca: the opening frames

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

## 2.2 Illoca: scroll transitions with incoming sidebars

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

## 2.3 Illoca: the final frames arriving at an angle

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

## 2.4 Revelatio: the title screen made of coloured `@` characters

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

## 2.5 Revelatio: the custom cursor

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

## 2.6 Revelatio: the "Get in touch" page

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

## 2.7 PX PUSH: the title screen

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

## 2.8 PX PUSH: scroll transitions

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

## 2.9 PX PUSH: 3D assets

- **Frames:** `px/frame_033–036, 049, 054–056`; dense `px/_dense/floppy/`, `page-transition/`.
- **What happens:**
  - A **3.5″ floppy disk** (glTF) sits beside the pricing marquee. It rotates and tilts with scroll progress, turning edge-on as the pricing rows pass, and its glossiness map is recoloured at runtime on a canvas.
  - The chrome badge reappears large on every page start.
- **Likely technique:** a separate Three.js build for each asset (logo, clouds, disk) with scroll-scrubbed transforms. Codrops gives no asset sizes.
- **Chess translation (§3 confirmed):** the board and its six pieces are the only 3D asset. They are instanced turned pieces, and they appear in one persistent canvas (brief §7) rather than one build per asset. PX's use of *one object beside the text, moving with scroll* becomes: the moved piece lifts and settles in the docked board as each section's move comes up.
- **Note versus frames:** none.

## 2.10 PX PUSH: separate portfolio, profile and journal pages

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

