"use client";

import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";

export function Masthead() {
  const year = new Date().getFullYear();

  return (
    <header>
      <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
          C50 · Italian Game · Vol. {year} · Moves are facts · Annotations are voice
        </p>
      </div>
      <div className="border-b-2 border-ink px-4 py-5 sm:px-6">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.15rem,6.4vw,4.5rem)] leading-[0.95] tracking-tight text-ink">
            Anas T. Qumhiyeh
          </h1>
          <p data-testid="masthead-role" className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-book-blue">
            {BROADSHEET.dek}
          </p>
          <p className="mt-2 font-display text-xl italic text-faded sm:text-2xl">
            Opening Preparation
          </p>
          <p className="mt-3 max-w-3xl font-mono text-[11px] text-faded">
            <a
              className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red"
              href={`mailto:${resumeData.email}`}
            >
              {resumeData.email}
            </a>
            <span className="mx-2 text-ink">·</span>
            <a
              className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red"
              href={`https://${resumeData.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span className="mx-2 text-ink">·</span>
            <a
              className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red"
              href={`https://${resumeData.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <span className="mx-2 text-ink">·</span>
            <a
              className="text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red"
              href={BROADSHEET.printHref}
            >
              {BROADSHEET.printEdition}
            </a>
            <span className="mx-2 hidden text-ink sm:inline">·</span>
            <span className="hidden sm:inline">Click any move · ← → steps the mainline</span>
          </p>
        </div>
      </div>
    </header>
  );
}
