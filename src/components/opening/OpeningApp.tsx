"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnnotationPanel } from "@/components/opening/AnnotationPanel";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { Masthead } from "@/components/opening/Masthead";
import { NotationView } from "@/components/opening/NotationView";
import { TreeView } from "@/components/opening/TreeView";
import { HOVER_PREVIEW_MS, playDelayMs } from "@/lib/opening/motion";
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
  const tape = searchParams.get("tape") === "1";
  const [view, setView] = useState<"tree" | "notation">("tree");
  const [playing, setPlaying] = useState(false);
  const [previewHl, setPreviewHl] = useState<[string, string] | null>(null);
  const playingRef = useRef(false);
  const hoverTimer = useRef<number>(0);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const node = getNode(selectedId);
  const plies = useMemo(() => collectPlies(selectedId), [selectedId]);
  const atEnd = stepMainline(selectedId, 1) === selectedId;

  const onSelect = useCallback(
    (id: string) => {
      setPreviewHl(null);
      const params = new URLSearchParams();
      if (id !== ROOT_ID) params.set("move", id);
      if (tape) params.set("tape", "1");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, tape, setPreviewHl],
  );

  const userSelect = useCallback(
    (id: string) => {
      setPlaying(false);
      onSelect(id);
    },
    [onSelect, setPlaying],
  );

  const onPreview = useCallback(
    (id: string | null) => {
      window.clearTimeout(hoverTimer.current);
      if (!id || id === selectedId) {
        setPreviewHl(null);
        return;
      }
      hoverTimer.current = window.setTimeout(() => {
        setPreviewHl(getNode(id).hl);
      }, HOVER_PREVIEW_MS);
    },
    [selectedId, setPreviewHl],
  );

  useEffect(() => {
    return () => window.clearTimeout(hoverTimer.current);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      setPlaying(false);
      onSelect(stepMainline(selectedId, e.key === "ArrowRight" ? 1 : -1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect, selectedId]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing || atEnd) return;
    const wait = playDelayMs(node.plies.length);
    const timer = window.setTimeout(() => {
      if (!playingRef.current) return;
      const next = stepMainline(selectedId, 1);
      if (next === selectedId) {
        setPlaying(false);
        return;
      }
      onSelect(next);
      if (stepMainline(next, 1) === next) setPlaying(false);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [playing, selectedId, atEnd, node.plies.length, onSelect]);

  useEffect(() => {
    if (!playing) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-play-control]")) return;
      setPlaying(false);
    }
    function onVis() {
      if (document.visibilityState === "hidden") setPlaying(false);
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [playing]);

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
                "sheet relative w-full overflow-x-hidden",
                view === "tree" && "min-[980px]:w-max",
              )}
            >
              <div
                className={cn(
                  "view-turn max-[979px]:hidden",
                  view === "tree"
                    ? "min-[980px]:relative min-[980px]:visible min-[980px]:opacity-100"
                    : "min-[980px]:pointer-events-none min-[980px]:absolute min-[980px]:inset-x-0 min-[980px]:top-0 min-[980px]:invisible min-[980px]:opacity-0",
                )}
              >
                <TreeView
                  selectedId={selectedId}
                  onSelect={userSelect}
                  onPreview={onPreview}
                  tape={tape}
                />
              </div>
              <div
                className={cn(
                  "view-turn",
                  view === "notation"
                    ? "relative visible opacity-100"
                    : "max-[979px]:relative max-[979px]:visible max-[979px]:opacity-100 min-[980px]:pointer-events-none min-[980px]:absolute min-[980px]:inset-x-0 min-[980px]:top-0 min-[980px]:invisible min-[980px]:opacity-0",
                )}
              >
                <NotationView
                  selectedId={selectedId}
                  onSelect={userSelect}
                  onPreview={onPreview}
                />
              </div>
            </div>
          </section>
          <aside className="sheet w-full shrink-0 min-[980px]:sticky min-[980px]:top-6 min-[980px]:max-h-[calc(100vh-3rem)] min-[980px]:w-[360px] min-[980px]:overflow-y-auto">
            <BoardDiagram
              plies={plies}
              highlight={node.hl}
              preview={previewHl}
              caption={node.cap}
            />
            <div className="mx-4 flex items-center justify-between gap-3 border-t border-ink px-0 py-3">
              <button
                type="button"
                data-play-control=""
                data-testid="read-the-game"
                aria-pressed={playing}
                disabled={!playing && atEnd}
                onClick={() => setPlaying((p) => !p)}
                className={cn(
                  "border-2 border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest",
                  playing
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink hover:bg-paper-deep disabled:opacity-40",
                )}
              >
                {playing ? "Pause" : "Read the game"}
              </button>
              <p className="font-mono text-[10px] uppercase tracking-widest text-faded">
                Off by default
              </p>
            </div>
            <div className="mx-4 border-t border-ink" />
            <AnnotationPanel node={node} />
          </aside>
        </div>
      </div>
    </div>
  );
}
