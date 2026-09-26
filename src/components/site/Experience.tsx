import { OVERLAP_NOTE } from "@/content/site/roles";
import type { Role } from "@/content/site/types";
import { sectionNotation } from "@/content/site/sections";
import { RoleEntry } from "./RoleEntry";
import { SectionTitle } from "./SectionTitle";

export function Experience({ roles }: { roles: readonly Role[] }) {
  const current = roles.filter((r) => !r.earlier);
  const earlier = roles.filter((r) => r.earlier);
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <SectionTitle id="experience-title" {...sectionNotation("experience")}>
        Experience
      </SectionTitle>
      {current.map((r) => (
        <RoleEntry key={r.id} role={r} />
      ))}
      <div className="margin-row">
        <h3 className="earlier-heading">Earlier experience</h3>
        {/* Commentary beside the moves it is about, as a games book prints it (brief §4). */}
        <p className="note margin-note" data-fx="margin">
          {OVERLAP_NOTE}
        </p>
      </div>
      {earlier.map((r) => (
        <RoleEntry key={r.id} role={r} />
      ))}
    </section>
  );
}
