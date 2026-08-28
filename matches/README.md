# Match reports

JSON artifacts from `npx tsx src/lib/chess/match/cli.ts`.

These are the site's data source for the evaluations column and the Elo-over-commits chart.
Do not merge an eval or search change without a `sprt:` or `fixed-N:` line in the commit message.

## Gate A — harness calibration

Handcrafted vs handcrafted, openings-v1, 1000 nodes/move, 100 games, **no `--sprt-stop`**.
Same regime as Gate C so colour imbalance and adjudication bugs would show as a non-zero delta.

`matches/gate-a-v1-1000.json`:

`sprt: +0.0 ±0.0 Elo, 100 games, LLR -0.06 (inconclusive)`

WDL 17–66–17. Pentanomial is fifty 1–1 pairs (identical engines, colours swapped). Elo 0.0 with a degenerate interval because pair variance is zero. The harness is not the source of Gate C’s −100.

A vitest mini at 48 nodes still lives in `src/lib/chess/match/match.test.ts` and must stay ~0 Elo.

## Gate C — learned vs handcrafted (first column)

Net **`nnue-lichess-cc0-768x2x128-32-1-2026-08-28`** (not the 256 file).

`gate-c-v1-1000.json`:

`sprt: -100.0 ±35.4 Elo, 100 games, LLR -1.69 (inconclusive)`

That line is a **fixed-N** result. The SPRT was halted at 100 games with LLR −1.69 against bounds ±≈2.94 — it never terminated. The paper reports it as:

`fixed-N: −100.0 ±35.4 Elo @ 1000 nodes, 100 games, LLR −1.69 (inconclusive; SPRT unterminated)`

The spec default is 50 000 nodes. This first column used 1000. Do not compare it to a future 50k number.

The 128 net is a residual on classical material. PeSTO remains the stronger eval at this cap.
