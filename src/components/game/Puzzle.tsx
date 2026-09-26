"use client";

import { useState } from "react";

type Choice = { san: string; uci: string };

/** The 4…Nf6 puzzle (brief §3.7). Plain buttons, so it works without the board or the engine. */
export function Puzzle({
  prompt,
  target,
  hit,
  miss,
  choices,
}: {
  prompt: string;
  target: string;
  hit: string;
  miss: string;
  choices: Choice[];
}) {
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <div className="puzzle" role="group" aria-labelledby="puzzle-prompt">
      <p id="puzzle-prompt" className="puzzle-prompt">
        {prompt}
      </p>
      <div className="hero-actions">
        {choices.map((c) => (
          <button key={c.uci} type="button" className="btn" aria-pressed={answer === c.uci} onClick={() => setAnswer(c.uci)}>
            5. {c.san}
          </button>
        ))}
      </div>
      <p className="annotation" role="status" aria-live="polite">
        {answer ? (answer === target ? hit : miss) : ""}
      </p>
    </div>
  );
}
