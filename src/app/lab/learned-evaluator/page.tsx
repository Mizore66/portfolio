import type { Metadata } from "next";
import Link from "next/link";
import { EloCommitsChart } from "@/components/opening/EloCommitsChart";
import { EvaluationsColumn } from "@/components/opening/EvaluationsColumn";
import { BROADSHEET } from "@/content/opening";
import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `${LAB_ARTICLE.hed} — Lab · A. T. Qumhiyeh`,
  description: LAB_ARTICLE.meta,
  alternates: { canonical: LAB_ARTICLE.href },
  openGraph: {
    title: `${LAB_ARTICLE.hed} — Lab · A. T. Qumhiyeh`,
    description: LAB_ARTICLE.meta,
    url: `${SITE_URL}${LAB_ARTICLE.href}`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${LAB_ARTICLE.hed} — Lab · A. T. Qumhiyeh`,
    description: LAB_ARTICLE.meta,
  },
};

export default function LearnedEvaluatorPage() {
  return (
    <div className="min-h-screen text-ink">
      <a href="#article" className="skip-link">
        Skip to the article
      </a>
      <div className="relative z-[1] mx-auto max-w-2xl px-3 py-8 sm:px-5 sm:py-12">
        <main id="article">
          <article className="sheet px-6 py-8 sm:px-8 sm:py-10" aria-labelledby="lab-title">
            <header className="border-b-2 border-ink pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/#work"
                  className="exhibit-back font-mono text-[11px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
                >
                  ← {BROADSHEET.backToWork}
                </Link>
                <Link
                  href="/#lab"
                  className="font-mono text-[11px] uppercase tracking-widest text-faded underline decoration-2 underline-offset-4"
                >
                  {LAB_ARTICLE.kicker}
                </Link>
              </div>
              <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.28em] text-faded">
                {LAB_ARTICLE.kicker} · Gate C · {LAB_ARTICLE.resultGlyph}
              </p>
              <h1 id="lab-title" className="exhibit-title mt-2 font-display text-ink">
                {LAB_ARTICLE.hed}
              </h1>
              <p className="metric-row mt-4">{LAB_ARTICLE.result}</p>
              <p className="mt-1 font-mono text-[12px] text-faded">{LAB_ARTICLE.resultNote}</p>
              <p className="mt-4 font-display text-[18px] italic text-score-red">{LAB_ARTICLE.resultJoke}</p>
            </header>

            <section className="mt-8" aria-labelledby="lab-hypothesis">
              <h2 id="lab-hypothesis" className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                {LAB_ARTICLE.hypothesisHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-display text-[16px] leading-[1.65] text-ink">
                {LAB_ARTICLE.hypothesis}
              </p>
            </section>

            <section className="mt-8" aria-labelledby="lab-experiment">
              <h2 id="lab-experiment" className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                {LAB_ARTICLE.experimentHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-lora text-[16px] leading-[1.7] text-ink">
                {LAB_ARTICLE.experiment}
              </p>
            </section>

            <section className="mt-8" aria-labelledby="lab-result">
              <h2 id="lab-result" className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                {LAB_ARTICLE.resultHed}
              </h2>
              <p className="mt-3 font-mono text-[14px] leading-relaxed text-ink">{LAB_ARTICLE.resultLine}</p>
            </section>

            <section className="mt-8" aria-labelledby="lab-failed">
              <h2 id="lab-failed" className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                {LAB_ARTICLE.failedHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-lora text-[16px] leading-[1.7] text-ink">
                {LAB_ARTICLE.failed}
              </p>
            </section>

            <section className="mt-8" aria-labelledby="lab-learned">
              <h2 id="lab-learned" className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                {LAB_ARTICLE.learnedHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-display text-[16px] italic leading-snug text-ink">
                {LAB_ARTICLE.learned}
              </p>
            </section>

            <div className="mt-10 flex flex-col gap-8">
              <EvaluationsColumn />
              <EloCommitsChart />
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
