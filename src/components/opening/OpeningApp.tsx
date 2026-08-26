"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnnotationPanel } from "@/components/opening/AnnotationPanel";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { BroadsheetFiller } from "@/components/opening/BroadsheetFiller";
import { GlassEngine, useEngineSearch } from "@/components/opening/GlassEngine";
import { Masthead } from "@/components/opening/Masthead";
import { NewspaperColumn } from "@/components/opening/NewspaperColumn";
import { NotationView } from "@/components/opening/NotationView";
import { TreeView } from "@/components/opening/TreeView";
import { BROADSHEET } from "@/content/opening";
import {
  clonePos,
  fromPieces,
  isLegalPly,
  legalPlies,
  prepareSearch,
  search,
} from "@/lib/chess/engine";
import { expandPlayLine, opposite, sideAfter } from "@/lib/chess/play";
import { positionAfter } from "@/lib/chess/replay";
import { HOVER_PREVIEW_MS, playDelayMs } from "@/lib/opening/motion";
import {
  collectPlies,
  FLAGSHIP_ID,
  getNode,
  isOpeningId,
  lastPly,
  sideToMove,
  stepMainline,
} from "@/lib/opening/tree";
import type { Ply } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

const NO_EXTRA: Ply[] = [];

function moveFromSearch(params: URLSearchParams): string {
  const move = params.get("move");
  if (!move) return FLAGSHIP_ID;
  return isOpeningId(move) ? move : FLAGSHIP_ID;
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
  const [play, setPlay] = useState<{ id: string; extra: Ply[]; note: string | null }>({
    id: selectedId,
    extra: [],
    note: null,
  });
  if (play.id !== selectedId) {
    setPlay({ id: selectedId, extra: [], note: null });
  }
  const extra = play.id === selectedId ? play.extra : NO_EXTRA;
  const puzzleNote = play.id === selectedId ? play.note : null;
  const playingRef = useRef(false);
  const hoverTimer = useRef<number>(0);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const node = getNode(selectedId);
  const bookPlies = useMemo(() => collectPlies(selectedId), [selectedId]);
  const displayPlies = useMemo(() => expandPlayLine(bookPlies, extra), [bookPlies, extra]);
  const startSide = sideToMove(selectedId);
  const side = sideAfter(startSide, extra.length);
  const engine = useEngineSearch(displayPlies, side);
  const atEnd = stepMainline(selectedId, 1) === selectedId;
  const piecesNow = useMemo(() => positionAfter(displayPlies), [displayPlies]);
  const pos = useMemo(
    () => fromPieces(piecesNow, side, displayPlies[displayPlies.length - 1] ?? lastPly(selectedId)),
    [piecesNow, side, displayPlies, selectedId],
  );
  const legal = useMemo(() => legalPlies(pos), [pos]);

  const onSelect = useCallback(
    (id: string) => {
      setPreviewHl(null);
      const params = new URLSearchParams();
      if (id !== FLAGSHIP_ID) params.set("move", id);
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

  function onPlay(ply: Ply) {
    if (!isLegalPly(pos, ply)) return;
    setPlaying(false);
    setPlay((cur) => ({
      id: selectedId,
      extra: [...(cur.id === selectedId ? cur.extra : []), ply],
      note: null,
    }));
  }

  useEffect(() => {
    if (extra.length === 0 || extra.length % 2 === 0) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const replySide = opposite(startSide);
      const line = expandPlayLine(bookPlies, extra);
      const last = line[line.length - 1] ?? null;
      const board = positionAfter(line);
      const replyPos = fromPieces(board, replySide, last);
      prepareSearch();
      const result = search(clonePos(replyPos), 6, { timeMs: 280 });
      if (cancelled || !result.best) return;
      setPlay((cur) => {
        if (cur.id !== selectedId) return cur;
        return { id: selectedId, extra: [...cur.extra, result.best!], note: null };
      });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [extra, startSide, bookPlies, selectedId]);

  function onPuzzleSquare(sq: string) {
    const puzzle = node.puzzle;
    if (!puzzle || extra.length > 0) return;
    if (sq === puzzle.target) {
      userSelect(FLAGSHIP_ID);
      return;
    }
    setPlay((cur) => ({ id: selectedId, extra: cur.id === selectedId ? cur.extra : [], note: puzzle.miss }));
  }

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

  const lastExtra = extra[extra.length - 1];
  const highlight: [string, string] | null = lastExtra
    ? [lastExtra.from, lastExtra.to]
    : node.hl;
  const evalLabel = engine
    ? `${engine.evalCp >= 0 ? "+" : ""}${(engine.evalCp / 100).toFixed(2)}`
    : "…";
  const lampshade =
    selectedId === FLAGSHIP_ID && extra.length === 0 && engine && engine.evalCp < 0
      ? `The engine gives ${evalLabel}. ${BROADSHEET.lampshade}`
      : null;
  const moveNumber =
    !node.color || node.moveNumber === 0
      ? 1
      : node.color === "w"
        ? node.moveNumber
        : node.moveNumber + 1;
  const playMoveNumber = extra.length === 0 ? moveNumber : moveNumber + Math.floor((extra.length + (startSide === "b" ? 1 : 0)) / 2);

  return (
    <div className="min-h-screen text-ink" data-hydrated={hydrated ? "true" : "false"}>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet w-full max-w-[1180px]">
          <Masthead view={view} onView={setView} />
          <div className="flex flex-col min-[980px]:flex-row-reverse min-[980px]:items-stretch">
            <aside
              data-testid="board-column"
              className="col-stack w-full shrink-0 min-[980px]:w-[min(520px,46%)]"
            >
              <div className="flex flex-col gap-6 min-[980px]:sticky min-[980px]:top-3 newsprint-sticky z-10">
                <BoardDiagram
                  plies={displayPlies}
                  highlight={highlight}
                  preview={previewHl}
                  caption={node.cap}
                  evalCp={engine ? engine.evalCp / 100 : null}
                  evalLabel={evalLabel}
                  arrow={engine?.best ?? null}
                  legal={legal}
                  playable
                  playSide={side}
                  onPlay={onPlay}
                  onSquare={onPuzzleSquare}
                  puzzlePrompt={node.puzzle && extra.length === 0 ? node.puzzle.prompt : null}
                  puzzleNote={puzzleNote}
                />
                <GlassEngine
                  info={engine}
                  side={side}
                  moveNumber={playMoveNumber}
                  lampshade={lampshade}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    data-play-control=""
                    data-testid="read-the-game"
                    aria-pressed={playing}
                    disabled={!playing && atEnd}
                    onClick={() => setPlaying((p) => !p)}
                    className={cn(
                      "inline-flex items-center gap-2 border-2 border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-widest",
                      playing ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-deep",
                      "disabled:opacity-40",
                    )}
                  >
                    <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
                    {playing ? "Pause" : "Read the game"}
                  </button>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
                    {BROADSHEET.playInvite}
                  </p>
                </div>
              </div>
              <AnnotationPanel node={node} />
            </aside>
            <NewspaperColumn />
            <section
              data-testid="tree-column"
              className="col-stack flex min-w-0 flex-1 flex-col overflow-x-hidden"
            >
              <div
                className={cn(
                  "view-turn max-[979px]:hidden",
                  view === "tree"
                    ? "min-[980px]:relative min-[980px]:visible min-[980px]:opacity-100"
                    : "min-[980px]:pointer-events-none min-[980px]:absolute min-[980px]:inset-x-0 min-[980px]:top-0 min-[980px]:h-0 min-[980px]:overflow-hidden min-[980px]:invisible min-[980px]:opacity-0",
                )}
              >
                <TreeView
                  selectedId={selectedId}
                  onSelect={userSelect}
                  onPreview={onPreview}
                  tape={tape}
                />
                <BroadsheetFiller />
              </div>
              <div
                className={cn(
                  "view-turn",
                  view === "notation"
                    ? "relative visible opacity-100"
                    : "max-[979px]:relative max-[979px]:visible max-[979px]:opacity-100 min-[980px]:pointer-events-none min-[980px]:absolute min-[980px]:inset-x-0 min-[980px]:top-0 min-[980px]:h-0 min-[980px]:overflow-hidden min-[980px]:invisible min-[980px]:opacity-0",
                )}
              >
                <NotationView
                  selectedId={selectedId}
                  onSelect={userSelect}
                  onPreview={onPreview}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
