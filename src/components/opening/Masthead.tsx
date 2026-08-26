"use client";

import type { ReactNode } from "react";
import { resumeData } from "@/lib/data";
import { FLAGSHIP_ID, getNode, moveHeading } from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

type View = "tree" | "notation";

export function Masthead({
  view,
  onView,
  onSelect,
}: {
  view: View;
  onView: (view: View) => void;
  onSelect: (id: string) => void;
}) {
  const flagship = getNode(FLAGSHIP_ID);
  const year = new Date().getFullYear();

  return (
    <header className="sheet overflow-hidden">
      <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
          C50 · Italian Game · Vol. {year} · Moves are facts · Annotations are voice
        </p>
      </div>
      <div className="border-b-2 border-ink px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] tracking-tight text-ink">
              A. T. Qumhiyeh
            </h1>
            <p className="mt-2 font-display text-xl italic text-faded sm:text-2xl">
              Opening Preparation
            </p>
            <p className="mt-3 max-w-2xl font-mono text-[11px] text-faded">
              <a className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red" href={`mailto:${resumeData.email}`}>
                {resumeData.email}
              </a>
              <span className="mx-2 text-ink">·</span>
              <a className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red" href={`https://${resumeData.github}`} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <span className="mx-2 text-ink">·</span>
              <a className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red" href={`https://${resumeData.linkedin}`} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <span className="mx-2 hidden text-ink sm:inline">·</span>
              <span className="hidden sm:inline">Click any move · ← → steps the mainline</span>
            </p>
          </div>
          <div className="hidden min-[980px]:flex items-stretch border-2 border-ink">
            <ToggleButton active={view === "tree"} onClick={() => onView("tree")}>
              Tree
            </ToggleButton>
            <ToggleButton active={view === "notation"} onClick={() => onView("notation")} edge>
              Notation
            </ToggleButton>
          </div>
        </div>
      </div>
      <button
        type="button"
        data-testid="lead-headline"
        onClick={() => onSelect(FLAGSHIP_ID)}
        className="group relative flex w-full items-stretch text-left"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-display text-[clamp(4.5rem,14vw,8rem)] font-bold leading-none text-score-red/15"
        >
          {flagship.sym || "!!"}
        </span>
        <span className="relative flex w-full flex-col gap-1 px-4 py-4 sm:px-6 sm:py-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-score-red">
            Lead · Flagship · Jump to the node
          </span>
          <span className="font-display text-[clamp(1.6rem,4.2vw,3.1rem)] font-bold leading-[1.05] tracking-tight text-ink group-hover:text-score-red">
            {moveHeading(flagship)}
            {flagship.sym ? (
              <span className="ml-2 text-score-red">{flagship.sym}</span>
            ) : null}
            <span className="mx-3 text-faded">—</span>
            <span className="uppercase">{flagship.title}</span>
          </span>
          <span className="max-w-3xl font-lora text-[15px] leading-snug text-ink">
            {flagship.commentary.split(/(?<=\.)\s/)[0]}
          </span>
        </span>
      </button>
      <div className="h-1 border-t-2 border-ink" />
      <div className="border-b-2 border-ink" />
    </header>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  edge,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  edge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest",
        edge && "border-l-2 border-ink",
        active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-deep",
      )}
    >
      {children}
    </button>
  );
}
