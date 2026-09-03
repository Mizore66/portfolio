# Edition ledger

Internal record of what the paper claims, where the claim lives, and how a correction is filed. Not a public changelog.

## How a correction is filed

If a number, owner, or date is wrong, do not silently rewrite the live sentence.

1. Change the single source in `src/lib/metrics.ts` or `src/lib/data.ts`.
2. Add an understated `Correction` note on the page that carried the old claim (the 404 already uses that kicker for missing plates).
3. Record the old wording and the date of the change in this file.

Errata on the paper currently reads: none reported.

## Claim sources

| Claim | Owner | Kind | Source of truth |
| --- | --- | --- | --- |
| −40% production defects | Setel | production | `METRICS.setelDefects` |
| 92.5% unit-test coverage | Setel | evaluation | `METRICS.setelCoverage` |
| +45% retrieval | Monash contract | evaluation | `METRICS.monashRetrieval` (university regulations) |
| +35% retrieval | GraphRAG project | evaluation | `METRICS.graphragRetrieval` (policy corpus) |
| −40% manual oversight | Western Digital | evaluation | `METRICS.wdOversight` |
| 99.9% uptime / −15% emissions | Veridian | evaluation | `METRICS.veridianUptime` / `veridianEmissions` — Cloud Run evaluations; period and sample not filed; demoted from the exhibit Result |
| 100M events/day | Lead Scorer | pipeline | `METRICS.leadThroughput` — not production volume |
| 70B → 3B student | SLM Distillation | evaluation | `METRICS.slmInference` |
| 0.87 AUC-ROC | Financial Risk Predictor | evaluation | `METRICS.riskAuc` |
| −143 Elo @ 50k | Gate C | benchmark | `PHASE2_MATCH` / `METRICS.gateC` |

Monash +45% and GraphRAG +35% are different corpora. Do not retcon them.

## Pages

| URL | Filed | Notes |
| --- | --- | --- |
| `/` | — | Masthead, selected work, desks, lab teaser |
| `/opening-preparation` | — | Full scoresheet, engine, puzzle |
| `/colophon` | — | How this paper was set |
| `/projects/{slug}` | project `date` | Independent exhibit; argument lives here |
| `/lab/learned-evaluator` | 2026-08-29 | Against the playing net id, not an invented “Published March” |
| `/print-edition` | — | `Anas-Qumhiyeh-Resume.pdf` |
| 404 | — | Correction, not a host default |

No retired pages.

## What this paper does not claim

- Team size, duration, or “I owned X on a team of Y”
- “Today I would…” on older exhibits
- Work authorization, relocation, or target geography
- Terminated SPRT billed as `RESULT: REJECTED` (the exhibit is SPRT **h0**, not that slogan)
- Live demo hosts (there are none to sleep)
- Empty Writing / blog section
- Vanity counters or Lighthouse badges

## Corrections (3 September 2026)

- Gate C continued from the 100-game suite to SPRT **h0**: −143.3 ±35.4 Elo, 128 games, LLR −2.99. The incomplete 100-game snapshot stays on disk.

## Corrections (1 September 2026)

- Veridian 99.9% uptime and −15% emissions stay Cloud Run evaluations; they are no longer the exhibit Result. Period, sample, and emissions source remain unfiled.
- Financial Risk Predictor −30% latency and SLM −40% memory / 98% pass moved to Also filed / Limitations.
- Lead Scorer “zero tape lost” replaced with checkpoint-resume wording. 100M events/day remains capacity.
- GraphRAG and SLM patent sheets labelled `Illustration Apr. 2026` against project dates Oct 2025 and Jul 2025.
- Duplicate `Evaluation · evaluation` and hero “hours cut to minutes” label removed.

## External URLs

Public sources named on the paper: `github.com/Mizore66/CircuitMindAI`, `github.com/Mizore66/MirrorFi`, `linkedin.com/in/anasqumhiyeh/`. Re-check them when copy changes. The argument for every exhibit is on this domain; GitHub is optional.

## Identity

Masthead: Anas T. Qumhiyeh. Résumé / Person JSON-LD: Anas Tarek Qumhiyeh. Same person, deliberate shortening.
