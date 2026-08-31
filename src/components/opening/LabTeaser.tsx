import Link from "next/link";
import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { METRICS } from "@/lib/metrics";

export function LabTeaser() {
  return (
    <Link
      href={LAB_ARTICLE.href}
      data-testid="lab-teaser"
      className="lab-teaser mt-8 block border-2 border-ink p-4 text-ink no-underline"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
        {LAB_ARTICLE.kicker}
        <span className="ml-2 text-score-red">{LAB_ARTICLE.resultGlyph}</span>
      </p>
      <p className="mt-2 font-display text-[22px] leading-tight text-ink">{LAB_ARTICLE.teaser}</p>
      <p className="metric-row mt-3">{METRICS.gateC.display}</p>
      <p className="mt-1 font-mono text-[12px] text-faded">{METRICS.gateC.note}</p>
    </Link>
  );
}
