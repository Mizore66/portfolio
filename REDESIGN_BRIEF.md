# REDESIGN_BRIEF.md — anasqumhiyeh.dev, version 3

## 0. Why this brief exists

The previous brief (`UPGRADE_BRIEF.md`) produced exactly what it asked for: the old site with motion and 3D added. It protected the old layout, copy and structure, so the result still reads as an interactive résumé. It is a well-built one, with a sidebar board, pill tags and bordered boxes.

**This brief is a redesign, not an upgrade.** The goal is a portfolio at the level of an Awwwards Site of the Day. Experience comes first. Hiring clarity is protected by a separate résumé mode (§2), not by holding the experience back.

Work in the **existing repository, on a new branch** (for example `redesign-v3`), created from the current production branch. The live site stays on its own branch and keeps deploying unchanged. The old code is read once, in Phase 0, to extract content, and then **removed from this branch** so that nothing structural carries over. Git history keeps it, and the production branch still has it.

Read this whole file before doing anything. Stop at every **Gate** and wait for the owner's decision.

---

## 1. Fixed points (the only things that are not open)

1. **Chess stays as the world**, but it is reinvented as *art direction*, not shown as *features*. See §3.
2. **Every claim stays truthful.** Numbers keep their qualifiers ("Production", "Controlled evaluation", "Capability", "Award"). Copy can be shortened and rewritten, but never inflated.
3. **Résumé mode exists** and is reachable in one click from every screen, including the loader. See §2.
4. **Contact is easy.** Email, LinkedIn and GitHub are reachable from every page.

Everything else is open: layout, navigation, page structure, typography, palette, copy length, and whether any existing feature (analysis board, move list, eval chart, in-browser engine, chess clock) survives.

---

## 2. Two modes

### Experience (the award site)

- Low text density. Aim for **20 words or fewer per screen** outside project detail pages. Each project gets one line and one number on its way in; detail lives on its own page.
- A short loader is allowed if it is designed as part of the experience. Keep it at 2.5 s or less on a normal connection, and always show a skip link to résumé mode.
- Heavier 3D, full-bleed compositions and cinematic camera work are allowed.
- Sound is allowed as **opt-in only**, with a visible toggle that defaults to off.

### Résumé mode (for hiring)

- A route such as `/resume`. Build on the existing print edition content.
- Plain, fast and complete: every role, project, number, qualifier and link from the current site.
- No WebGL and no animation. **LCP ≤ 1.5 s.** Prints cleanly on A4 and US Letter.
- Designed in the same visual language (type and palette), so it feels like a page from the same book, not a fallback.

---

## 3. Chess as art direction

The old site shows chess as UI: a board widget, a move list, a clock. PX PUSH does not display a 1988 computer; the whole site behaves as if it was made in 1988. This site must do the same with chess.

The governing question is now:

> **If a great art director made a film, a book or an exhibition about this career, set entirely in the world of chess, what would it look like?**

Chess can show up as sculpture, light, typography, notation, time, space, sound, ritual, or the engine's view of the game. It does not have to show up as a playable board.

### Territories for the concept round

These are starting points, not answers. Phase 1 must include at least one concept that is not from this list.

- **The Study.** Pieces as monumental sculpture in a dark space. Dramatic single-source lighting, a slow cinematic camera, and a piece filling the screen. Each project is a piece, lit and framed like a museum object.
- **The Annotated Book.** Type-led and editorial. Giant figurine notation, and pages that turn like a printed collection of games. The move `10…Bg4` is set at poster size. The 3D is sparing and precise.
- **Blindfold.** The board is almost never shown. Everything is notation, coordinates and the visitor's imagination, with the board appearing only in brief flashes. Minimal, typographic, and possibly character-rendered, drawing on the Revelatio reference.
- **The Engine's Mind.** The site as the engine sees it: search trees branching, evaluations as landscapes, candidate lines lighting up. Generative and abstract, and closest to "AI engineer".
- **Over the Board.** Tactile and warm: felt, lacquered wood, the tournament clock, the hall at night. Near-photoreal 3D and close-ups, drawing on Illoca's warmth.

