"use client";

import { useState } from "react";
import { EvaluationsColumn } from "@/components/opening/EvaluationsColumn";
import { EloCommitsChart } from "@/components/opening/EloCommitsChart";
import { Colophon } from "@/components/opening/Colophon";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { PHASE2_EXHIBITS } from "@/lib/chess/phase2";

export function BroadsheetFiller() {
  const [weather, setWeather] = useState(0);
  const [pressed, setPressed] = useState(false);
  const forecast = BROADSHEET.weatherCycle[weather] ?? BROADSHEET.weather;

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
          <p className="mt-2 font-mono text-[10px] text-faded">{BROADSHEET.availability}</p>
        </div>
      </div>
      {PHASE2_EXHIBITS ? (
        <>
          <EvaluationsColumn />
          <EloCommitsChart />
        </>
      ) : null}
      <Colophon />
      <div className="flex items-end justify-between gap-4">
        <button
          type="button"
          data-testid="weather-cycle"
          onClick={() => setWeather((n) => (n + 1) % BROADSHEET.weatherCycle.length)}
          className="text-left font-mono text-[10px] uppercase tracking-[0.22em] text-faded hover:text-ink"
        >
          {BROADSHEET.weatherKicker}
          <span className="mx-2 text-ink">·</span>
          <span className="text-ink">{forecast}</span>
        </button>
        <button
          type="button"
          data-testid="press-stamp"
          aria-pressed={pressed}
          onClick={() => setPressed(true)}
          className="border-2 border-ink px-2 py-1 font-display text-[11px] italic text-score-red"
        >
          {pressed ? BROADSHEET.pressMark : BROADSHEET.stamp}
        </button>
      </div>
    </aside>
  );
}
