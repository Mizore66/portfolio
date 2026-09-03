import { PHASE2_MATCH } from "@/lib/chess/phase2";
import { METRICS } from "@/lib/metrics";

/**
 * Lab article for Gate C. Copy is a structured restatement of the match
 * already on the paper — hypothesis as the experimental question, not a
 * claim that the net "should" have won. The next experiment is named;
 * it has not been run.
 */
export const LAB_ARTICLE = {
  href: "/lab/learned-evaluator",
  kicker: "Laboratory",
  hed: "The learned evaluator lost −143.1 ±40.5 Elo",
  dek: "N = 100 games. The training data was the bottleneck.",
  teaser: "Chess engine → learned evaluator lost −143.1 ±40.5 Elo. Here's why.",
  resultGlyph: "?!",
  resultJoke: "Result: Black was unconvinced.",
  filed: "Filed against the 2026-08-29 net",
  datePublished: "2026-08-29",
  meta: "Gate C: the playing 768×2×256 net lost −143.1 ±40.5 Elo to PeSTO at 50 000 nodes/move, 100 games.",
  hypothesisKicker: "Hypothesis",
  hypothesisHed: "Would a 256-wide net beat PeSTO at the same node budget?",
  hypothesis:
    "Two evaluations, one search: would the playing 768×2×256 net — trained on 20 million quiet CC0 Lichess cloud evals, depth-12 labels — beat handcrafted PeSTO at the same node budget?",
  experimentKicker: "Experiment",
  experimentHed: "Fixed-N at 50 000 nodes, 100 games",
  experiment:
    "Same search implementation. Fixed 50 000 nodes a move. 100 games, colours swapped on the fifty-opening suite. LEARNED is the masthead eval; PeSTO is the Gate C opponent and remains a comparison toggle. This is a fixed-N match, not a terminated SPRT.",
  resultKicker: "Result",
  resultHed: "−143.1 ±40.5 Elo",
  result: `${PHASE2_MATCH.elo.toFixed(1)} ±${PHASE2_MATCH.eloErr} Elo.`,
  resultLine: PHASE2_MATCH.reportLine,
  resultNote: METRICS.gateC.note,
  failedKicker: "What failed",
  failedHed: "The data, not the regime",
  failed:
    "LEARNED scored 1 win, 59 draws, 40 losses. LLR −2.33 against bounds ±2.94 is inconclusive; SPRT unterminated. Gate A at the same cap was 0.0 Elo (17–66–17, every pair 1–1), so the −143 is not a colour or adjudication artefact. The retrained net lost harder at 50k than the v1 128 did at 1k — the signature of the training data being the bottleneck.",
  learnedKicker: "What I learned",
  learnedHed: "The next experiment is the GUARDS gates, then SPRT",
  learned:
    "A loss at the spec cap is still a result. Do not compare Gate C at 50 000 nodes with the earlier −100 at 1 000 nodes — that was the v1 128. The 2200 on the glass is a club-strength anchor, not a CCRL listing. Next: pass the GUARDS.md data and progress gates, then rematch to an SPRT bound or a fixed-2000 sample at 50 000 nodes.",
} as const;