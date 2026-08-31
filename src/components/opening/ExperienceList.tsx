import { resumeData } from "@/lib/data";

export function ExperienceList() {
  return (
    <section
      id="experience"
      data-testid="experience-list"
      className="recruiter-band"
      aria-labelledby="experience-heading"
    >
      <p className="band-kicker">Experience</p>
      <h2 id="experience-heading" className="band-title">
        Roles, in order
      </h2>
      <ol className="mt-6">
        {resumeData.experience.map((job) => (
          <li key={`${job.company}-${job.period}`} className="experience-row">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
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
