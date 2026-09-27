import Link from "next/link";

/** The rest of the site, by the titles those pages already carry (brief §6). */
const ONWARD = [
  { href: "/work", label: "Selected work" },
  { href: "/about", label: "Experience" },
  { href: "/lab", label: "The engine experiment" },
] as const;

export function Onward() {
  return (
    <nav className="section onward" aria-label="Sections">
      <ul>
        {ONWARD.map((o) => (
          <li key={o.href}>
            <Link href={o.href} data-cursor="piece">
              {o.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
