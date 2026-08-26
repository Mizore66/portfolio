"use client";

import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";

export function BroadsheetFiller() {
  return (
    <aside
      data-testid="broadsheet-filler"
      className="mt-6 flex flex-1 flex-col justify-end gap-6 border-t-2 border-ink pt-6"
      aria-label="Classifieds"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border-2 border-ink p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
            {BROADSHEET.correspondenceKicker}
          </p>
          <a
            href={`mailto:${resumeData.email}`}
            className="mt-2 block font-mono text-[12px] text-book-blue underline decoration-1 underline-offset-4 hover:text-score-red"
          >
            {BROADSHEET.correspondence}
          </a>
        </div>
        <div className="border-2 border-dashed border-ink p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
            {BROADSHEET.classifiedKicker}
          </p>
          <p className="mt-2 font-display text-[13px] leading-snug italic text-ink">
            {BROADSHEET.classified}
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
          {BROADSHEET.weatherKicker}
          <span className="mx-2 text-ink">·</span>
          <span className="text-ink">{BROADSHEET.weather}</span>
        </p>
        <span
          className="border-2 border-ink px-2 py-1 font-display text-[11px] italic text-score-red"
          aria-hidden
        >
          {BROADSHEET.stamp}
        </span>
      </div>
    </aside>
  );
}
