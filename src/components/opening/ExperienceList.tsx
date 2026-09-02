import { companyAnchor } from "@/lib/anchors";
import { resumeData } from "@/lib/data";
import { POSITIONING, RETRIEVAL_SPLIT, YEAR_INDEX } from "@/lib/metrics";

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
      <p className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
        {POSITIONING.professionalDek}
      </p>
      <p className="mt-2 max-w-[68ch] font-mono text-[12px] leading-relaxed text-faded">
        {POSITIONING.deskNote}
      </p>
      <ol className="year-index" data-testid="year-index">
        {YEAR_INDEX.map((row) => (
          <li key={row.year}>
            <span className="year-index-year">{row.year}</span>
            <span>{row.desks.join(" · ")}</span>
          </li>
        ))}
      </ol>
      <div data-testid="career-trajectory">
        <ol className="desk-summaries mt-6">
          {POSITIONING.deskSummaries.map((row) => (
            <li key={row.desk}>
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
                {row.desk}
              </span>
              <span className="mt-1 block max-w-[68ch] font-display text-[16px] leading-snug text-ink">
                {row.line}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-[68ch] font-display text-[16px] italic text-ink">{POSITIONING.throughLine}</p>
      </div>
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
            {"scope" in job && job.scope ? (
              <p className="mt-2 max-w-[68ch] font-mono text-[12px] leading-relaxed text-faded">{job.scope}</p>
            ) : null}
            <ul className="mt-3 max-w-[68ch] space-y-2">
              {job.bullets.map((bullet) => (
                <li key={bullet} className="font-display text-[16px] leading-relaxed text-ink">
                  {bullet}
                </li>
              ))}
            </ul>
            {job.company === "Monash University" ? (
              <p className="mt-3 max-w-[68ch] font-mono text-[12px] leading-relaxed text-faded" data-testid="retrieval-split">
                {RETRIEVAL_SPLIT}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
