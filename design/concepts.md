# Phase 1: Concepts

Five worlds for anasqumhiyeh.dev v3. Writing only; no visuals until Gate 1.

**Design read:** an award-level developer portfolio for design juries first and recruiters second (résumé mode carries hiring), with an experimental language where chess is art direction, not UI. Skill dials: `DESIGN_VARIANCE 9`, `MOTION_INTENSITY 8`, `VISUAL_DENSITY 2`.

**What every concept shares, so it is not repeated below:**
- A résumé link sits in the same corner on every screen, including the first frame of the loader. It goes to `/resume`: plain, no WebGL.
- Email, LinkedIn and GitHub are one click away on every page, and the contact page is the ending.
- 20 words or fewer per screen outside project pages. Each project enters with one line and one number, with its qualifier.
- Sound is opt-in with a visible toggle, off by default. Reduced motion gets a designed still version.
- The raw material is `content/content.json`: the real line (Italian Game, C54, to 10…Bg4), the engine's stored evaluations, the 28 qualified claims, and the kept chess engine.

**How the brief's territories were used.** I took three and replaced two:
- **The Study, Blindfold and The Engine's Mind** are developed below, each pushed to one specific idea.
- **The Annotated Book** is left out on purpose. v1 was literally a newspaper, and v2 was an annotated scoresheet with notation, figurines and a games book. A book of annotated games is the old site's DNA; §0 of the brief is about leaving that behind.
- **Over the Board** gives its materials (the hall at night, wood, lamps) to concept 5, which is a different world.

**Two concepts come from outside the list:** 1 (Advantage) and 5 (Simul).

---

## 1. Advantage *(outside the territories)*

**The world.** Every screen is an evaluation bar: the page is split into white and black at the point where the engine judges the position at that moment of the career.

**The signature moment (first 5 seconds).**
1. Frame one: the screen is exactly half white, half black, as an eval bar is before a move is played. One hairline seam runs down the middle.
2. `Anas Qumhiyeh` is set across the seam at a scale that runs off both edges. Each letter inverts as it crosses: black on the white side, white on the black side.
3. Over about 2 seconds the seam swings through the real game, stopping briefly at each stored evaluation. It settles at +0.64: the position after 10…Bg4, the latest move, a small visible lean towards White.
4. One line appears: *I like systems that have to survive measurement.*
5. That is the whole hero: two colours, one seam, one name, one sentence.

**The navigation model.** The seam is the map. The data already assigns sides: White's moves are the career, Black's moves are projects.
- **Work** lives on the black side. Choosing it sweeps the seam across the screen until black fills it, and the work index is already underneath. The wipe *is* the transition, so both states stay connected.
- **Profile** lives on the white side, and the seam sweeps the other way.
- **Lab** is the only screen where the seam falls deep to black: 30.5% white. That is the literal score of the learned net's match (2 wins, 74 draws, 52 losses in 128 games), labelled as a match score, not an evaluation. *I published the loss* sits in the black.
- **Contact** returns the seam to +0.64 with White to move. The move number reads `11.` followed by an empty space for the visitor.

**The signature interaction: drag the seam.** Grabbing the seam and dragging it left or right scrubs through the career in order.
- It snaps to the stored evaluation of each career move. That move's label, the employer or project, and one number appear on the seam.
- Letting go on a move opens its page.
- Keyboard: ← and → step through the moves; Enter opens one.

**Art direction.**
- **Type.** One very heavy grotesk at colossal scale, whose letterforms are designed to invert cleanly across the seam, plus one monospace for figures and notation. No serif. Typography is the image.
- **Palette.** A neutral off-white and off-black, and nothing else. No accent: the brand *is* the eval bar's convention. This also keeps faith with the v2 rule that eval bars stay pure black and white.
- **Material and lighting.** Flat and printed. No light sources, no texture.
- **Role of 3D.** Nearly none; the site is WebGL-optional. One idea to test at key frames: on a project page, that project's piece stands exactly on the seam, lit from the white side and in shadow on the black side.

