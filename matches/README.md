# Match reports

JSON artifacts from `npx tsx src/lib/chess/match/cli.ts`.

These are the site's data source for the evaluations column and the Elo-over-commits chart.
Do not merge an eval or search change without a `sprt:` line in the commit message.

Gate A (handcrafted vs handcrafted, ~0 Elo) is asserted in `src/lib/chess/match/match.test.ts`.

Gate C (learned vs handcrafted, openings-v1, 1000 nodes/move):
`sprt: -100.0 ±35.4 Elo, 100 games, LLR -1.69 (inconclusive)`
in `gate-c-v1-1000.json`. The spec default is 50 000 nodes; this first column used 1000.
The 2×128 net is a residual on classical material. PeSTO remains the stronger eval at this cap.
