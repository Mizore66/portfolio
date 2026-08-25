"use client";

import type { ReactNode } from "react";
import { resumeData } from "@/lib/data";
import { cn } from "@/lib/utils";

type View = "tree" | "notation";

export function Masthead({
  view,
  onView,
}: {
  view: View;
  onView: (view: View) => void;
}) {
  return (
    <header className="sheet">
      <div className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
              C50 · Italian Game · Vol. {new Date().getFullYear()}
            </p>
            <h1 className="font-display text-xl leading-tight text-ink sm:text-2xl">
              A. T. Qumhiyeh
              <span className="text-faded"> — </span>
              Opening Preparation
            </h1>
            <p className="mt-1 max-w-2xl font-mono text-[11px] text-faded">
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
      <div className="h-1" />
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
