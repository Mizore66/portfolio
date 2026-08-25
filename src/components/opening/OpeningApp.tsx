"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnnotationPanel } from "@/components/opening/AnnotationPanel";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { Masthead } from "@/components/opening/Masthead";
import { NotationView } from "@/components/opening/NotationView";
import { TreeView } from "@/components/opening/TreeView";
import {
  collectPlies,
  getNode,
  ROOT_ID,
  stepMainline,
} from "@/lib/opening/tree";
import { cn } from "@/lib/utils";

export function OpeningApp() {
  const [selectedId, setSelectedId] = useState(ROOT_ID);
  const [view, setView] = useState<"tree" | "notation">("tree");
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const node = getNode(selectedId);
  const plies = useMemo(() => collectPlies(selectedId), [selectedId]);

  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      setSelectedId((id) => stepMainline(id, e.key === "ArrowRight" ? 1 : -1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen text-ink" data-hydrated={hydrated ? "true" : "false"}>
      <div className="relative z-[1] mx-auto max-w-[1440px] px-3 py-3 sm:px-5 sm:py-4">
        <Masthead view={view} onView={setView} />
        <div className="mt-3 flex flex-col gap-3 min-[980px]:flex-row min-[980px]:items-start">
          <section className="sheet min-w-0 flex-1">
            <div className={cn(view === "tree" ? "hidden min-[980px]:block" : "hidden")}>
              <TreeView selectedId={selectedId} onSelect={onSelect} />
            </div>
            <div className={cn(view === "notation" ? "block" : "block min-[980px]:hidden")}>
              <NotationView selectedId={selectedId} onSelect={onSelect} />
            </div>
          </section>
          <aside className="sheet w-full shrink-0 min-[980px]:sticky min-[980px]:top-28 min-[980px]:max-h-[calc(100vh-8rem)] min-[980px]:w-[360px] min-[980px]:overflow-y-auto">
            <BoardDiagram plies={plies} highlight={node.hl} caption={node.cap} />
            <div className="mx-4 border-t border-ink" />
            <AnnotationPanel node={node} />
          </aside>
        </div>
      </div>
    </div>
  );
}
