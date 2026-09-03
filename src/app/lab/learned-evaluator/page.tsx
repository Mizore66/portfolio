import type { Metadata } from "next";
import Link from "next/link";
import { EloCommitsChart } from "@/components/opening/EloCommitsChart";
import { EvaluationsColumn } from "@/components/opening/EvaluationsColumn";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { BROADSHEET } from "@/content/opening";
import { overlayLab } from "@/lib/cms/lab-copy";
import { getPublishedDocument, getRenderableDocument } from "@/lib/cms/store";
import { labArticleJsonLd } from "@/lib/person";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const article = overlayLab(await getPublishedDocument());
  return {
    title: `${article.hed} — Lab · A. T. Qumhiyeh`,
    description: article.meta,
    alternates: { canonical: article.href },
    openGraph: {
      title: `${article.hed} — Lab · A. T. Qumhiyeh`,
      description: article.meta,
      url: `${SITE_URL}${article.href}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.hed} — Lab · A. T. Qumhiyeh`,
      description: article.meta,
    },
  };
}

export default async function LearnedEvaluatorPage() {
  const article = overlayLab(await getRenderableDocument());
  return (
    <div className="min-h-screen text-ink">
      <a href="#article" className="skip-link">
        Skip to the article
      </a>
      <div className="relative z-[1] mx-auto max-w-2xl px-3 py-8 sm:px-5 sm:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(labArticleJsonLd(article)) }}
        />
        <div className="sheet mb-4">
          <RecruiterNav />
        </div>
        <main id="article">
          <article className="sheet px-6 py-8 sm:px-8 sm:py-10" aria-labelledby="lab-title">
            <header className="border-b-2 border-ink pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/#work"
                  className="exhibit-back font-mono text-[12px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
                >
                  ← {BROADSHEET.backToWork}
                </Link>
                <Link
                  href="/#lab"
                  className="font-mono text-[12px] uppercase tracking-widest text-faded underline decoration-2 underline-offset-4"
                >
                  {article.kicker}
                </Link>
              </div>
              <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.28em] text-faded">
                {article.kicker} · Gate C · {article.resultGlyph}
              </p>
              <p className="mt-2 font-mono text-[12px] text-faded">{article.filed}</p>
              <p className="mt-1 font-mono text-[12px] text-faded" data-testid="lab-dates">
                Published {article.datePublished}
              </p>
              <h1 id="lab-title" className="exhibit-title mt-2 font-display text-ink">
                {article.hed}
              </h1>
              <p className="mt-3 max-w-[68ch] font-display text-[18px] leading-snug text-ink">{article.dek}</p>
              <p className="metric-row mt-4">{article.result}</p>
              <p className="mt-1 font-mono text-[12px] text-faded">{article.resultNote}</p>
              <p className="mt-4 font-display text-[18px] italic text-score-red">{article.resultJoke}</p>
            </header>

            <section id="hypothesis" className="mt-8" aria-labelledby="lab-hypothesis">
              <p className="band-kicker">{article.hypothesisKicker}</p>
              <h2 id="lab-hypothesis" className="band-title">
                {article.hypothesisHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-display text-[16px] leading-[1.65] text-ink">
                {article.hypothesis}
              </p>
            </section>

            <section id="experiment" className="mt-8" aria-labelledby="lab-experiment">
              <p className="band-kicker">{article.experimentKicker}</p>
              <h2 id="lab-experiment" className="band-title">
                {article.experimentHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-lora text-[16px] leading-[1.7] text-ink">
                {article.experiment}
              </p>
            </section>

            <section id="result" className="mt-8" aria-labelledby="lab-result">
              <p className="band-kicker">{article.resultKicker}</p>
              <h2 id="lab-result" className="band-title">
                {article.resultHed}
              </h2>
              <p className="mt-3 font-mono text-[14px] leading-relaxed text-ink">{article.resultLine}</p>
            </section>

            <section id="failed" className="mt-8" aria-labelledby="lab-failed">
              <p className="band-kicker">{article.failedKicker}</p>
              <h2 id="lab-failed" className="band-title">
                {article.failedHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-lora text-[16px] leading-[1.7] text-ink">
                {article.failed}
              </p>
            </section>

            <section id="learned" className="mt-8" aria-labelledby="lab-learned">
              <p className="band-kicker">{article.learnedKicker}</p>
              <h2 id="lab-learned" className="band-title">
                {article.learnedHed}
              </h2>
              <p className="mt-3 max-w-[68ch] font-display text-[16px] italic leading-snug text-ink">
                {article.learned}
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
