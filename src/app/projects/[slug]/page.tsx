import Link from "next/link";
import { notFound } from "next/navigation";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { resumeData } from "@/lib/data";

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
      <div className="relative z-[1] mx-auto max-w-2xl px-3 py-8 sm:px-5 sm:py-12">
        <article className="exhibit-clip sheet">
          <header className="border-b-2 border-ink px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                className="font-mono text-[11px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4 hover:text-score-red"
              >
                ← Opening Preparation
              </Link>
              <span className="font-mono text-[11px] text-faded">{project.date}</span>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
              Clipping · Exhibit · {project.subtitle}
            </p>
          </header>

          <div className="sheet-fade px-6 py-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-faded">
              Pasted from the desk
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink">{project.name}</h1>
            <p className="mt-4 font-lora text-lg leading-relaxed italic text-ink">
              {project.description}
            </p>

            <div className="mt-8">
              <HalftonePlate
                src={project.plate}
                caption={project.plateCaption}
                alt={project.name}
              />
            </div>

            <section className="mt-10">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
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

            <section className="mt-10">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
                The line
              </h2>
              <ol className="mt-3 space-y-3">
                {project.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-[11px] text-score-red">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-display text-[15px] leading-relaxed">{bullet}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-10 border-2 border-ink p-4 newsprint-deep">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
                Measurable impact
              </p>
              <p className="mt-1 font-display text-xl text-score-red">{project.impact}</p>
            </section>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-ink bg-book-blue px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-paper hover:bg-ink"
              >
                Repository
              </a>
              <Link
                href="/"
                className="border-2 border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink hover:bg-paper-deep"
              >
                Back to the scoresheet
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
