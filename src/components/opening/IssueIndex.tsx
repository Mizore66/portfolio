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
      className="box-inset border-2 border-ink max-[979px]:hidden"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.issueKicker}
      </p>
      <ol className="mt-2">
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
                  "flex w-full items-baseline justify-between gap-3 border-l-2 py-1 pl-2 text-left font-mono text-[11px] leading-tight",
                  current
                    ? "border-score-red font-semibold text-score-red"
                    : "border-transparent text-ink hover:border-ink",
                )}
              >
                <span>{moveHeading(node)}</span>
                <span className="truncate font-sans text-[10px] uppercase tracking-wider text-faded">
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
