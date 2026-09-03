import Link from "next/link";
import { overlayLab } from "@/lib/cms/lab-copy";
import { getRenderableDocument } from "@/lib/cms/store";
import { resumeData } from "@/lib/data";
import { LAB_PROJECT_SLUGS, METRICS, exhibitTitle } from "@/lib/metrics";

export async function LabTeaser() {
  const article = overlayLab(await getRenderableDocument());
  return (
    <Link
      href={article.href}
      data-testid="lab-teaser"
      className="lab-teaser mt-8 block p-6 text-ink no-underline sm:p-8"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
        {article.kicker}
        <span className="ml-2 text-score-red">{article.resultGlyph}</span>
      </p>
      <p className="mt-2 font-display text-[22px] leading-tight text-ink">{article.teaser}</p>
      <p className="metric-row mt-3">{METRICS.gateC.display}</p>
      <p className="mt-1 font-mono text-[12px] text-faded">{METRICS.gateC.note}</p>
      <p className="mt-3 font-display text-[16px] italic text-score-red">{article.resultJoke}</p>
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
          <Link href={`/projects/${p.slug}`} className="lab-filing-link text-book-blue underline decoration-2 underline-offset-4">
            {exhibitTitle(p)}
          </Link>
        </span>
      ))}
    </p>
  );
}
