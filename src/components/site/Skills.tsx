import { SKILLS } from "@/content/site/skills";

export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <p className="kicker">Stack</p>
      <h2 id="skills-title">Skills</h2>
      <dl className="skills">
        {SKILLS.map((g) => (
          <div key={g.label}>
            <dt>{g.label}</dt>
            <dd>{g.items.join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
