"use client";

import { useState } from "react";
import { EvaluationsColumn } from "@/components/opening/EvaluationsColumn";
import { EloCommitsChart } from "@/components/opening/EloCommitsChart";
import { SituationsWanted } from "@/components/opening/SituationsWanted";
import { BROADSHEET } from "@/content/opening";
import { PHASE2_EXHIBITS } from "@/lib/chess/phase2";

export function BroadsheetFiller() {
  const [weather, setWeather] = useState(0);
  const [pressed, setPressed] = useState(false);
  const forecast = BROADSHEET.weatherCycle[weather] ?? BROADSHEET.weather;

  return (
    <aside
      data-testid="broadsheet-filler"
      className="mt-8 flex flex-col gap-8 border-t-2 border-ink pt-8"
      aria-label="Classifieds"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
            {BROADSHEET.errataKicker}
          </p>
          <p className="mt-2 font-display text-[16px] leading-snug italic text-ink">
            {BROADSHEET.errata}
          </p>
        </div>
        <SituationsWanted />
      </div>
      {PHASE2_EXHIBITS ? (
        <>
          <EvaluationsColumn />
          <EloCommitsChart />
        </>
      ) : null}
      <div className="flex items-end justify-between gap-4">
        <button
          type="button"
          data-testid="weather-cycle"
          onClick={() => setWeather((n) => (n + 1) % BROADSHEET.weatherCycle.length)}
          className="hit-target move-tint text-left font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
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
          className="hit-target border-2 border-ink px-3 font-display text-[12px] italic text-score-red"
        >
          {pressed ? BROADSHEET.pressMark : BROADSHEET.stamp}
        </button>
      </div>
    </aside>
  );
}
