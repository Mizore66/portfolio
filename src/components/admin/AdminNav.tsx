"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/cms/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Homepage" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/education", label: "Education" },
  { href: "/admin/chess", label: "Chess" },
  { href: "/admin/lab", label: "Lab" },
  { href: "/admin/aspirations", label: "Aspirations" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/diff", label: "Diff" },
  { href: "/admin/history", label: "History" },
  { href: "/admin/release", label: "Release" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";
  const [compact, setCompact] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreButton.current?.focus();
      }
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
                ref={moreButton}
                type="button"
                className="recruiter-nav-link"
                aria-expanded={moreOpen}
                aria-controls="cms-more-menu"
                onClick={() => setMoreOpen((open) => !open)}
              >
                More
              </button>
              {moreOpen ? (
                <div id="cms-more-menu" className="nav-more-panel">
                  <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-faded">More pages</p>
                  <ul>
                  {more.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="recruiter-nav-link"
                        aria-current={current(link.href)}
                        onClick={() => {
                          setMoreOpen(false);
                          moreButton.current?.focus();
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  </ul>
                </div>
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
