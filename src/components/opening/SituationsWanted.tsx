"use client";

import { BROADSHEET } from "@/content/opening";

export function SituationsWanted() {
  return (
    <div data-testid="situations-wanted" className="border-2 border-dashed border-ink px-4 py-4">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.classifiedKicker}
      </p>
      <p className="mt-2 font-display text-[16px] leading-snug italic text-ink">{BROADSHEET.classified}</p>
    </div>
  );
}
