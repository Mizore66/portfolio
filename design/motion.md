# Phase 3: Motion storyboard

Every transition and interaction in the approved key frames. Each entry gives the trigger, the duration, the easing, what moves in what order, and the reduced-motion version. Five motions have rough prototypes in `design/motion/`, reviewed in `design/motion/index.html` (video, film strips and the live page).

## The character

**Weight and honesty.** Things move like heavy objects handled with care: they start slowly, travel quickly and set down softly. Nothing bounces or overshoots, because an evaluation bar never passes its value. The seam is the only thing that ever sweeps the whole screen, and every change of page is the seam moving.

### House easing

| Name | Curve | Used for |
|---|---|---|
| `seam` | `cubic-bezier(.7, 0, .13, 1)` | anything that travels: the seam, the camera, a piece crossing the board |
| `arrive` | `cubic-bezier(.16, .84, .3, 1)` | anything arriving: type rising, lights coming up, a fact sliding in |
| `evalStep` | critically damped spring, `1 − (1 + 7t)e^(−7t)`, normalised | the seam stepping to a new evaluation: fast, then settles, never past the value |
| `none` | linear | only for time itself: clocks, and progress that is driven by scroll |

### Durations

- **150 ms:** small feedback (a nav underline, a cursor press).
- **300 ms:** one piece moving one move; a fact leaving.
- **600 ms:** type rising in its mask; a fact arriving.
- **1,100 ms:** a seam sweep across the screen.
- **1,800 ms:** a camera settling into a new room.

Stagger between letters is 28 ms; between lines, 60 to 80 ms; between list items, 50 ms.

### What never happens

(One exception, approved with the new hero: the floating pieces bob while the hero is on screen.)

- No page fades out and back in. Every page change is the seam sweeping, so both states are on screen together.
- No scroll-jacking. Chapters pin while their scene plays, but the scroll never stops answering the trackpad. Lenis smooths wheel input at `lerp .1`; touch scroll is native.
- No looping idle animation except the contact caret and the running clock, both of which mean something.
- No motion carries information that is not also in the DOM.

## Global

### Type entrances
- Staggers count within each seam layer, so a letter and its inverted copy always move together.
- Display type rises out of its own line mask (`yPercent 105 → 0`, 600 to 750 ms, `arrive`), letter by letter at 28 ms for names and titles, line by line for sentences.
- It leaves the same way, upward (`yPercent 0 → −135`, 500 ms, `seam`). The −135 clears descenders such as the y in Qumhiyeh.
- Because the seam clones the page into an inverted layer, every entrance plays on both layers at once and inverts correctly across the seam.

### Navigation
- **Trigger:** click or Enter on a nav item.
- **What happens:** the underline moves at once (150 ms). The URL changes at the start of the sweep, not at the end, so Back works mid-transition.
- **Back and Forward:** play the same sweep in reverse.

### Résumé link
Always in the top-right corner, from the loader's first frame. It is never animated, never covered and never moved.

### Cursor (pointer devices only)
- An 8 px amber dot, the legal-move dot from an analysis board. It sits exactly on the pointer with no easing.
- Over anything clickable it becomes a 24 px ring, the capture ring (150 ms).
- Over body text and inline links the native cursor returns.
- Off under reduced motion and on touch.

### Sound (opt-in, off by default)
- **Cues:** a felt swish under a seam sweep; a wooden set-down for each move in a replay or a game; one clock tick per second on contact, at low volume.
- **Budget:** under 500 KB for all of them. Sounds are produced in Phase 4.
- **The toggle:** "Sound off" in the bottom-right corner; it becomes "Sound on".

### Performance
- 3D pages render only while visible and only while something is changing. A still scene is rendered once, not 60 times a second.
- drei `PerformanceMonitor` steps down shadow map size, then pixel ratio, then the number of lit spots.

---

## 1. Loader and signature moment: the board explodes *(prototype: `hero-3d.html`, owner's direction)*

**Trigger:** first visit to any page. Later visits within the session open at the end state.

