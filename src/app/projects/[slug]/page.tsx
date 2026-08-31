import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApparatusSchematic } from "@/components/opening/ApparatusSchematic";
import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { PatentFigure } from "@/components/opening/PatentFigure";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { projectOrigin, type EvidenceKind } from "@/lib/metrics";
import { projectJsonLd } from "@/lib/person";
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
  const title = `${project.name} — ${project.subtitle} · A. T. Qumhiyeh`;
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

  const evidenceNote = "evidenceNote" in project ? project.evidenceNote : undefined;
  const evidenceKind =
    "evidenceKind" in project ? (project.evidenceKind as EvidenceKind) : undefined;
  const judgment = "judgment" in project ? project.judgment : undefined;
  const contextLabel = "contextLabel" in project ? project.contextLabel : undefined;
  const inspectNote = "inspectNote" in project ? project.inspectNote : undefined;
  const why = "why" in project ? project.why : undefined;
  const origin = projectOrigin({
    slug: project.slug,
    contextLabel,
  });
  const decisions = [
    ...project.apparatus.path,
    ...(project.apparatus.forks ?? []),
    ...(project.apparatus.beside ?? []),
  ];

  return (
    <div className="min-h-screen text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }}
      />
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
                  {project.name} — {project.subtitle}
                </h1>
                <dl className="exhibit-rail mt-4" data-testid="exhibit-rail">
                  <div>
                    <dt>Filed</dt>
                    <dd>{project.date}</dd>
                  </div>
                  <div>
                    <dt>Origin</dt>
                    <dd>{origin}</dd>
                  </div>
                  {contextLabel ? (
                    <div>
                      <dt>Context</dt>
                      <dd>{contextLabel}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Source</dt>
                    <dd>{project.github ? "Public repository" : "On this domain"}</dd>
                  </div>
                </dl>
                <section id="measurement" className="mt-6" aria-labelledby="exhibit-measurement">
                  <h2
                    id="exhibit-measurement"
                    className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                  >
                    The measurement
                  </h2>
                  <p className="metric-row mt-2">{project.impact}</p>
                  <EvidenceMeta note={evidenceNote} kind={evidenceKind} />
                </section>
                <section id="problem" className="mt-6" aria-labelledby="exhibit-problem">
                  <h2
                    id="exhibit-problem"
                    className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                  >
                    The problem
                  </h2>
                  <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-[1.65] text-ink">
                    {project.purpose}
                  </p>
                  {why ? (
                    <p className="mt-3 max-w-[68ch] font-display text-[16px] leading-snug text-ink">{why}</p>
                  ) : null}
                </section>
                {judgment ? (
                  <section id="decision" className="mt-6" aria-labelledby="exhibit-decision">
                    <h2
                      id="exhibit-decision"
                      className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                    >
                      The decision
                    </h2>
                    <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug text-ink">
                      {judgment}
                    </p>
                  </section>
                ) : null}
                <p className="mt-4 drop-cap max-w-[68ch] font-lora text-[16px] leading-[1.7] italic text-faded">
                  {project.description}
                </p>
              </section>

              <section className="mt-8" aria-label="File photo">
                <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
                  Decoration · file photo
                </p>
                <div className="mt-3">
                  <HalftonePlate
                    src={project.plate}
                    caption={project.plateCaption}
                    alt={project.plateAlt}
                    sizes={IMAGE_SIZES.exhibitPlate}
                    priority
                  />
                </div>
              </section>

              <section id="apparatus" className="mt-8" aria-labelledby="exhibit-apparatus">
                <h2
                  id="exhibit-apparatus"
                  className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                >
                  Proof · apparatus
                </h2>
                <div className="mt-3">
                  <ApparatusSchematic apparatus={project.apparatus} />
                </div>
                <div className="mt-4">
                  <PatentFigure spec={project.patent} />
                </div>
              </section>

              <section id="line" className="mt-10" aria-labelledby="exhibit-line">
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

              <section id="decisions" className="mt-10" aria-labelledby="exhibit-tech">
                <h2
                  id="exhibit-tech"
                  className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded"
                >
                  Decisions
                </h2>
                <ul className="mt-3 space-y-2">
                  {decisions.map((layer) => (
                    <li key={`${layer.role}-${layer.name}`} className="font-display text-[16px] leading-snug">
                      <span className="text-faded">{layer.role}:</span> {layer.name}
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
                {inspectNote ? (
                  <p className="w-full font-mono text-[12px] leading-relaxed text-faded">{inspectNote}</p>
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
