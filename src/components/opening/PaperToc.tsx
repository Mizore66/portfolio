"use client";

import { BROADSHEET } from "@/content/opening";
import { issueChapters, moveHeading } from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

export function PaperToc({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const chapters = issueChapters();

  return (
    <nav className="paper-toc" data-testid="paper-toc" aria-label={BROADSHEET.issueKicker}>
      <details>
        <summary>Contents</summary>
        <ol>
          {chapters.map((node) => {
            const current = node.id === selectedId;
            return (
              <li key={node.id}>
                <button
                  type="button"
                  data-node-id={node.id}
                  aria-current={current ? "true" : undefined}
                  onClick={() => onSelect(node.id)}
                  className={cn(
                    "issue-row move-tint flex w-full items-center justify-between gap-2 border-l-2 pl-2 text-left font-mono text-[12px]",
                    current
                      ? "is-selected border-score-red font-semibold text-score-red"
                      : "border-transparent text-ink",
                  )}
                >
                  <span>{moveHeading(node)}</span>
                  <span className="truncate font-sans text-[12px] uppercase tracking-wider text-faded">
                    {node.kind}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </details>
    </nav>
  );
}
