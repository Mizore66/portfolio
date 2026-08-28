# §9 guards

Diagnostics that must exist before treating a self-play number as an exhibit.

| Guard | Where | What a failure means |
| --- | --- | --- |
| Hold-out r vs Stockfish | `training/HOLDOUT.md`, `public/engine/*.json` | Label noise or a dead net |
| Float vs int8 forward | `evaluateNnue` vs `evaluateNnueFloat` in `guards.test.ts` | Scale / QAT bug (a −100 can hide here) |
| Incremental accumulator == full refresh | `guards.test.ts` + `nnue.test.ts` | Make/unmake drift |
| Ten-position material order | `guards.test.ts` | Learned eval cannot rank KQ > KR > KN > K |
| Gate A calibration | `matches/gate-a-v1-1000.json` | Harness bias (colour, adjudication) at the same node cap as Gate C |

Order of work after these: better labels (min_depth 12+, 20–30M), then a 50k-nodes-to-bound rematch of the *retrained* net. WASM is match infrastructure so that regime is tractable; it is not Elo.
