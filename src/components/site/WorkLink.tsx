"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parsePath } from "@/content/site/paths";

/** Link back to the work list that keeps a valid ?path= filter (brief §3.7). */
export function WorkLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const path = parsePath(useSearchParams().get("path"));
  return (
    <Link className={className} href={path ? `/?path=${path}#work` : "/#work"}>
      {children}
    </Link>
  );
}
