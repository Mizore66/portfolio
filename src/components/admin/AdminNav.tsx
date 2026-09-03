"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/cms/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Homepage" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/aspirations", label: "Aspirations" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/diff", label: "Diff" },
  { href: "/admin/history", label: "History" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";
  const [compact, setCompact] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const primary = compact
    ? LINKS.filter((link) => ["Dashboard", "Claims", "Projects", "Diff"].includes(link.label))
    : LINKS;
  const more = compact ? LINKS.filter((link) => !primary.some((row) => row.href === link.href)) : [];

  function current(href: string) {
    if (href === "/admin") return pathname === "/admin" ? "page" : undefined;
    return pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;
  }

  return (
    <nav className="recruiter-nav admin-nav" aria-label="Portfolio CMS">
      <ul className="recruiter-nav-list">
        {primary.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="recruiter-nav-link" aria-current={current(link.href)}>
              {link.label}
            </Link>
          </li>
        ))}
        {more.length ? (
          <li className="nav-more">
            <div>
              <button
                type="button"
                className="recruiter-nav-link"
                aria-expanded={moreOpen}
                aria-controls="cms-more-menu"
                onClick={() => setMoreOpen((open) => !open)}
              >
                More
              </button>
              {moreOpen ? (
                <ul id="cms-more-menu">
                  {more.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="recruiter-nav-link"
                        aria-current={current(link.href)}
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ) : null}
      </ul>
      <form action={logoutAction}>
        <button type="submit" className="recruiter-nav-stamp">
          Sign out
        </button>
      </form>
    </nav>
  );
}