**References used.**
- **PX PUSH title screen:** one confident, personal idea with nothing corporate around it.
- **PX PUSH scroll transitions and separate pages:** the seam wipe between Work, Profile and Lab, each a page of its own.
- **Illoca's angled final frames:** at the contact ending the seam tilts a few degrees off vertical and settles, the way Illoca's folders straighten as they arrive.
- **Revelatio's contact page:** the visitor's local time is set on the white side and Anas's Malaysian time on the black side, like the two faces of a chess clock.

**How it shows the work.**
- **Work index:** a black field with the projects stacked as enormous white names. The seam passes behind each name at the evaluation of the move that project played.
- **Project page:** the page opens split at that project's evaluation. The white side holds the name, one line and the one number with its qualifier. The black side holds the art-directed cover. The case study follows below as a single column; the seam narrows to a hairline and stays at the edge as a reading guide.

**Mobile, its own composition.** The seam turns horizontal: white above, black below, as a phone-sized eval bar. The name runs down the screen rather than across it, and the drag becomes a vertical thumb gesture.

**The main risk.** It is a graphic system, and it could tire after three screens if every page repeats the same split.
- **Honesty risk:** an evaluation of a chess position must never read as a rating of a job. The copy has to say it is the game's evaluation, and the eval figure should never lead a screen.
- It also leaves the brief's permission for heavy 3D mostly unused, by choice.

---

## 2. The Night Collection *(The Study)*

**The world.** A museum after closing, holding the pieces that played this game. Each chapter of the career is one sculpted piece, lit like an object behind glass.

**The signature moment (first 5 seconds).**
1. Full darkness, with a faint hum if sound is on.
2. A single warm cone of light fades up on one piece, filling most of the screen and turning very slowly: Black's light-squared bishop, the piece that played 10…Bg4. In the career that move is FaultLine.
3. A museum label fades in beside it, small and precise: `Anas Qumhiyeh`, `Software engineer`, *I like systems that have to survive measurement.*
4. The camera drifts a few degrees, and the shadow crosses the plinth.

**The navigation model: a floor plan of four rooms.**
- **Work:** the gallery of Black's pieces, one per project, each on its own plinth.
- **Profile:** the hall of White's pieces, the career in order.
- **Lab:** the conservation studio, where the one piece that failed (the learned net) lies taken apart on a bench with its measurements.
- **Contact:** an empty plinth under a lit label: `11.`, the piece not yet placed.

Moving between rooms is a camera dolly through a dark doorway, so the transition is a walk rather than a cut. The nav is a small floor plan in one corner.

**The signature interaction: the light is your cursor.** On pointer devices, the key light follows the pointer like a curator's torch, raking across the surface and throwing long shadows. Dragging turns the piece. Engraved on its base:
- the move, for example `10…Bg4`
- the one number, for example *First PASS→FAIL commit in 1–5 min*
- its qualifier, *Controlled evaluation*

**Art direction.**
- **Type.** A precise museum-label grotesk at small sizes, and a condensed display grotesk for the room titles, set as tall as the plinths. No serif.
- **Palette.** Gallery black. Pools of a single warm key light (about 3200 K) with a cold, dim fill. Colour comes only from the materials.
- **Material.** No Staunton pieces. Each piece is drawn for its project and made from a material that argues for it:
  - FaultLine: porcelain with one hairline crack, fired shut.
  - Teleportal: machined, anodised aluminium.
  - CircuitMindAI: basalt with a copper trace inlaid through it.
  - The Deriv knight: cast iron.
- **Role of 3D.** Central and heavy. High-fidelity sculpted pieces, with physically based materials, real soft shadows from one area light, and no environment clutter.

**References used.**
- **Illoca's immersive opening:** entering a place, not landing on a page.
- **PX PUSH 3D assets:** one object beside the text, turning with scroll.
- **Revelatio's cursor:** reborn as the light source.
- **PX PUSH separate pages:** the four rooms.
- **Illoca's sidebars:** the case-study text slides in beside the plinth as the camera circles it.

**How it shows the work.** A project page is its room. The piece and label hold the first screen. Scrolling orbits the camera around the plinth, and each quarter turn brings in one part of the case study (problem, decision, what was built, limits) as a wall text. The art-directed cover is hung on the back wall of the room.

