"use client";

import { useEffect, useState } from "react";
import { BROADSHEET } from "@/content/opening";
import { issueChapters, moveHeading } from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

export function WayfindIndex({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const chapters = issueChapters();

  useEffect(() => {
    function onScroll() {
      setShown(window.scrollY > window.innerHeight * 2);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!shown) setOpen(false);
  }, [shown]);

  return (
    <div
      className="wayfind-index"
      data-testid="wayfind-index"
      data-shown={shown ? "true" : "false"}
      inert={!shown}
      aria-hidden={!shown}
    >
      <button
        type="button"
        className="wayfind-toggle"
        data-testid="wayfind-toggle"
        aria-expanded={open}
        aria-controls="wayfind-panel"
        aria-label={BROADSHEET.issueKicker}
        tabIndex={shown ? 0 : -1}
        onClick={() => setOpen((v) => !v)}
      >
        ⌃ {BROADSHEET.wayfindLabel}
      </button>
      {open ? (
        <nav id="wayfind-panel" className="wayfind-panel" aria-label={BROADSHEET.issueKicker}>
          <ol>
            {chapters.map((node) => {
              const current = node.id === selectedId;
              return (
                <li key={node.id}>
                  <button
                    type="button"
                    data-node-id={node.id}
                    aria-current={current ? "true" : undefined}
                    className={cn("wayfind-row", current && "wayfind-row-current is-selected")}
                    onClick={() => {
                      onSelect(node.id);
                      setOpen(false);
                    }}
                  >
                    <span>{moveHeading(node)}</span>
                    <span>{node.kind}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
    </div>
  );
}
