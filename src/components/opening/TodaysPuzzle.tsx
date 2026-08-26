"use client";

import { BROADSHEET } from "@/content/opening";
import { todaysPuzzle } from "@/lib/opening/tree";

export function TodaysPuzzle({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const node = todaysPuzzle();
  if (!node?.puzzle) return null;
  const current = node.id === selectedId;

  return (
    <div data-testid="todays-puzzle" className="border-2 border-ink px-2 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.puzzleKicker}
      </p>
      <p className="mt-1 font-display text-[13px] leading-snug italic text-ink">{node.puzzle.prompt}</p>
      <button
        type="button"
        data-node-id={node.id}
        aria-current={current ? "true" : undefined}
        onClick={() => {
          onSelect(node.id);
          document.getElementById("play-board")?.focus();
        }}
        className="mt-2 font-mono text-[10px] uppercase tracking-widest text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red"
      >
        Stamp the square
      </button>
    </div>
  );
}