| Time | What happens |
|---|---|
| 0 to 700 ms | Darkness (gallery black). "Résumé" top right, "Skip to résumé" bottom left. A spot finds a lit board: rounded maple and walnut tiles with a grain, a walnut frame, the Staunton set. Seen high and wide. **This is the loader.** |
| 750 to 2,940 ms | **The game.** The real line plays, 20 plies, starting at 210 ms a move and getting 7% faster each move. The camera pushes in low toward g4 (`seam`) and the spot narrows. The two checks (8…Bb4+ and 9…Bxd2+) jolt the camera. Each move lifts and sets down; captured pieces are set beside the board. The ply is named in mono at the foot of the screen. |
| 2,940 ms | 10…Bg4 lands. g4 flashes amber, the colour of the move being played. |
| 3,330 ms | **The board detonates from g4.** A shockwave runs outward (28 ms per unit of distance): tiles, the eight frame parts, the pieces and the captured pieces are thrown up with spin, and the camera kicks back. |
| 3.3 to 5.2 s | Everything slows into a hover (exponential ease-out, no overshoot) and the camera settles back on the floating field. The field is composed like the reference: big pieces cropped at the edges, middle pieces around the name, small pieces far off and faded by distance. |
| 4,180 to 5,080 ms | The paper sweeps in from the left to 55.9% (`seam`). The white side shows the field lit by day; the black side shows it lit by night. |
| 4,580 ms onward | "Anas Qumhiyeh" rises letter by letter, then the sentence, the eval label and the nav. The hero now matches hero-a exactly, so every transition out of it is unchanged. |
| Idle | Each object bobs slowly (5 to 17 cm, periods of 14 to 30 s). This is the one idle motion on the site besides the caret and the clock. It pauses when the tab is hidden. |

**Composition rules:**
- No near or middle object may sit behind the name.
- Nothing, at any depth, may sit behind small text: the nav, résumé, sentence, eval label or sound toggle.
- Objects far enough away may pass behind the name, but fog fades them toward the background colour, so the name stays readable.

**Loader limits:**
- The first 700 ms is the loader. If the scene or fonts are not ready by then, the board holds in the spot.
- The page proceeds by 2,500 ms regardless, with the fallback font if needed.
- The skip link is live throughout.
- The scene is procedural (lathe pieces, rounded boxes, drawn grain), so it downloads almost nothing beyond three.js.

**Reduced motion:** the final floating composition as a still: no game, no blast, no bob.

**Mobile:** the camera starts higher and pulls back further. The paper comes down from the top to 55.9%, as in hero-a-m. The keep-clear zones follow the phone layout.

**Performance:** about 100 objects, drawn twice (day and night) only while something is moving; the idle bob drops to 30 fps. drei `PerformanceMonitor` halves shadow maps first.

## 1a. Round 1 loader *(prototype: `hero.html`, replaced by 1)*

**Trigger:** first visit to any page. On later visits within the session, the page opens directly at its end state.

| Time | What happens |
|---|---|
| 0 ms | Paper. "Résumé" top right, "Skip to résumé" bottom left. Nothing else. |
| 0 to 450 ms | A 1 px ink hairline draws down the middle of the screen (`arrive`). This is the seam before the game. |
| 380 to 1,000 ms | Black floods in from the right edge and stops at the hairline, 50%: the start position (`seam`). |
| 500 to 1,300 ms | "Anas Qumhiyeh" rises letter by letter (28 ms stagger). Letters on the right rise white; letters crossing the seam split. |
| 1,250 to 3,750 ms | **The game.** The seam steps through the engine's evaluation after each of the 20 plies (`evalStep`, 105 ms each, 500 ms for the last). A mono label at the seam's foot names the ply and its eval: `7. Bb5 −0.08`. It settles at `10…Bg4 +0.64`, 55.9%. |
| 3,650 to 4,300 ms | *I like systems that have to survive measurement.* rises line by line. |
| 3,900 to 4,300 ms | The nav and "Sound off" arrive; "Skip to résumé" leaves. |

**The loader is the first second.** While the hairline draws and the black floods in, fonts and the next page's assets load. If they are not ready by 1,000 ms, the hairline holds, still, until they are. After 2,500 ms the page proceeds with the fallback font rather than wait longer. The skip link is live throughout.

**The swing is honest and small.** The real evaluations run from 48.3% to 55.9%, so the seam trembles around the centre and then leans. The scale comes from the flood and the name; the tremble is the detail a chess player notices. These are the kept engine's evaluations at 6,000 nodes, recomputed for Phase 3, and they match `content.json` exactly.