### Use of the references

The owner's reference notes in `/references/VIDEO_REFERENCES.md`, and the frame teardown from the previous `AUDIT.md`, still apply. Copy both into the new repo. The moments the owner liked are Illoca's immersive opening and ending, sidebars and angled entrances; Revelatio's character-built title screen, cursor and contact page; and PX PUSH's personal title screen, scroll transitions and 3D. Every concept should say which of these it uses and how.

---

## 4. Explicitly out

- Any layout, component or style from the old site: the fixed right sidebar, pill tags, bordered boxes, filled and outlined button pairs, the filter bar with counts, the beige contact panel.
- A component-kit look in general. Buttons, tags and cards should not look like they came from a UI library.
- A stock chess set with default lighting. Every 3D asset is art-directed: material, lighting and environment are chosen deliberately.
- Raw product screenshots as project imagery. Every project gets art-directed cover imagery (§6, Phase 4).
- Liquid glass, shader gradient washes, particle fields and decorative grain.
- Scroll-jacking that makes a trackpad feel broken. Pinned and choreographed sections are fine; losing control of scroll is not.
- Sound that plays without the visitor opting in.

---

## 5. Quality bar

Awwwards juries score design, usability, creativity and content. Before presenting any frame or build, check it against this list and report the results honestly:

- Each screen has **one dominant element**, with clear scale contrast between it and everything else.
- The first five seconds contain the site's signature moment.
- Every transition connects the two states it moves between. Nothing just fades out and fades in.
- Typography is a design element, not just a vehicle for text: at least one typographic moment per page at a scale that would not appear on an ordinary site.
- Mobile is designed as its own composition, not squeezed from desktop.
- Nothing on screen could be mistaken for a template or a copy of a reference site.
- Someone who knows nothing about chess still understands it is about a career, and someone who knows chess notices the details.

---

## 6. Phases and gates

### Phase 0: Content extraction and clean slate

1. **Branch.** Check that the working tree is clean, then create `redesign-v3` from the current production branch. Never commit to or merge into the production branch during this project. Confirm with the owner which branch is production if it is not obvious.
2. **Extract content.** Read the current code once and write `content/content.json`: roles, projects, dates, every number with its qualifier, links, existing chess data (moves, evals, opening name), and the list of image assets. Copy the assets into `content/assets/`.
3. **Capture the voice.** Write `content/voice.md`: the lines of copy that carry the owner's voice (for example "I like systems that have to survive measurement" and "including the ones that lose"). They are raw material for the rewrite.
4. **Keep what is reusable.** Copy the reference teardown section of the old `AUDIT.md` into `design/reference-teardown.md`. Keep `/references/` (still in `.gitignore`), this brief, and any project-level config that is not about the site's design: deploy settings, environment variable names, analytics, and domain or redirect config.
5. **Clear the old site from this branch.** Before deleting anything, list in chat what will be removed and what will be kept, and wait for the owner's approval. Then remove the old app code on this branch: pages, components, styles, fonts setup and old design docs. Commit it as a single commit named `Clear v2 site for redesign` so it is easy to find and inspect later.
6. **From this point on, do not look at the old code**, including through `git log`, `git show` or the production branch. If something seems missing, check `content/content.json` and ask the owner.

**Gate 0:** the owner confirms the content file is complete and accurate, and the branch now contains only the content, references, brief and project config.

### Phase 1: Concept round (writing only, no visuals)

Write `design/concepts.md` with **five concepts**, at least one from outside §3's territories. Each concept includes:

- **The world**, in one sentence.
- **The signature moment:** what the visitor sees in the first five seconds.
- **The navigation model:** how the visitor moves between work, profile, lab and contact.
- **One signature interaction** unique to this concept.
- **Art direction:** type direction, palette direction, material and lighting, and the role of 3D.
- **The owner's references** it draws on (§3), and how.
- **How it shows the work:** what a project looks like inside this world.
- **The main risk:** what could make it fail.

