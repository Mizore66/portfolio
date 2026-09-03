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

Same engines at the spec cap, 50 000 nodes/move, three process shards:

`matches/gate-a-v1-50000.json`:

`sprt: +0.0 ±0.0 Elo, 100 games, LLR -0.06 (inconclusive)`

WDL 17–66–17. Pentanomial is fifty 1–1 pairs again. Elo 0.0 with a degenerate interval. The 1k calibration transfers: the harness is not the source of a 50k delta either. Wall-clock ~18 min on three shards (parent `elapsedMs` 1 088 973).

## Gate C — learned vs handcrafted (first column)

Net **`nnue-lichess-cc0-768x2x128-32-1-2026-08-28`** (not the 256 file).

`gate-c-v1-1000.json`:

`sprt: -100.0 ±35.4 Elo, 100 games, LLR -1.69 (inconclusive)`

That line is a **fixed-N** result. The SPRT was halted at 100 games with LLR −1.69 against bounds ±≈2.94 — it never terminated. The paper reports it as:

`fixed-N: −100.0 ±35.4 Elo @ 1000 nodes, 100 games, LLR −1.69 (inconclusive; SPRT unterminated)`

The spec default is 50 000 nodes. This first column used 1000. Do not compare it to a future 50k number.

The 128 net is a residual on classical material. Do not compare 1k to 50k.

## Gate C — learned vs handcrafted (50k column)

Net **`nnue-lichess-cc0-768x2x256-32-1-2026-08-29`**. Four process shards, 50 000 nodes/move, 100 games.

`matches/gate-c-v1-50000.json`:

`sprt: -143.1 ±40.5 Elo, 100 games, LLR -2.33 (inconclusive)`

That line is a **fixed-N** result. The SPRT never hit a bound (LLR −2.33 vs ±≈2.94). The paper reported it as:

`fixed-N: −143.1 ±40.5 Elo @ 50000 nodes, 100 games, LLR −2.33 (inconclusive; SPRT unterminated)`

WDL 1–59–40. Wall-clock ~46 min (`elapsedMs` 2 746 036). Kept as the incomplete snapshot.

Continuation, wrapping the suite until SPRT, `--sprt-stop --continue matches/gate-c-v1-50000.json --max-games 140`:

`matches/gate-c-v1-50000-sprt.json`:

`sprt: -143.3 ±35.4 Elo, 128 games, LLR -2.99 (h0)`

WDL 2–74–52. Decision **h0** (H0 = 0 Elo, H1 = +10). Gate A at the same cap was 0.0 Elo, so the −143 is not a colour or adjudication artefact. LEARNED is the playing eval; PeSTO stays as a comparison toggle and the historical opponent. Do not rematch this net.

