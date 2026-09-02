import { resumeData } from "@/lib/data";

export function EducationBand() {
  const edu = resumeData.education;
  return (
    <section
      id="education"
      data-testid="education-band"
      className="recruiter-band"
      aria-labelledby="education-heading"
    >
      <p className="band-kicker">Education</p>
      <h2 id="education-heading" className="band-title">
        {edu.school}
      </h2>
      <p className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug text-ink">{edu.degree}</p>
      <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">
        {edu.honours} · Graduated {edu.graduation} · WAM {edu.wam} · CGPA {edu.cgpa}
      </p>
      <p className="mt-1 font-mono text-[12px] text-faded">{edu.location}</p>
    </section>
  );
}
