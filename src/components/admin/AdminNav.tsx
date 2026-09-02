import Link from "next/link";
import { logoutAction } from "@/lib/cms/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/aspirations", label: "Aspirations" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminNav() {
  return (
    <nav className="recruiter-nav" aria-label="Editor">
      <ul className="recruiter-nav-list">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="recruiter-nav-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <form action={logoutAction}>
        <button type="submit" className="recruiter-nav-stamp">
          Sign out
        </button>
      </form>
    </nav>
  );
}
