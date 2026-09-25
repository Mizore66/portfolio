import { OVERLAP_NOTE } from "@/content/site/roles";
import type { Role } from "@/content/site/types";
import { RoleEntry } from "./RoleEntry";

export function Experience({ roles }: { roles: readonly Role[] }) {
  const current = roles.filter((r) => !r.earlier);
  const earlier = roles.filter((r) => r.earlier);
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <p className="kicker">Experience</p>
      <h2 id="experience-title">Where I&apos;ve worked</h2>
      {current.map((r) => (
        <RoleEntry key={r.id} role={r} />
      ))}
      <h3 className="earlier-heading">Earlier experience</h3>
      {earlier.map((r) => (
        <RoleEntry key={r.id} role={r} />
      ))}
      <p className="note">{OVERLAP_NOTE}</p>
    </section>
  );
}
