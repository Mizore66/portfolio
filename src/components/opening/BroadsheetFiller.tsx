"use client";

import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";

export function BroadsheetFiller() {
  return (
    <aside
      data-testid="broadsheet-filler"
      className="mt-2 flex flex-col gap-6 border-t-2 border-ink pt-6"
      aria-label="Classifieds"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border-2 border-ink p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
            {BROADSHEET.errataKicker}
          </p>
          <p className="mt-2 font-display text-[13px] leading-snug italic text-ink">
            {BROADSHEET.errata}
          </p>
        </div>
        <div className="border-2 border-dashed border-ink p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
            {BROADSHEET.classifiedKicker}
          </p>
          <a
            href={`mailto:${resumeData.email}`}
            className="mt-2 block font-display text-[13px] leading-snug italic text-ink hover:text-score-red"
          >
            {BROADSHEET.classified}
          </a>
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
