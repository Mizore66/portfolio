# Decisions

Owner decisions for the v3 redesign, newest last.

## Gate 0 (2026-09-28)

- Production branch is `master`; work happens on `redesign-v3`.
- The chess engine and its science are kept (`src/lib/chess/`, `native/`, `training/`, `matches/`, `public/engine/`).
- Education values confirmed: graduated April 2026, WAM 81.8, CGPA 3.78.
- The résumé content in `content.json` is a placeholder until the owner supplies the real résumé.

## Gate 1 (2026-09-28)

**Direction:** a combination of concepts 1, 2, 4 and 5 from `concepts.md`.

- **Hero and contact: Advantage.** The screen is split black and white at the engine's evaluation (+0.64 after 10…Bg4), and the name inverts across the seam.
- **Roles: Simul, in a pale day hall on the white side.**
  - Six tables in career order, from Petronas to Deriv.
  - Each table plays its own well-known master game (see "Open" below).
- **Projects: sculpted pieces in a night gallery on the black side**, lit from the white side. Each project page stands its piece on the seam, lit so that it inverts like the name.
- **Lab: Search.** The kept engine's live search tree, with the seam at 30.5%, the learned net's match score (2–74–52).
- **Transitions:** the seam sweeps across and floods the screen white (to roles) or black (to projects).
- **Fidelity:** every page is built at least at the detail of the hero sketches.

**Conflicts with the design skill, resolved by the owner:**
1. A custom cursor is allowed on pointer devices only. The native cursor stays over text, and the custom cursor is off under reduced motion.
2. The live chess-clock times on contact are allowed.
3. Ranges use a hyphen on the site (`1-5 min`). True minus signs (`−143.3`) stay.

**Changed from the sketches:** the role page is no longer a seated view with a person across the table. It becomes a 3D chess set with the role's facts arranged around it; the layout is still to be decided.

**Role page (2026-09-28):**
- It combines layouts A and C.
- A's structure: the table's game replays as you scroll, and the role's facts arrive as sidebars beside the board.
- C's camera: a low, close angle on the set.

**Master games (2026-09-28):**
- The owner picked the top 7 of TheChessWorld's "15 Best Chess Games of All Time", stored in `content/chess-games.json`.
- The games are there for the visitor to enjoy while reading. **No move is tied to a role or a claim.**
- All 7 are verified in the kept engine. The source's printing of Nimzowitsch vs Alapin is illegal (it skips two moves) and was restored.

**Tables (2026-09-28, closes Gate 1):**
- Seven tables: the six roles plus the Monash degree.
- Games are assigned in the order they were played, oldest at the earliest table. The order has no meaning beyond chronology.

| Table (career order) | Game |
|---|---|
| Monash University, degree | Paulsen vs Morphy, New York 1857 |
| Petronas | Rotlewi vs Rubinstein, Łódź 1907 |
| Western Digital | Nimzowitsch vs Tarrasch, St Petersburg 1914 |
| Setel | Nimzowitsch vs Alapin, St Petersburg 1914 |
| Monash University, contract | Botvinnik vs Vidmar, Nottingham 1936 |
| Skribble Lab | Byrne vs Fischer, New York 1956 |
| Deriv | Tal vs Larsen, Bled 1965 |

**Gate 1 closed.**

## Phase 2, round 1 (2026-09-28)

**Picks:** the owner kept all eight designer's picks (`design/keyframes/picks.html`): hero A, transition B, work C, project A, roles B, role A, lab A, contact A.

**The Lab becomes a short technical story.**
- It explains how the engine was trained and ends with the visitor playing it on an overhead 3D board.
- Framing: one engine, two evaluators (handcrafted PeSTO and a learned net), the learned one trained twice.
- The play screen's default opponent is **Learned**.
- The first draft (`lab-long.html`) read like a work presentation. The owner chose **"the engine from the inside"** in full: one continuous scene, one pinned chapter per screen, each with one object, and the seam carrying meaning in every chapter. Frames: `lab2-1` to `lab2-7`, collected in `design/keyframes/lab-round2.html`.

| Chapter | Object | The seam |
|---|---|---|
| 01 Two evaluators | PeSTO knight table as porcelain terrain; the learned net as a basalt knight with a copper circuit | 50%, one judge on each side |
| 02 The data | A stack of sheets to scale, through 8 filter planes; the discarded 43% spilled; one sheet held out | 56.6%, the share kept |
| 03 Training | The same knight cast three times: clay, bisque, glaze (r 0.31, 0.50, 0.64) | none: the one all-white chapter |
| 04 Gate A | 50 boards, each showing its real opening from `openings-v1` | 50%, dead level |
| 05 Gate C | 128 results as stones in three heaps (2, 74, 52) | falls from 50% to 30.5% |
| 06 What failed | Plinths at the engine's piece values; the net on a copper plinth of ±60 cp | none: gallery black |
| 07 Play | The overhead board after 3…Bc5 with the f3 knight's moves | the learned net's eval, +0.43 (53.9%) |

