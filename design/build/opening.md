# Play: choosing an opening (comp, built)

The owner's call (2026-10-01): every named opening, searchable; approved as built (2026-10-02). Lichess's list
(`content/openings`, CC0): 3,815 lines, each scored ahead by both evaluators (`scripts/openings.ts`), in
`public/engine/openings.json` (487 KB; 81 KB gzipped), fetched when the search first opens. Screens at 1728 × 1000 and
390 × 844.

| | Desktop | Phone |
|---|---|---|
| Closed: "Opening", the start position | ![](opening/desk-1-closed.jpg) | ![](opening/phone-1-closed.jpg) |
| Open: the field, the start position and five of the openings played most | ![](opening/desk-2-open.jpg) | ![](opening/phone-2-open.jpg) |
| Typed "najdorf" | ![](opening/desk-3-search.jpg) | ![](opening/phone-3-search.jpg) |
| Picked: the pieces slide to it, its moves in the moves line | ![](opening/desk-4-picked.jpg) | ![](opening/phone-4-picked.jpg) |
| Start pressed: the engine scores the position and names your move | ![](opening/desk-5-started.jpg) | ![](opening/phone-5-started.jpg) |

- **Where:** under "You play" on desktop; on phones, above the moves at the foot, since the top row has no room. While
  searching on a phone, the moves, status and Start step aside so the matches stay clear of the board (five shown).
- **Search:** every word typed must be in the name, or be the ECO code; the shortest names come first, so "sicilian"
  finds the Sicilian Defense before its variations. Arrow keys move through the matches, Enter picks, Escape closes.
- **The game:** it goes on from the opening's position; if the engine is to move, it moves first once started. The
  repetition and fifty-move counts include the opening's moves.
- **Scored ahead (the owner's B):** the moment an opening is picked the seam moves to the learned net's score and the
  status names the engine's move, before Start, as for the start position. Every line's final position was searched
  at 50,000 nodes by each evaluator, as Play searches (the start position reproduces lab-data.json: +31 e4, 0 Nc3).
- **Lines under one name** (the Najdorf has five) show their last move ("6. Bg5") when they appear together.
- **Copy (approved):** "Opening", "Start position", "Search openings", "No opening by that name.", "The {net} net
  moves next. Press Start."
