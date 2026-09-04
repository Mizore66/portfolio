import type { Metadata } from "next";
import Link from "next/link";
import { Colophon } from "@/components/opening/Colophon";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { overlayArticle } from "@/lib/cms/articles";
import { getRenderableDocument } from "@/lib/cms/store";
import { BROADSHEET } from "@/content/opening";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "How this paper was set — A. T. Qumhiyeh",
  description:
    "Type, ink, witnesses, and the generator's receipt for Opening Preparation. Chess is content, never a lock.",
  alternates: { canonical: BROADSHEET.colophonHref },
  openGraph: {
    title: "How this paper was set — A. T. Qumhiyeh",
    description:
      "Type, ink, witnesses, and the generator's receipt for Opening Preparation.",
    url: `${SITE_URL}${BROADSHEET.colophonHref}`,
  },
};

export default async function ColophonPage() {
  const article = overlayArticle("colophon", await getRenderableDocument());
  return (
    <div className="min-h-screen text-ink">
      <a href="#colophon-heading" className="skip-link">
        Skip to how this paper was set
      </a>
      <div className="relative z-[1] mx-auto max-w-2xl px-3 py-8 sm:px-5 sm:py-12">
        <div className="sheet mb-4">
          <RecruiterNav />
        </div>
        <main>
          <article className="sheet px-6 py-10" aria-labelledby="colophon-heading">
            <h1 id="colophon-heading" className="sr-only">
              {article.kicker}
            </h1>
            <Colophon article={article} />
            <p className="mt-8">
              <Link
                href="/"
                className="exhibit-back font-mono text-[12px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
              >
                ← {BROADSHEET.homeLink}
              </Link>
            </p>
          </article>
        </main>
      </div>
    </div>
  );
}
