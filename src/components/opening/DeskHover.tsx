"use client";

import type { ReactNode } from "react";
import { emitDesk } from "@/lib/desk";

export function DeskHover({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <div
      onPointerEnter={() => emitDesk({ type: "project", slug })}
      onPointerLeave={() => emitDesk({ type: "project", slug: null })}
    >
      {children}
    </div>
  );
}
