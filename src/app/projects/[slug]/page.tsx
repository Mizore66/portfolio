import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { PatentFigure } from "@/components/opening/PatentFigure";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return resumeData.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = resumeData.projects.find((p) => p.slug === slug);
  if (!project) return { title: "Correction — A. T. Qumhiyeh" };
  const title = `${project.name} — Exhibit · A. T. Qumhiyeh`;
  const description = project.meta;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/projects/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = resumeData.projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen text-ink">
      <a href="#exhibit" className="skip-link">
        {BROADSHEET.skipExhibit}
      </a>
      <div className="relative z-[1] mx-auto max-w-2xl px-3 py-8 sm:px-5 sm:py-12">
        <main id="exhibit">
          <article className="exhibit-clip sheet" aria-labelledby="exhibit-title">
            <header className="border-b-2 border-ink px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/#work"
                  className="exhibit-back font-mono text-[11px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
                >
                  ← {BROADSHEET.backToWork}
                </Link>
                <span className="font-mono text-[11px] text-faded">{project.date}</span>
              </div>
              <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.28em] text-faded">
                Clipping · Exhibit · {project.subtitle}
              </p>
            </header>

            <div className="sheet-fade px-6 py-10">
              <section aria-labelledby="exhibit-title">
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-faded">
                  Pasted from the desk
                </p>
                <h1 id="exhibit-title" className="exhibit-title mt-2 font-display text-ink">
                  {project.name}
                </h1>
                <p className="mt-2 font-display text-[16px] leading-snug text-faded">{project.subtitle}</p>
                <p className="metric-row mt-4">{project.impact}</p>
                {"evidenceNote" in project && project.evidenceNote ? (
                  <p className="mt-1 font-mono text-[12px] text-faded">{project.evidenceNote}</p>
                ) : null}
                <p className="mt-4 max-w-[68ch] font-display text-[16px] leading-[1.65] text-ink">
                  {project.purpose}
                </p>
                <p className="mt-4 drop-cap max-w-[68ch] font-lora text-[16px] leading-[1.7] italic text-faded">
                  {project.description}
                </p>
              </section>

              <section className="mt-8" aria-label="File photo">
                <HalftonePlate
                  src={project.plate}
                  caption={project.plateCaption}
                  alt={project.plateAlt}
                  sizes={IMAGE_SIZES.exhibitPlate}
                  priority
                />
              </section>

              <section className="mt-8" aria-label="Architecture">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                  Architecture
                </h2>
                <div className="mt-3">
                  <PatentFigure spec={project.patent} />
                </div>
              </section>

              <section className="mt-10" aria-labelledby="exhibit-line">
                <h2
                  id="exhibit-line"
                  className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                >
                  The line
                </h2>
                <ol className="mt-3 space-y-3">
                  {project.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-[11px] text-score-red">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-display text-[16px] leading-relaxed">{bullet}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="mt-10" aria-labelledby="exhibit-tech">
                <h2
                  id="exhibit-tech"
                  className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                >
                  Tech
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <li
                      key={t}
                      className="border-2 border-ink px-2 py-0.5 font-mono text-[11px] text-book-blue"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </section>

              <nav className="mt-10 flex flex-wrap gap-4" aria-label="Exhibit links">
                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-mark exhibit-repo border-2 border-ink bg-book-blue px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-paper"
                  >
                    View {project.name} source
                  </a>
                ) : null}
                <Link
                  href="/#work"
                  className="exhibit-back border-2 border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink"
                >
                  ← {BROADSHEET.backToWork}
                </Link>
              </nav>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
