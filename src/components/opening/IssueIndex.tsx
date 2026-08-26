"use client";

import { BROADSHEET } from "@/content/opening";
import { issueChapters, moveHeading, pathIdSet } from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

export function IssueIndex({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const chapters = issueChapters();
  const path = pathIdSet(selectedId);
  const currentId = [...chapters].reverse().find((n) => path.has(n.id))?.id;

  return (
    <nav
      data-testid="issue-index"
      aria-label={BROADSHEET.issueKicker}
      className="border-2 border-ink px-2 py-2 max-[979px]:hidden"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.issueKicker}
      </p>
      <ol className="mt-1">
        {chapters.map((node) => {
          const current = node.id === currentId;
          return (
            <li key={node.id}>
              <button
                type="button"
                data-node-id={node.id}
                aria-current={current ? "true" : undefined}
                onClick={() => onSelect(node.id)}
                className={cn(
                  "flex w-full items-baseline justify-between gap-2 border-l-2 py-px pl-1.5 text-left font-mono text-[10px] leading-tight",
                  current
                    ? "border-score-red font-semibold text-score-red"
                    : "border-transparent text-ink hover:border-ink",
                )}
              >
                <span>{moveHeading(node)}</span>
                <span className="truncate font-sans text-[9px] uppercase tracking-wider text-faded">
                  {node.kind}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