**Mobile, its own composition.** Portrait framing: the piece fills the screen from plinth to crown, the label sits under it, and the light follows tilt (if permitted) or a thumb drag.

**The main risk.**
- The heaviest asset load of the five: ten or more custom sculptures with bespoke materials, plus the frame-rate budget on a mid-range phone.
- Dark 3D objects under a spotlight is also the default look of luxury-product sites. The pieces' forms and materials have to carry all of the originality.
- A visitor who knows nothing about chess may see a beautiful chess set, not a career.

---

## 3. Blindfold

**The world.** The career is played blindfold: there is no board, only moves called aloud and written down. The position exists in the visitor's head, and it is seen only in flashes.

**The signature moment (first 5 seconds).**
1. A pale, cool grey field (not white, not paper).
2. The game is called out one move at a time, at a speaking pace, in large monospace: `1. e4`, `e5`, `2. Nf3`… Each move replaces the last, so there is never a move list. With sound on, an arbiter's voice calls them.
3. At `10…Bg4` the whole position flashes for 400 ms: a board built entirely of characters (pieces as letters, squares as `.` and `:`), then gone.
4. What stays is `10…Bg4` at poster size and, beneath it, `Anas Qumhiyeh`, *I like systems that have to survive measurement.*

**The navigation model.** The site is four spoken destinations, and the board is the hidden map.
- The four words (Work, Profile, Lab, Contact) sit in one corner.
- Pressing and holding anywhere peeks at the board, and in the peek each piece is a link to its chapter.
- Pages change like called moves: the old notation is struck out, the new move is written, and the page underneath changes. Both states stay on screen for the length of the stroke.

**The signature interaction: peek.** Hold (space bar, long press, or mouse button) and the character board appears under the pointer for as long as you hold.
- It is a real 3D board rendered through a glyph shader, so it tilts slightly with the pointer, and the characters take their brightness from the lighting.
- Release, and it is gone.
- The rest of the time, the cursor is a coordinate readout, the square under it (`e4`).
- Keyboard: typing a square name (`g4`) jumps to whatever stands there.

**Art direction.**
- **Type.** Led by monospace: one characterful mono with proper figurine glyphs (♗♘), used at poster scale for notation and at reading scale for everything else.
- **Palette.** Cool pale grey and graphite, and nothing else. The only thing that ever looks like light is the peek.
- **Material and lighting.** None visible. The world is a lack of image.
- **Role of 3D.** It exists but is never shown as 3D: a lit board scene seen only through the character renderer.

**References used.**
- **Revelatio's character-built title screen:** the board as characters, lit by a real scene, with the colour and the TV shape dropped.
- **Revelatio's cursor:** the coordinate readout.
- **Revelatio's contact page:** a conversational contact where the arbiter asks *Your move?* and the reply opens an email.
- **PX PUSH separate pages:** the four destinations.
- **Illoca:** barely used, and on purpose. This is the anti-immersive concept.

**How it shows the work.**
- **Work index:** the projects are called out one by one, each as its move at poster size (`7…Ne4`), with the project name and one number under it.
- **Project page:** it opens on the move. Scrolling reads the case study as commentary, and peeking shows the position with that project's piece picked out.
- **Covers:** art-directed covers go through the same character renderer, so imagery never breaks the world.

**Mobile, its own composition.** The notation stacks vertically, one move per screen height. Peek is a long press, and haptics (where available) mark each flash.

**The main risk.**
- Visitors who don't know chess may see noise and leave in the first five seconds. Every screen must lead with a plain word (a name, a role, a number) as well as notation.
- Hold-to-reveal is hidden by nature, so the first peek has to be taught in the hero without adding words.
- The brief's cover imagery gets filtered, which may undersell the projects.

---

## 4. Search *(The Engine's Mind)*

**The world.** The site is the inside of a chess engine thinking about one position, and the engine is the one this engineer built.

**The signature moment (first 5 seconds).**
1. A cold, deep ink field.
2. One point of light: the position after 10…Bg4.
3. The kept engine starts searching it, live, in a worker. Every node it expands draws as a fine line, branching outward in three dimensions. Within about 3 seconds the tree is several thousand real nodes.
4. The principal variation, the line the engine believes, lights up in the single accent colour.
5. Then: `Anas Qumhiyeh`, *I like systems that have to survive measurement.*
6. It is not decoration. It is the actual search, and it can be different on every visit.

