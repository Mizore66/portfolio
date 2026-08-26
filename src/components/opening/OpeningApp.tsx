"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnnotationPanel } from "@/components/opening/AnnotationPanel";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { Masthead } from "@/components/opening/Masthead";
import { NotationView } from "@/components/opening/NotationView";
import { TreeView } from "@/components/opening/TreeView";
import {
  collectPlies,
  getNode,
  isOpeningId,
  ROOT_ID,
  stepMainline,
} from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

function moveFromSearch(params: URLSearchParams): string {
  const move = params.get("move");
  return move && isOpeningId(move) ? move : ROOT_ID;
}

export function OpeningApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = moveFromSearch(searchParams);
  const [view, setView] = useState<"tree" | "notation">("tree");
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const node = getNode(selectedId);
  const plies = useMemo(() => collectPlies(selectedId), [selectedId]);

  const onSelect = useCallback(
    (id: string) => {
      const href = id === ROOT_ID ? pathname : `${pathname}?move=${encodeURIComponent(id)}`;
      router.replace(href, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      onSelect(stepMainline(selectedId, e.key === "ArrowRight" ? 1 : -1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect, selectedId]);

  return (
    <div className="min-h-screen text-ink" data-hydrated={hydrated ? "true" : "false"}>
      <div className="relative z-[1] mx-auto px-5 py-6 sm:px-10 sm:py-8 lg:px-16">
        <div className="mx-auto max-w-[1080px]">
          <Masthead view={view} onView={setView} />
        </div>
        <div className="mx-auto mt-5 flex max-w-[1080px] flex-col gap-5 min-[980px]:flex-row min-[980px]:items-start min-[980px]:justify-center">
          <section className="min-w-0 min-[980px]:flex-none">
            <div
              className={cn(
                "sheet w-full",
                view === "tree" && "min-[980px]:w-max",
              )}
            >
              <div className={cn(view === "tree" ? "hidden min-[980px]:block" : "hidden")}>
                <TreeView selectedId={selectedId} onSelect={onSelect} />
              </div>
              <div className={cn(view === "notation" ? "block" : "block min-[980px]:hidden")}>
                <NotationView selectedId={selectedId} onSelect={onSelect} />
              </div>
            </div>
          </section>
          <aside className="sheet w-full shrink-0 min-[980px]:sticky min-[980px]:top-6 min-[980px]:max-h-[calc(100vh-3rem)] min-[980px]:w-[360px] min-[980px]:overflow-y-auto">
            <BoardDiagram plies={plies} highlight={node.hl} caption={node.cap} />
            <div className="mx-4 border-t border-ink" />
            <AnnotationPanel node={node} />
          </aside>
        </div>
      </div>
    </div>
  );
}