**Reduced motion:** the page opens at its end state (seam at 55.9%, everything in place), with no hairline, flood or swing.

## 2. Drag the seam *(prototype: `hero.html?demo=drag`)*

**Trigger:** press on the seam (a 24 px hit area either side of it) on the hero.

**What happens:**
1. **Press.** The amber dot appears on the seam and the seam starts to lean toward it: 30% of the way from its true position to the pointer (300 ms, `arrive`).
2. **Pull.** Every 56 px of pull is one career move: left goes back in time, right goes forward.
3. **Each step.** The seam steps to that move's stored evaluation (340 ms, `evalStep`) and the card on the seam changes: the name, `game eval after 5…d6: +2.32`, and the kind and dates.
4. **Release.** The seam springs back to the true evaluation of the move you stopped on (450 ms, `evalStep`). It is never left pointing at the cursor. Enter, or a tap on the card, opens that move's page.

**Keyboard:** focus the seam, then ← and → step one move and Enter opens it.

**Mobile:** the seam is horizontal and the pull is vertical: up is back, down is forward.

**Reduced motion:** the same steps, but the seam jumps instead of springing and does not lean toward the pointer.

**Honesty:** the card always says "game eval". The eval figure is never the biggest thing on the card, so it cannot read as a rating of the job.

## 3. Hero to Work: the tilted sweep *(prototype: `to-work.html`)*

**Trigger:** Work in the nav, or ↓ from the hero's last scroll position.

| Time | What happens |
|---|---|
| 0 to 150 ms | The nav underline moves to Work. |
| 0 to 1,150 ms | The seam sweeps left from 55.9% to the 22 px paper edge (`seam`). It leans up to −13° at mid-sweep and is upright again as it lands (tilt is `−13 · sin(πp)`). Behind the black is the gallery, lights off: the black side was always a window onto it. |
| 400 to 1,500 ms | The room lights come up (`arrive`); FaultLine's spot comes up first, 200 ms ahead of the rest. |
| 0 to 1,800 ms | The camera settles from 4.8 units higher and further out into the work-c framing (`arrive`). |
| 700 to 1,350 ms | The name and sentence, now white over the gallery, leave upward. |
| 1,100 ms onward | "Work" rises; then the three labels arrive at 80 ms stagger. |

**Work to hero:** the same, reversed. The lights go down as the paper sweeps back.

**Reduced motion:** a cut to the lit gallery with the seam already at the edge.

## 4. Hero to Roles

**Trigger:** Roles in the nav.

**What happens:**
1. The seam sweeps right to the far edge, so paper floods the screen, leaning +13° at mid-sweep (1,150 ms, `seam`).
2. This time the white side is the window: the day hall sits beneath it, as the gallery sits beneath the black. As the seam sweeps right, the window widens until the hall fills the screen.
3. The camera settles along the row from 3 units higher (1,800 ms, `arrive`), ending on the Deriv table in front.
4. "Roles" rises, then the names arrive at 50 ms stagger.

**Reduced motion:** a cut to the hall.

## 5. Any page to the Lab

**Trigger:** Lab in the nav.

**What happens:**
1. The seam sweeps to 30.5%, the match score (1,100 ms, `seam`). The dark side is search ink (`#0b0e14`), not gallery black.
2. The search tree grows from its root on the seam, one depth at a time: 60 ms per depth, drawing each line with `stroke-dashoffset`.
3. The principal variation lights amber last (300 ms).
4. "−143.3" rises, then "±35.4 Elo", then the record.

**Reduced motion:** the tree is drawn complete.

## 6. Contact, the ending *(prototype: `contact.html`)*

**Trigger:** Contact in the nav, or reaching the end of any page.

| Time | What happens |
|---|---|
| 0 to 1,000 ms | The seam travels to 55.9%, the position after 10…Bg4, leaning up to +7° and straightening as it lands (`seam`, then `arrive`). This is Illoca's angled arrival, done by the seam instead of paper. |
| 550 to 1,300 ms | "11." rises. |
| 950 to 1,600 ms | "Your move.", the address and the reply line rise; the links arrive at 50 ms stagger. |
| 1,100 to 1,900 ms | The chess clock slides up and straightens from 5° as it lands (`arrive`). |
| 1,300 ms onward | The caret blinks at 1 Hz, a hard on and off. Your face of the clock runs, with its flag lit; Anas's face is stopped, because Black has just moved. |

