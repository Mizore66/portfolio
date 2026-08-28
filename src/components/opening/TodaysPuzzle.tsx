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
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.puzzleKicker}
      </p>
      <p className="mt-2 font-display text-[16px] leading-snug italic text-ink">{node.puzzle.prompt}</p>
      <button
        type="button"
        data-node-id={node.id}
        data-testid="stamp-the-square"
        aria-current={current ? "true" : undefined}
        onClick={() => {
          onSelect(node.id);
          document.getElementById("play-board")?.focus();
        }}
        className="paper-control mt-2 bg-paper text-ink hover:bg-paper-deep"
      >
        Stamp the square
      </button>
    </div>
  );
}
