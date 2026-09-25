import { EDUCATION } from "@/content/site/education";
import { formatMonth } from "@/content/site/format";

export function Education() {
  const e = EDUCATION;
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <p className="kicker">Education</p>
      <h2 id="education-title">{e.institution}</h2>
      <p>
        {e.degree}, {e.minor}
      </p>
      <p>
        {e.honours.join(" · ")} · Graduated {formatMonth(e.graduated)} · WAM {e.wam} · CGPA {e.cgpa}
      </p>
      <p className="note">{e.location}</p>
    </section>
  );
}
