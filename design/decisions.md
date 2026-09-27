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

## Open

- There are 7 games and 6 roles. Proposed: a seventh table for education (the Monash degree).
- Assignment proposal: games in the order they were played, on tables in career order.
