"use client";

import { useEffect, useRef } from "react";

export function WorkFilterStatus({
  path,
  count,
}: {
  path: string;
  count: number;
}) {
  const ready = useRef(false);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      return;
    }
    const chip = document.querySelector<HTMLElement>(".path-chip-current");
    chip?.focus();
  }, [path]);

  if (path === "all") return null;

  const label = `${count} projects in ${path}`;

  return (
    <p className="sr-only" role="status" aria-live="polite" data-testid="work-filter-status">
      {label}
    </p>
  );
}
