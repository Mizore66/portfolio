import { getClaim } from "@/content/site";
import { formatPeriod } from "@/content/site/format";
import type { Role } from "@/content/site/types";
import { ClaimLine } from "./ClaimLine";

export function RoleEntry({ role }: { role: Role }) {
  return (
    <article id={role.id} className={role.earlier ? "role role-earlier" : "role"} aria-labelledby={`${role.id}-title`}>
      <p className="role-meta">
        {formatPeriod(role.start, role.end)} · {role.kind}
      </p>
      <h3 id={`${role.id}-title`}>
        {role.employer}
        <span className="role-title">{role.title}</span>
      </h3>
      {role.scope ? <p className="role-scope">{role.scope}</p> : null}
      <ul className="role-bullets">
        {role.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      {role.claimIds.length ? (
        <div className="role-claims">
          {role.claimIds.map((id) => (
            <ClaimLine key={id} claim={getClaim(id)} />
          ))}
        </div>
      ) : null}
      {role.note ? <p className="note">{role.note}</p> : null}
      {role.annotation ? <p className="annotation">{role.annotation}</p> : null}
      <p className="role-tech">{role.tech.join(", ")}</p>
    </article>
  );
}
