// The colophon's draft copy (phase 6, step 4), shared by colophon-{a,b,c}.html. Every line was checked against the
// code on 2026-09-30. Lines kept from content.json's v2 colophon are marked kept; the rest is new and needs approval.
export const COPY = {
  title: "How this site was made.",
  lede: "An analysis board: the career as facts, the commentary kept apart, and a chess engine you can actually play.", // kept
  sections: [
    { k: "The seam", body: "The line down every page is an engine's evaluation bar. The paper side is White's share of the position on screen: 55.9% on the home page, after 10…Bg4." },
    { k: "Type", body: "Archivo for the words, JetBrains Mono for moves and numbers. Roman is fact; italic is voice. Both are self-hosted subsets under the SIL Open Font License 1.1." },
    { k: "The engine", body: "Move generation, alpha-beta search, the handcrafted evaluation and a learned NNUE evaluation are written from scratch. The net was trained on CC0 Lichess evaluations with quantisation-aware training and runs through a small WebAssembly module. It starts only when you ask, runs in a Web Worker and pauses when the tab is hidden." },
    { k: "Made for this site", body: "Every piece, board, grain and light is made in code for this site: no third-party models, scans or environment maps. The four sound cues are synthesized, with no samples. The screenshots are the projects' own." },
    { k: "Publishing", body: "Every word and number lives in one content file in the repository. The pages, the résumé and the share cards are built from it. There is no content management system." },
  ],
  perft: { lead: "The move generator's receipt, from the start position:", rows: [[1, "20"], [2, "400"], [3, "8,902"]] },
  tests: [
    "Every number on the site is registered in one claims ledger, with an evidence type, an owner and a date.", // kept
    "Every move shown is legal under the engine's own move generator, and the home page plays the recorded career line.",
    "Every page has no automated accessibility violations at desktop and phone widths, with and without reduced motion, and no sideways scrolling at 320 px.",
    "The end-to-end suite runs in Chromium, Firefox and WebKit.",
    "The learned net was measured against the handcrafted one before it could play: it lost by −143.3 ±35.4 Elo over 128 games, and the Lab publishes the loss.",
  ],
  credits: [
    ["Handcrafted evaluation", "The PeSTO piece-square tables by Ronald Friederich."], // kept
    ["Training data", "The Lichess evaluation database, CC0 1.0. No Stockfish network weights are used."],
    ["The seven master games", "Historical game scores in the public domain, chosen from TheChessWorld's 15 best games of all time."],
    ["Type", "Archivo by Omnibus-Type and JetBrains Mono by JetBrains, SIL Open Font License 1.1."],
    ["Code", "three.js (MIT), GSAP (Standard License, no charge), Lenis (MIT), Next.js and React (MIT)."],
    ["Hosting", "Vercel, with cookieless Vercel Web Analytics."],
  ],
  by: "Designed and built by Anas Qumhiyeh.",
};
