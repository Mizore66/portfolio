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

## Open

- **Which master game plays on each table.** Candidates are verified as legal in the kept engine. Each still needs checking against a published score, and its attribution noted.
- **The role page layout** around the 3D set.
