import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApparatusSchematic } from "@/components/opening/ApparatusSchematic";
import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { ExhibitNav } from "@/components/opening/ExhibitNav";
import { ExhibitSection } from "@/components/opening/ExhibitSection";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { PatentFigure } from "@/components/opening/PatentFigure";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import {
  exhibitKicker,
  exhibitTitle,
  projectEvidence,
  projectOrigin,
  projectRole,
  projectSourceLabel,
  type EvidenceKind,
} from "@/lib/metrics";
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
  const title = `${exhibitTitle(project)} · A. T. Qumhiyeh`;
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
  const constraint = "constraint" in project ? project.constraint : undefined;
  const limitation = "limitation" in project ? project.limitation : undefined;
  const split = "split" in project ? project.split : undefined;
  const origin = projectOrigin({
    slug: project.slug,
    contextLabel,
  });
  const role = projectRole({
    slug: project.slug,
    contextLabel,
  });
  const evidence = projectEvidence(project);
  const kicker = exhibitKicker(origin);

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
        <div className="sheet mb-4">
          <RecruiterNav />
        </div>
        <main id="exhibit">
          <article className="exhibit-clip sheet" aria-labelledby="exhibit-title">
            <header className="border-b-2 border-ink px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/#work"
                  className="exhibit-back font-mono text-[12px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
                >
                  ← {BROADSHEET.backToWork}
                </Link>
                <span className="font-mono text-[12px] text-faded">{project.date}</span>
              </div>
              <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.28em] text-faded">
                {kicker} · {project.date}
              </p>
            </header>

            <div className="sheet-fade px-6 py-10">
              <section aria-labelledby="exhibit-title">
                <h1 id="exhibit-title" className="exhibit-title font-display text-ink">
                  {exhibitTitle(project)}
                </h1>
                <p
                  data-testid="exhibit-lede"
                  className="mt-3 max-w-[68ch] font-display text-[18px] leading-snug text-ink"
                >
                  {project.purpose}
                </p>
                <dl className="exhibit-rail mt-4" data-testid="exhibit-rail">
                  <div>
                    <dt>Filed</dt>
                    <dd>{project.date}</dd>
                  </div>
                  <div>
                    <dt>My role</dt>
                    <dd>{role}</dd>
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
                    <dd>{projectSourceLabel(project.github)}</dd>
                  </div>
                </dl>
                <ExhibitSection id="measurement" title="Evidence">
                <dl className="exhibit-rail mt-3" data-testid="evidence-card">
                  <div>
                    <dt>Result</dt>
                    <dd>{evidence.result}</dd>
                  </div>
                  {evidence.capability ? (
                    <div>
                      <dt>Capability</dt>
                      <dd>{evidence.capability}</dd>
                    </div>
                  ) : null}
                  {evidenceKind ? (
                    <div>
                      <dt>Kind</dt>
                      <dd>
                        <EvidenceMeta note={evidenceNote} kind={evidenceKind} />
                      </dd>
                    </div>
                  ) : (
                    <div>
                      <dt>Kind</dt>
                      <dd>Capability as filed — not a numbered experiment</dd>
                    </div>
                  )}
                  {evidence.baseline ? (
                    <div>
                      <dt>Baseline</dt>
                      <dd>{evidence.baseline}</dd>
                    </div>
                  ) : null}
                  {evidence.environment ? (
                    <div>
                      <dt>Environment</dt>
                      <dd>{evidence.environment}</dd>
                    </div>
                  ) : null}
                  {evidence.sample ? (
                    <div>
                      <dt>Sample</dt>
                      <dd>{evidence.sample}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Date</dt>
                    <dd>{project.date}</dd>
                  </div>
                </dl>
                </ExhibitSection>
                {split ? (
                  <p className="mt-4 max-w-[68ch] font-mono text-[12px] leading-relaxed text-faded" data-testid="retrieval-split">
                    {split}
                  </p>
                ) : null}
                {why ? (
                  <ExhibitSection id="problem" title="The problem">
                    <p
                      data-testid="exhibit-why"
                      className="mt-2 max-w-[68ch] font-display text-[16px] leading-[1.65] text-ink"
                    >
                      {why}
                    </p>
                  </ExhibitSection>
                ) : null}
                {judgment ? (
                  <ExhibitSection id="decision" title="The decision">
                    <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug text-ink">
                      {judgment}
                    </p>
                  </ExhibitSection>
                ) : null}
                {constraint ? (
                  <ExhibitSection id="constraint" title="Constraint">
                    <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug text-ink">{constraint}</p>
                  </ExhibitSection>
                ) : null}
                <p className="mt-4 max-w-[68ch] font-lora text-[16px] leading-[1.7] italic text-faded">
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

              <ExhibitSection id="apparatus" title="Proof · apparatus">
                <div className="mt-3">
                  <ApparatusSchematic apparatus={project.apparatus} />
                </div>
                <div className="mt-4">
                  <PatentFigure spec={project.patent} />
                </div>
              </ExhibitSection>

              <ExhibitSection id="line" title="The line">
                <ol className="mt-3 space-y-3">
                  {project.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-mono text-[12px] text-score-red">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-display text-[16px] leading-relaxed">{bullet}</p>
                    </li>
                  ))}
                </ol>
              </ExhibitSection>

              {limitation ? (
                <ExhibitSection id="limitations" title="Limitations">
                  <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug text-ink">{limitation}</p>
                </ExhibitSection>
              ) : null}

              <nav className="mt-10 flex flex-wrap gap-4" aria-label="Exhibit links">
                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-mark exhibit-repo border-2 border-ink bg-book-blue px-4 py-2 font-mono text-[12px] uppercase tracking-widest text-paper"
                  >
                    View {project.name} source
                  </a>
                ) : null}
                {inspectNote ? (
                  <p className="w-full font-mono text-[12px] leading-relaxed text-faded">{inspectNote}</p>
                ) : null}
                <p
                  className="w-full font-mono text-[12px] leading-relaxed text-faded"
                  data-testid="exhibit-host"
                >
                  {BROADSHEET.exhibitHost}
                  {project.github ? ` ${BROADSHEET.exhibitGithub}` : null}
                </p>
                <Link
                  href="/#work"
                  className="exhibit-back border-2 border-ink px-4 py-2 font-mono text-[12px] uppercase tracking-widest text-ink"
                >
                  ← {BROADSHEET.backToWork}
                </Link>
              </nav>
              <div className="mt-8 border-t border-ink pt-6">
                <ExhibitNav slug={project.slug} />
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
