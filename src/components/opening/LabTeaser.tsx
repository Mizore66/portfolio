import Link from "next/link";
import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { resumeData } from "@/lib/data";
import { LAB_PROJECT_SLUGS, METRICS } from "@/lib/metrics";

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
      <p className="mt-3 font-display text-[16px] italic text-score-red">{LAB_ARTICLE.resultJoke}</p>
    </Link>
  );
}

export function LabFilings() {
  const filings = LAB_PROJECT_SLUGS.map((slug) => resumeData.projects.find((p) => p.slug === slug)!);
  return (
    <p className="mt-6 font-mono text-[12px] leading-relaxed text-faded" data-testid="lab-filings">
      Also on the analysis board:{" "}
      {filings.map((p, i) => (
        <span key={p.slug}>
          {i > 0 ? " · " : null}
          <Link href={`/projects/${p.slug}`} className="text-book-blue underline decoration-2 underline-offset-4">
            {p.name} — {p.subtitle}
          </Link>
        </span>
      ))}
    </p>
  );
}
