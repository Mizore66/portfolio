import Link from "next/link";
import { BROADSHEET } from "@/content/opening";

export default function NotFound() {
  return (
    <div className="min-h-screen text-ink">
      <div className="relative z-[1] mx-auto max-w-xl px-3 py-16 sm:px-5">
        <main>
          <article className="sheet px-6 py-10" data-testid="correction" aria-labelledby="correction-hed">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
              {BROADSHEET.correctionKicker}
            </p>
            <h1
              id="correction-hed"
              className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight text-score-red"
            >
              {BROADSHEET.correctionHed}
            </h1>
            <p className="mt-4 font-lora text-[16px] italic leading-relaxed text-ink">
              {BROADSHEET.correctionDek}
            </p>
            <p className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/"
                className="font-mono text-[11px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4 exhibit-back"
              >
                ← {BROADSHEET.homeLink}
              </Link>
              <Link
                href={BROADSHEET.printHref}
                className="font-mono text-[11px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
              >
                {BROADSHEET.resumeLabel}
              </Link>
              <Link
                href="/#contact"
                className="font-mono text-[11px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
              >
                Contact
              </Link>
            </p>
          </article>
        </main>
      </div>
    </div>
  );
}
