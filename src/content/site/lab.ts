export const LAB_TEASER = {
  claimId: "gateC",
  headline: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games.",
  meta: "128 games · 50 000 nodes/move · SPRT h0",
  annotation: "I published the loss, the confidence interval, and what failed.",
  links: [
    { label: "Read the experiment", href: "/lab/learned-evaluator" },
    { label: "Play the annotated career", href: "/opening-preparation" },
    { label: "SLM Distillation Engine", href: "/projects/slm-distillation-engine" },
  ],
} as const;

/**
 * /lab/learned-evaluator (brief Appendix B). Numbers come from matches/gate-c-v1-50000-sprt.json and
 * matches/gate-a-v1-50000.json. The required changes (disclosure, candidate causes, no "2200", credits)
 * are applied; the owner confirms the wording.
 */
export const LAB_ARTICLE = {
  title: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games",
  description: "Gate C: a 768×2×256 net lost −143.3 ±35.4 Elo to handcrafted PeSTO at 50,000 nodes/move over 128 games; SPRT terminated for H0.",
  datePublished: "2026-08-29",
  dateModified: "2026-09-03",
  dek: "N = 128 games. SPRT terminated for H0.",
  resultLine: "sprt: −143.3 ±35.4 Elo @ 50000 nodes, 128 games, LLR −2.99 (h0)",
  tagline: "Result: Black was unconvinced.",
  netId: "nnue-lichess-cc0-768x2x256-32-1-2026-08-29",
  suiteId: "openings-v1",
  hypothesis:
    "Two evaluations, one search: would the playing 768×2×256 net — trained on 20 million quiet CC0 Lichess cloud evals, depth-12 labels — beat handcrafted PeSTO at the same node budget?",
  disclosure:
    "What was tested as “Learned” is not the net alone: it is the material count plus the net’s output, clamped to ±60 centipawns. The net can adjust a position by at most 0.6 of a pawn either way.",
  experiment:
    "Same search implementation. Fixed 50 000 nodes a move. The first 100 games on the fifty-opening suite stopped short of a bound (LLR −2.33 vs ±2.94). A continuation wrapped the suite until SPRT hit a bound. H0 = 0 Elo, H1 = +10 Elo.",
  result: "−143.3 ±35.4 Elo",
  failed:
    "LEARNED scored 2 wins, 74 draws, 52 losses in 128 games. LLR −2.99 against bounds ±2.94 terminated for H0. Gate A at the same cap was 0.0 Elo (17–66–17, every pair 1–1), so the −143 is not a colour or adjudication artefact. The retrained net lost harder at 50k than the v1 128 did at 1k. Causal ablations that isolate model capacity, training recipe, or features were not run.",
  causes:
    "Two explanations fit equally well and neither was isolated: the quality of the training data, and the integration itself, where a ±60 centipawn clamp on top of material leaves the net little room to change a decision.",
  learned:
    "A loss at the spec cap is still a result. Do not compare Gate C at 50 000 nodes with the earlier −100 at 1 000 nodes — that was the v1 128. Do not rematch this net: a new net still has to pass the data and progress gates first.",
  credits: [
    "Handcrafted evaluation: the PeSTO piece-square tables by Ronald Friederich.",
    "Lichess eval database, CC0-1.0. No Stockfish network weights are copied.",
  ],
  gates: [
    { label: "Gate A · 50k", detail: "Handcrafted against itself, the control", elo: 0.0, err: 0.0, games: 100, record: "17–66–17" },
    { label: "Gate C · 256", detail: "Learned against handcrafted", elo: -143.3, err: 35.4, games: 128, record: "2–74–52" },
  ],
} as const;