Make them genuinely different from each other: different worlds, not five variations of one idea.

**Gate 1:** the owner picks one or two concepts, possibly combining parts.

### Phase 2: Key frames (the most important phase)

You are the designer here. The owner will choose and direct. Make key frames as **static, throwaway single-file HTML compositions**, one file per frame, in `design/keyframes/`. Use real fonts, real copy from `content.json`, and real or placeholder imagery. Render each frame to PNG with Playwright at 1440×900, and at 390×844 where mobile is listed.

For each chosen concept, produce:

1. The hero, desktop and mobile.
2. One signature transition as three frames: start, middle and end.
3. The work index.
4. One project detail page.
5. Contact, as the ending of the experience.

For every frame, produce **two or three variations that differ in composition and scale**, not only colour. Present them side by side in `design/keyframes/index.html`, with one line under each explaining the idea. Run the §5 checklist on every frame.

**Gate 2:** the owner picks and gives notes. **Expect several rounds.** Iterate only on what the owner comments on and keep the picked frames stable. Do not move on until the owner says the frames are approved.

### Phase 3: Motion storyboard

For each transition and interaction in the approved frames, write `design/motion.md` with: the trigger, the duration, the house easing, what moves and in what order, and the reduced-motion alternative. Where written description is not enough, build a rough standalone HTML prototype of that one motion.

**Gate 3:** the owner approves the motion character, including the loader and the signature moment.

### Phase 4: Asset production

- **3D:** models, materials, lighting and environment maps for the approved concept, rendered as stills for review before any integration.
- **Project covers:** art-directed imagery for each of the three main projects, in the concept's visual language (custom crops, composed scenes or 3D presentations of the product).
- **Type:** confirm licenses for every font, and record them for the colophon.
- **Sound**, if the concept uses it: a small opt-in set, under 500 KB total.

**Gate 4:** the owner approves the asset renders.

### Phase 5: Build

Build in this order:

1. **Project skeleton and résumé mode first.** The hiring function works before anything else exists.
2. Hero and the signature moment.
3. Navigation and transitions.
4. Work index, project pages, profile, lab, contact.
5. The loader, the sound toggle, and the 404 page, designed like everything else.

After each page, produce **side-by-side screenshots of the approved key frame and the build**, and list every difference. Fix the differences or explain why the build should differ.

**Gate 5:** one per page.

### Phase 6: Polish and submission readiness

- Test on real devices: a mid-range Android, an iPhone and a mid-range laptop. Report the frame rate for each.
- Check Chrome, Safari and Firefox.
- Reduced motion, keyboard navigation and the résumé mode skip link all work.
- Favicon, OG images, metadata and colophon with full credits and licenses.
- Produce Awwwards submission material: screenshots at their required sizes and a short description.

**Final gate.**

---

## 7. Technical notes

The stack from the upgrade still fits (Next.js, React Three Fiber with drei and postprocessing, GSAP with ScrollTrigger and SplitText, Lenis), but it serves the design, not the other way round. Choose libraries once the concept is approved.

- **Experience budgets:** 60 fps on a mid-range laptop and ≥ 45 fps on a mid-range phone, with automatic quality stepping (drei `PerformanceMonitor`). Initial load including the loader ≤ 2.5 s on a fast 4G profile. Heavy assets stream in behind the loader or after the first screen.
- **Résumé mode budgets:** as in §2. No 3D code in its bundle.
- **Accessibility:** reduced motion gets a designed static version, not a broken one. Every piece of information shown in 3D also exists in the DOM. Keyboard navigation works everywhere.
- **Skills:** use the installed design skill as the authority on visual decisions, with its variance and motion settings at the high end for this project. Use the GSAP and Three.js/R3F skills for implementation.