**Hover on the address:** the underline draws left to right (350 ms, `arrive`), like a move being written.

**Reduced motion:** everything is in place, the caret is steady and the clock updates each minute.

## 7. Work index (the floor plan)

- **Hover a piece** (or focus its label): its spot rises to full and the others fall to 42% (400 ms, `arrive`). Its label brightens and its one number appears.
- **Move between pieces:** the light passes from one to the other with no dark gap. The outgoing spot starts falling as the incoming one starts rising.
- **Click a piece to open its project page:**
  1. The camera descends from the plan view to the piece's height and turns to face it (1,400 ms, `seam`). The other lights go out.
  2. Paper sweeps in from the left edge to the project's evaluation (55.9% for FaultLine, 900 ms, `seam`, starting at 900 ms). The piece is now standing on the seam, as in proj-a, and inverts like the name.
  3. The name rises across the seam.
- **Reduced motion:** hover changes the light instantly; opening a project is a cut.

## 8. Project page

- **Arrival:** as in 7.
- **Scroll:** the piece turns 20° over the first screen of scroll (scrubbed, linear), so its material is seen from more than one side.
  - Then the case study rises as a single column. The seam narrows to a hairline at the left edge and stays there as a reading guide, and its position still marks the evaluation.
- **Pointer (fine pointers only):** the key light follows the pointer within ±15°, eased at `lerp .08`. The shadow rakes across the floor; the crack or inlay catches the light.
- **Reduced motion:** the piece stays still, the light is fixed and the column is in place.

## 9. Roles index (along the row)

- **Hover a name:** that table's lamp brightens and the camera eases toward it by up to 1.5 units along the row (700 ms, `arrive`). Every board keeps its position still.
- **Click a name, "sit down":** the camera drops from standing height to the low corner of that table (1,400 ms, `seam`). The other tables fall out of focus, and the role page's title and first fact arrive as the camera lands.
- **Mobile:** the row becomes a vertical list over the hall; tapping sits down.
- **Reduced motion:** hover highlights the name only; opening is a cut.

## 10. Role page: the replay *(prototype: `role.html`)*

- **Trigger:** scroll. The page is pinned. Scrolling moves through the game from the first move to the table's famous position (16. Nd5 for Tal vs Larsen, 31 plies), over about 4 screens of scroll.
- **Each move:** plays at hand speed when its scroll threshold is crossed, not scrubbed. Scrubbing a piece across the board looks like dragging; a hand plays each move whole.
  - The piece lifts, travels and sets down in 380 ms (`seam` for travel, a sine arc of 0.55 units for the lift). It never jumps to its square.
  - A captured piece lifts off and is taken away (rises 1.6 units and shrinks to nothing).
  - For castling, the rook follows the king 120 ms later.
  - The squares of the last move stay lit amber.
  - Scrolling fast plays queued moves at double speed. Scrolling back replays them in reverse.
- **Facts:** the role's facts arrive one at a time as margin annotations, always in the left margin (Illoca, in a chess book's single outer margin).
  - Each slides in 28 px (550 ms, `arrive`), and its rule draws across.
  - The previous fact leaves 18 px to the right and fades (280 ms) before the next arrives. They never overlap.
  - A counter (`2 / 4`) shows where you are.
- **The camera** turns 9° around the board and lowers 0.5 units over the whole scroll, so the board is never seen twice from the same place.
- **The scrubber** below marks the current move. Clicking a tick jumps there; the moves between replay at 4× speed.
- **After the famous position:** the rest of the game plays to its end over the last screen, then the page continues to the next role.
- **Reduced motion:** the famous position is shown still, all facts are listed, and the scrubber steps the board without animation.

## 11. The Lab chapters

- **Structure:** each chapter is pinned for about 1.5 screens of scroll. Its object builds as you scroll in (scrubbed), holds, and the next chapter's seam position takes over.
- **Between chapters:** the seam moves to the next chapter's share (1,100 ms, `seam`). In the full build, one continuous camera dives from the board into the evaluator and back out; each chapter is a stop on that path.

