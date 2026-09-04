import { PHASE2_MATCH } from "@/lib/chess/phase2";
import { METRICS } from "@/lib/metrics";

/**
 * Lab article for Gate C. Copy is a structured restatement of the match
 * already on the paper — hypothesis as the experimental question, not a
 * claim that the net "should" have won. SPRT terminated for H0 on this net.
 */
export const LAB_ARTICLE = {
  href: "/lab/learned-evaluator",
  kicker: "Laboratory",
  hed: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games",
  dek: "N = 128 games. SPRT terminated for H0. The result makes data quality the leading hypothesis.",
  teaser: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games.",
  resultGlyph: "?!",
  resultJoke: "Result: Black was unconvinced.",
  filed: "Filed against the 2026-08-29 net; SPRT continued 2026-09-03",
  datePublished: "2026-08-29",
  dateModified: "2026-09-03",
  meta: "Gate C: the playing 768×2×256 net lost −143.3 ±35.4 Elo to PeSTO at 50 000 nodes/move, 128 games, SPRT h0.",
  hypothesisKicker: "Hypothesis",
  hypothesisHed: "Would a 256-wide net beat PeSTO at the same node budget?",
  hypothesis:
    "Two evaluations, one search: would the playing 768×2×256 net — trained on 20 million quiet CC0 Lichess cloud evals, depth-12 labels — beat handcrafted PeSTO at the same node budget?",
  experimentKicker: "Experiment",
  experimentHed: "SPRT at 50 000 nodes, continued to 128 games",
  experiment:
    "Same search implementation. Fixed 50 000 nodes a move. The first 100 games on the fifty-opening suite stopped short of a bound (LLR −2.33 vs ±2.94). A continuation wrapped the suite until SPRT hit a bound. LEARNED is the masthead eval; PeSTO is the Gate C opponent and remains a comparison toggle. H0 = 0 Elo, H1 = +10 Elo.",
  resultKicker: "Result",
  resultHed: "−143.3 ±35.4 Elo",
  result: `${PHASE2_MATCH.elo.toFixed(1)} ±${PHASE2_MATCH.eloErr} Elo.`,
  resultLine: PHASE2_MATCH.reportLine,
  resultNote: METRICS.gateC.note,
  failedKicker: "What failed",
  failedHed: "Data quality is the leading hypothesis",
  failed:
    "LEARNED scored 2 wins, 74 draws, 52 losses in 128 games. LLR −2.99 against bounds ±2.94 terminated for H0. Gate A at the same cap was 0.0 Elo (17–66–17, every pair 1–1), so the −143 is not a colour or adjudication artefact. The retrained net lost harder at 50k than the v1 128 did at 1k. Causal ablations that isolate model capacity, training recipe, or features were not run; the result makes data quality the leading hypothesis, not a proven cause.",
  learnedKicker: "What I learned",
  learnedHed: "This net is closed; rematch only after a new ingest",
  learned:
    "A loss at the spec cap is still a result. Do not compare Gate C at 50 000 nodes with the earlier −100 at 1 000 nodes — that was the v1 128. The 2200 on the glass is a club-strength anchor, not a CCRL listing. Do not rematch this net: training/GUARDS.md closes the 2026-08-29 256-wide ingest after SPRT terminated for H0 at 128 games. A new net still has to pass the data and progress gates in that file first.",
} as const;
