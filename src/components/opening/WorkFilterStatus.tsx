"use client";

import { useEffect, useRef } from "react";

export function WorkFilterStatus({
  path,
  count,
}: {
  path: string;
  count: number;
}) {
  const heading = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = document.getElementById("work-heading");
    if (path !== "all" && node instanceof HTMLElement) {
      node.focus();
    }
  }, [path]);

  const label =
    path === "all" ? `${count} projects` : `${count} projects in ${path}`;

  return (
    <p ref={heading} className="sr-only" role="status" aria-live="polite" data-testid="work-filter-status">
      {label}
    </p>
  );
}