| Chapter | What moves (scrubbed by scroll) | Seam |
|---|---|---|
| 01 Two evaluators | The 64 terrain columns rise from the floor to their values, rank by rank, from a1 (`arrive` per column, 12 ms stagger). The knight lands on f6 last. On the dark side, the copper circuit on the learned knight lights from its base upward. | 50% |
| 02 The data | 35.4 M sheets stand at full height. Each filter plane slides in, and the sheets above it fall off to the white side, one filter at a time. The stack settles at 20 M, and one sheet slides out as the hold-out. | falls to 56.6% as the stack falls |
| 03 Training | The three casts turn together. The camera moves along them from clay to glaze, and each score rises as its cast is reached. | none: all white |
| 04 Gate A | The 50 boards set up one after another, pieces dropping onto the squares of each opening, then all 100 games play at once, fast. The seam stays dead still at 50%. | 50% |
| 05 Gate C | *(prototype: `gatec.html`)* 128 stones drop into three heaps in game order, each falling in 420 ms. The seam glides between checkpoints, the running score after every 16th game, each glide spanning the games between them (`seam`). "Then the match." leaves, and "−143.3" rises. | 50% to 30.5% |
| 06 What failed | The plinths rise to scale, queen first. The net's copper plinth rises last, and the clamp brackets close on it: ±60. | none: gallery black |
| 07 Play | The camera lands overhead on the board. The seam arrives through the board at the net's eval. | the eval, +0.43 |

**Gate C, the real data, without the jitter:** following the score after every game made the seam jump around in the first games. It now moves only between checkpoints, the true running score after games 16, 32, 48 and so on: 50% → 28.1% → 29.7% → 31.2% → 28.9% → 30.0% → 30.2% → 29.9% → 30.5%. Every stop is a real value; only the path between them is eased. The counter says which checkpoint the seam is heading to (`after 64: 28.9%`).

**Reduced motion:** each chapter shows its end state as a still, as in the key frames.

## 12. Play

- **Your move:**
  1. Pressing a piece lifts it 0.35 units (150 ms, `arrive`), and its legal moves appear as dots (100 ms).
  2. Dragging moves it freely above the board.
  3. Dropping on a legal square sets it down (200 ms).
  4. An illegal drop returns it to its square (250 ms, `seam`).
  5. Click-click works too.
- **The engine's move:** it thinks in a worker. After thinking, it plays at hand speed, as in the replay (280 ms).
- **The seam:** after every move it steps to the learned net's new evaluation (`evalStep`, 340 ms), so the eval bar is the board.
- **Opponent and side:** switching them resets the board by sliding the pieces home (600 ms, `seam`, 10 ms stagger).
- **Reduced motion:** moves are instant and the seam jumps.

## 13. Mobile

Every prototype has its phone composition at 390 × 844, and every frame at both sizes passes an automatic text-clash check (`design/motion/_clash.cjs`: overlapping text, text off-screen, type still hidden in its mask excluded).


- **The seam is horizontal:** white on top, black below. Every sweep runs vertically: to Work the black rises from the bottom, and to Roles the paper falls from the top.
- **Tilt:** 8° instead of 13°, because the screen is narrow.
- **No pointer effects:** the cursor, the pointer light and hover do not exist on touch. What hover shows is shown by default, or on tap.
- **Pinned chapters:** pin for 1 screen instead of 1.5.
- **Hero:** the hairline draws across, the black rises from the bottom to 50%. The drag card sits at the bottom, in place of the sentence, because a card riding a horizontal seam would cross the name.
- **Work:** the camera looks along the floor from the g-file side, so the three pieces stack down the screen and each label has its own row. "Work" moves to the top.
- **Role page:** title, then the fact, then the board in the lower half, clear of the scrubber. The board bleeds at the edges, as on desktop.
- **Gate C:** the heaps sit in a triangle. The note is shortened so it stays above the seam's whole range (28% to 50%), so the seam never cuts a line of small text.
- **Contact:** "11." and "Your move." on the white side; the clock and the links on the black side.

## Reduced motion, summary

Every motion above has a still or a cut, and nothing breaks: the site becomes its key frames. The prototypes show this with `?reduced`, for example `hero.html?reduced`.

## Gate 3 decisions (2026-09-28)

1. **The hero:** replaced by the exploding board (section 1). The round 1 swing question no longer applies.
2. **Role pages:** every move is animated, played whole at hand speed when its scroll point is crossed.
3. **Sound:** decided in Phase 4, once the cues exist to be heard. There is still no sound in the prototypes.

**Gate 3 approved.**