**Still rough in the Lab frames (fix during round 2 or in the build):**
- ~~02: the spilled sheets are low contrast on the white side.~~ Fixed in round 2 (darker sheet edges).
- ~~05: the heaps read slightly like columns rather than piles.~~ Fixed in round 2 (wider settling).
- ~~All knights use the placeholder silhouette.~~ Fixed before closing Gate 2 (see below).
- The camera's dive between chapters is motion only (Phase 3), so no frame shows it.
- Trees in 00 are still seeded placeholders; the build draws the kept engine's real search.

## Phase 2, round 2 (2026-09-28)

Review page: `design/keyframes/round2.html`. The picks stay stable; only the §5 failures flagged in round 1 changed.
- **Pieces, everywhere:** lathe profiles are rounded at gentle corners (crisp steps kept), so heads no longer read as faceted. The bishop's mitre is a groove on the surface. Crack and copper inlays follow the new surface.
- **proj-a:** the key light is higher, so the shadow is shorter and lighter and no longer runs under the subtitle.
- **roles-b:** 19 words (was about 50). Names only in career order, "now" on Deriv; dates move to hover and the role pages.

**Owner decisions (2026-09-28):**
- The Lab chapters may run past the 20-word rule, about 40 to 70 words each, because they carry the technical story.
- The Lab gets phone compositions: `lab-a-m` and `lab2-1-m` to `lab2-7-m`. On phones the seam turns horizontal, white on top, at the same share as on desktop, as the hero does. Chapter 02 puts the seam exactly on the top of the kept stack; 03 recedes the casts so the playing net is largest; 06 uses a long lens so the plinths stay true to scale.

## Gate 2 (2026-09-28)

**The owner approved the key frames.** Before closing, the knight was modelled properly: the Staunton silhouette inflated into a rounded volume (thinner at the muzzle and ears, fuller at the neck) with a braided mane, eyes and a mouth line. The learned knight's circuit follows the curved surface. Every frame was re-rendered with it. `design/keyframes/final.html` shows before and after for the knight and for the two Lab fixes from round 2.

Approved set: the eight picks in `picks.html` (with the round 2 fixes in `round2.html`) and the Lab chapters with their phone frames in `lab-round2.html`.

**Gate 2 closed.** Next is Phase 3, which starts only on the owner's go-ahead.

## Phase 3 (2026-09-28)

`design/motion.md` storyboards every transition and interaction. Six prototypes are in `design/motion/`, reviewed on `design/motion/index.html` with video, film strips, the live page and its reduced-motion version: the loader and signature moment, drag the seam, hero to Work, the role-page replay, Lab Gate C, and contact.

The hero's swing uses the kept engine's evaluation after each ply of the line at 6,000 nodes (handcrafted), recomputed for Phase 3. It matches the stored career evals exactly, ending at +0.64. The real range is 48.3% to 55.9%, so the swing is a tremble before the lean.

**Owner notes, round 1 (2026-09-28):**
- Role page: pieces must visibly move for every move, not jump. Fixed: each move's tween recorded its start from the move before, so pieces jumped; each now lifts, travels and sets down in 380 ms.
- Gate C: the seam following the score after every game felt jittery. It now glides between checkpoints, the real running score after every 16th game.
- Mobile: every prototype now has its phone composition, and all of them pass an automatic text-clash check every half second at both sizes (the hero every 0.1 s). The check found and fixed a skip link overlapping the hero sentence, and a stagger bug where the inverted copy of each letter moved late.

**Owner direction, the signature moment (2026-09-28):** the round 1 loader was less exciting than the other pages. The new opening is a high-resolution 3D board: the game plays and tightens, the board explodes, the pieces float as the hero's background (after a Thorgal reference the owner supplied) and the name arrives. All other pages stay as they are. To keep them unchanged, the new hero ends exactly on hero-a: the paper sweeps in to 55.9% and the name crosses the seam over the floating field. Prototype: `design/motion/hero-3d.html`.

**Gate 3 approved (2026-09-28).** The owner approved the motion character, including the new loader and signature moment (the exploding board) and every other prototype. Sound is decided in Phase 4. Phase 4 (asset production) starts only on the owner's go-ahead.

## Phase 4 (2026-09-28)

Review page: `design/assets/index.html`. Everything is procedural and made for this site; credits and licences are in `design/colophon.md`.
- **3D:**
  - The set: new rook merlons, queen coronet, king cross, knight collar and felt pads.
  - Materials: satin anodised aluminium; pitted basalt; a finer FaultLine crack.
  - Three art-directed environment maps: studio, gallery and hall (`design/assets/env.js`).
  - The hero board's key light is moved toward the camera, with a fill added, so ivory keeps its shape. The opening's videos are re-captured.