**The navigation model: the tree is the navigation.**
- Four thick branches leave the root: Work, Profile, Lab, Contact. Choosing one flies the camera down that branch, and the rest of the tree dims and is pruned away.
- Inside Work, each project is a node on the career's principal variation, the moves actually played.
- The roads not taken (the 2…d6 ghost already in the data) are drawn as pruned branches, visible but cut.
- Going back flies up the branch.

**The signature interaction: think.** Holding on any node makes the engine think from that position, right there.
- A subtree grows under the pointer.
- The evaluation and node count tick upward in monospace.
- Release, and the growth stops where it is.

**Art direction.**
- **Type.** A precise, light grotesk for the few words, and a monospace for every number (evaluations, node counts, depths).
- **Palette.** Cold ink, lines in off-white at many opacities, and one accent for the principal variation only: a signal amber, never used anywhere else.
- **Material and lighting.** Emissive lines in a dark volume, with depth of field doing the work of lighting.
- **Role of 3D.** Central, but not objects. Instanced line geometry fed by real search data, and no pieces except tiny glyphs at the leaves.

**References used.**
- **Illoca's opening:** entering the space.
- **Illoca's sidebars:** on a project node the viewport narrows and the case-study panel slides in from one side, never over the tree.
- **PX PUSH scroll transitions:** the camera flying down branches between pages.
- **Revelatio's cursor:** reborn as a probe that shows the evaluation of the node beneath it.

**How it shows the work.** A project page opens inside its node's subtree. The project name, one line and one number with its qualifier sit in the freed column, and the engine's evaluation of that project's move sits at the node. The art-directed cover is framed as the leaf the branch was growing towards.

**Mobile, its own composition.** The tree grows upward from the bottom edge like a root system seen in section, and the branches are thumb-sized. The engine searches at a fixed low node budget on phones, so the moment still happens.

**The main risk.**
- This is the concept closest to what the brief bans (particle fields) and to the look of every AI company's "neural network" hero. It lives or dies on structure: the branching has to be recognisably a search, deterministic and data-true.
- Running the engine on a phone at 45 fps next to WebGL is a real budget.
- The honesty rule: it must be clear the tree is a chess search, not a model of the career.

---

## 5. Simul *(outside the territories)*

**The world.** A simultaneous exhibition in a hall after dark. One player walks the inside of a horseshoe of tables, playing every board at once, and each board is one chapter of the career.

It is truthful: the career really was played in parallel. `OVERLAP_NOTE` records Western Digital overlapping Setel and final-year study, and the Monash contract overlapping the start at Skribble Lab.

**The signature moment (first 5 seconds).**
1. A high, wide shot of a dark hall: a horseshoe of tables, each with its own lamp, most still dark.
2. The camera descends in an arc to eye level *inside* the horseshoe, the exhibitor's view.
3. It stops at the latest board, where one lamp is on.
4. `Anas Qumhiyeh` and *I like systems that have to survive measurement.*
5. Someone who knows nothing about chess sees one person and many tables at once. Someone who knows chess sees a simul, and recognises the opening on the lit board.

**The navigation model: walking the ring.**
- Scrolling walks the inside of the horseshoe, in chronological order, and each table's lamp comes on as you reach it. Pinned and choreographed, but the scroll is never taken away.
- **Work:** the tables, one per project.
- **Profile:** the exhibitor's own desk at the head of the room, with the roles laid out like scoresheets and a jacket over the chair.
- **Lab:** the one table at the side where the game was lost. The board still stands at the moment of resignation, with the result card in front of it.
- **Contact:** the last table, an empty chair facing the visitor, a chess clock running: *Take a seat.*

**The signature interaction: sit down.** Choosing a table drops the camera from the exhibitor's standing view into the opponent's chair across the board. That table becomes the project page. Standing back up returns you to the ring, at the same table.

