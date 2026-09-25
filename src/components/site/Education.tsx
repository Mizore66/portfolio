import { EDUCATION } from "@/content/site/education";
import { formatMonth } from "@/content/site/format";

export function Education() {
  const e = EDUCATION;
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <h2 id="education-title">Education</h2>
      <h3 className="education-institution">{e.institution}</h3>
      <p>
        {e.degree}, {e.minor}
      </p>
      <p>{e.honours.join(", ")}</p>
      <dl className="facts">
        <div>
          <dt>Graduated</dt>
          <dd>{formatMonth(e.graduated)}</dd>
        </div>
        <div>
          <dt>WAM</dt>
          <dd>{e.wam}</dd>
        </div>
        <div>
          <dt>CGPA</dt>
          <dd>{e.cgpa}</dd>
        </div>
      </dl>
      <p className="note">{e.location}</p>
    </section>
  );
}
