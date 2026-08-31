import { companyAnchor } from "@/lib/anchors";
import { resumeData } from "@/lib/data";
import { YEAR_INDEX } from "@/lib/metrics";

function yearsOf(period: string): string {
  const years = [...period.matchAll(/20\d{2}/g)].map((m) => m[0]);
  if (years.length === 0) return "";
  const first = years[0];
  const last = years[years.length - 1];
  return first === last ? first : `${first}–${last}`;
}

export function ExperienceList() {
  return (
    <section
      id="experience"
      data-testid="experience-list"
      className="recruiter-band"
      aria-labelledby="experience-heading"
    >
      <p className="band-kicker">Columns</p>
      <h2 id="experience-heading" className="band-title">
        Experience
      </h2>
      <ol className="year-index" data-testid="year-index">
        {YEAR_INDEX.map((row) => (
          <li key={row.year}>
            <span className="year-index-year">{row.year}</span>
            <span>{row.desks.join(" · ")}</span>
          </li>
        ))}
      </ol>
      <ol className="mt-8">
        {resumeData.experience.map((job) => (
          <li
            key={`${job.company}-${job.period}`}
            id={companyAnchor(job.company)}
            className="experience-row"
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
              {yearsOf(job.period)}
              {"type" in job && job.type ? ` · ${job.type}` : null}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-[18px] leading-snug text-ink">
                {job.company} — {job.title}
              </h3>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">{job.period}</p>
            </div>
            <p className="metric-row mt-2">{job.impact}</p>
            <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-relaxed text-ink">
              {job.bullets[0]}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
