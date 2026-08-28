"use client";

import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";

export function SituationsWanted() {
  return (
    <a
      data-testid="situations-wanted"
      href={`mailto:${resumeData.email}`}
      className="block border-2 border-dashed border-ink px-2 py-2 hover:bg-paper-deep"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.classifiedSticky}
      </p>
      <p className="mt-2 font-display text-[16px] leading-snug italic text-ink">
        {BROADSHEET.classified}
      </p>
      <p className="mt-2 font-mono text-[12px] text-faded">{BROADSHEET.availability}</p>
    </a>
  );
}