**Art direction.**
- **Type.** A condensed, characterful grotesk that recalls mid-century tournament posters, set large on hall banners and table cards, and a monospace for the numbers.
- **Palette.** Deep charcoal, tungsten amber light pools, one felt green for the playing surfaces. The light is warm; the palette is not beige.
- **Material.** Walnut tables, heavy felt, lamp brass, the paper of table cards.
  - Each table has a different chess set: tournament Staunton, a folding travel set, a club set with a missing piece replaced. Players will notice; nobody else needs to.
- **Role of 3D.** Central and near-photoreal: one environment with baked lighting and instanced tables. The camera is the storyteller.

**References used.** Most directly, the moments you liked in Illoca, and in the same order:
- **Illoca's opening:** the arc from wide and high to over the shoulder.
- **Illoca's sidebars:** each table's text slides in beside it as you arrive.
- **Illoca's angled ending:** the final table comes in at a raking angle, as if you are pulling up the chair.
- **Revelatio's two clocks:** on the contact table's chess clock, your time on one face and Anas's on the other.
- **PX PUSH:** the 3D assets, and separate pages as places in the hall.

**How it shows the work.** Seated, you look across the table:
- The board shows the position at that project's move.
- The table card carries the name, one line and one number with its qualifier.
- The art-directed cover is composed on the table as an object (the product on a device lying beside the board, or printed plates under the lamp), never as a raw screenshot.
- Scrolling moves your gaze from the board to the papers beside it, which carry the case study.

**Mobile, its own composition.** Portrait: the camera stays seated, and a vertical swipe moves you to the next chair around the ring. On a phone, you move from table to table rather than walking the room.

**The main risk.**
- Environment production (a whole hall, lit) and the phone budget.
- Walking can feel slow. The ring has to be edited to six or eight tables, not sixteen.
- A cosy 3D interior can drift towards a stock "3D room" look. The hall's architecture and light need a real point of view: a specific hall, a specific night.

---

## Side by side

| | 1 Advantage | 2 Night Collection | 3 Blindfold | 4 Search | 5 Simul |
|---|---|---|---|---|---|
| World | Eval bar | Museum at night | Called moves | Engine thinking | Hall, many boards |
| Dominant element | The seam | One sculpted piece | One move, poster size | The live tree | The lit table |
| 3D | Almost none | Heavy objects | Hidden, seen as characters | Lines from real data | Heavy environment |
| Legible without chess | High | Medium | Low | Medium | High |
| Build and asset risk | Low | Very high | Medium | High | Very high |
| Phone risk | Low | High | Low | High | High |
| Nearest failure | Repetitive trick | Luxury-product template | Opaque | AI-company hero | Stock 3D room |

## My recommendation

**First choice: Advantage (1) as the world, with one idea borrowed from The Night Collection (2).** On project pages, that project's piece stands on the seam, lit from the white side.
- **Why Advantage:** it has the clearest signature in five seconds. It is built from true data. It is readable by someone who has never played chess (a line that shows who is ahead), and it is new as a portfolio device.
- **What the borrowing adds:** it gives Advantage the sculptural 3D moment it lacks, but only on ten pages rather than as the whole world. That keeps the asset load to ten pieces, not a museum.

**Second choice: Simul (5).** It is the strongest *story*: it tells a non-chess visitor exactly what the career was (many games at once), and it uses more of what you liked in the references than any other. It is also the most expensive to make well.

---

## Conflicts to decide before Phase 2

These come from the design skill the brief names as the authority. They conflict with the reference moments you liked.

1. **The custom cursor.** The skill bans custom cursors. Revelatio's cursor is one of the moments you liked, and concepts 2, 3 and 4 each reinvent it. My proposal: allow one, pointer devices only, never replacing the native cursor on text, and off under reduced motion. Your call.
2. **Clocks and local time.** The skill bans locale and time strips. Revelatio's two clocks are part of the contact page you liked; they appear in concepts 1 and 5. Here the time is the chess clock itself, not decoration, but it is the same pattern.
3. **Dashes in copy.** The skill bans em and en dashes in visible text. The content uses en dashes for ranges (`4–6 services`, `Feb–Dec 2025`, `1–5 min`). The minus signs in `−143.3` and `−50%` are true minus signs and stay either way. I propose hyphens for ranges on the site: no number changes.