- **Covers:** each product's own screenshot made physical beside its sculpture (a proof sheet, a phone, a PCB plate).
- **Type:** Archivo 2.001 and JetBrains Mono 2.211, both SIL OFL 1.1, checked in each font's name table. The official licence texts are in `design/assets/licenses/`.
- **Sound:** four synthesized cues (place, break, seam, tick), 51 KB in total, wired behind every prototype's opt-in toggle.

**Gate 4 approved (2026-09-28).** The owner approved the asset renders. **Sound ships:** off by default, opt-in via the visible toggle, using the four cues (51 KB). Phase 5 (build) starts only on the owner's go-ahead.

## Phase 5 (2026-09-28)

- **Step 1, skeleton and résumé mode:** approved.
- **Step 2, hero and signature moment:** approved (Gate 5, `design/build/hero.html`). The hero matches its prototype to 0.07% before the blast; the rest is font rasterisation. Added from the brief: quality stepping, a slow-device skip, and an idle loop that stops on slow frames.
- **Step 3, navigation and transitions:** approved (Gate 5, `design/build/nav.html`). Every page change is the seam sweeping away a view-transition snapshot of the leaving page. Pairs the storyboard does not name use the hero-to-Work numbers scaled by distance. The owner approved without answering the page's three questions, so all three stay as built until they say otherwise: hero to Contact lifts the old page away; what is left when the seam lands short of an edge rises out of its own region; the hero's stage is rebuilt on return (no persistent stage).
- **Step 4 is reviewed page by page** (brief: one Gate 5 per page). **4a, the Work room and the project pages:** built; review page `design/build/work.html`. Each project page rests at its own move's eval (FaultLine 55.9%, Gemini Teleportal 48.3%, CircuitMindAI 54.5%), per motion.md §7. Five open questions on the review page: the leftover rise on Work to a project, the seven non-featured projects, product screenshots in the case studies, two draft annotations and an ellipsis in content, and the gallery's environment light.

**Step 4a, owner's answers (2026-09-28, given on the phone review page https://claude.ai/artifact/Mju7De8mbPaaDGAFayoKue):**
- **Gate: approved**, with the answers below still to be applied.
1. Work to a project: **cut** the leftover on landing for this pair (the piece does not move; only the plinth and light change). The step-3 rise stays everywhere else.
2. The seven other projects: **make them new pieces on a different board**, not the main showcase ("I'd rather you make them new pieces but on a different board as they're not the main showcasing project"). This is a new composition with no key frame: design it and show it to the owner before building it.
3. Product screenshots: **add them as captioned evidence** near the end of each case study (the captions in content.json).
4. (a) The FaultLine and Teleportal move annotations (agent drafts in voice.md): **drop them.** CircuitMindAI's annotation is the owner's own words; whether it stays alone is to be asked. (b) CircuitMindAI's decision text: replace the mid-sentence "…" with a **semicolon**.
5. The gallery's light: **keep work-c's** neutral environment.

**Step 4a, answers 1, 3 and 4 built (2026-09-29, `4f36f7f`), and three comps for the second board** (`design/build/board2.html`, `design/keyframes/side-{a,b,c}.html`).

**Step 4a, owner's picks for the second board (2026-09-29, given in the review doc https://claude.ai/code/artifact/fccb2c12-1139-4074-8fd9-999dc93ef9df):**
1. **Comp A**, one walnut board.
2. It lives **below the featured three on /work** (`/work#archive`).
3. Title: **"Other Projects"** (`pageCopy.work.othersTitle`).
4. Each of the seven **opens its own page**: "content is small for now but we can fill it up as time passes".
5. CircuitMindAI's annotation: **drop it too.** No project page has an annotation now.
6. "The product": **keep.**
7. MirrorFi: **black glass** instead of the mirror chrome.
8. RexCheck as a king with no move yet: **yes, for now.**

**Step 4a, Other Projects: Gate 5 approved (2026-09-29, `9fecce7`, review `design/build/others.md`).** Yes to all six calls: RexCheck's page rests level (50%); GraphRAG's piece stops at 60% on phones; the glass bishop and the king are scaled down on their pages; MirrorFi's black glass and RexCheck's obsidian both stay; the new copy ("No move yet", "another game", "Other projects") stays. Covers and screenshots for the seven: **not expected now**. The owner will supply them as a new feature after the redesign. Step 4a is closed; step 4b (Roles) starts.
- **4b, the Roles hall and the role pages:** built; review `design/build/roles.md`. The hall and every role page rest at 98.5%, a 22 px ink edge (roles-b and role-a), where step 3 flooded to 100%. Sitting down cuts into the role page, as Work into a project does. Each claim is shown beside the bullet it came from.
