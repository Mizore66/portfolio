"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { BroadsheetFiller } from "@/components/opening/BroadsheetFiller";
import { GlassEngine, useEngineSearch } from "@/components/opening/GlassEngine";
import { IssueIndex } from "@/components/opening/IssueIndex";
import { Masthead } from "@/components/opening/Masthead";
import { NewspaperColumn } from "@/components/opening/NewspaperColumn";
import { NotationView } from "@/components/opening/NotationView";
import { SituationsWanted } from "@/components/opening/SituationsWanted";
import { TodaysPuzzle } from "@/components/opening/TodaysPuzzle";
import { TreeView } from "@/components/opening/TreeView";
import { BROADSHEET } from "@/content/opening";
import {
  fromPieces,
  isLegalPly,
  legalPlies,
  replyMove,
} from "@/lib/chess/engine";
import { expandPlayLine, sideAfter } from "@/lib/chess/play";
import { positionAfter } from "@/lib/chess/replay";
import { HOVER_PREVIEW_MS, playDelayMs } from "@/lib/opening/motion";
import {
  collectPlies,
  FLAGSHIP_ID,
  getNode,
  lastPly,
  nextMainlineBook,
  ROOT_ID,
  sideToMove,
  stepMainline,
} from "@/lib/opening/tree";
import { visibleEngineLine } from "@/lib/chess/engine-view";
import {
  getSelection,
  replaceSelection,
  SERVER_SELECTION,
  subscribeSelection,
} from "@/lib/opening/selection";
import type { Ply } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

const NO_EXTRA: Ply[] = [];

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function OpeningApp() {
  const selection = useSyncExternalStore(
    subscribeSelection,
    getSelection,
    () => SERVER_SELECTION,
  );
  const selectedId = selection.move;
  const tape = selection.tape;
  const [playing, setPlaying] = useState(false);
  const [playHint, setPlayHint] = useState(false);
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
  const extraLenRef = useRef(0);
  const hoverTimer = useRef<number>(0);
  const skipSpy = useRef(false);
  const skipSpyTimer = useRef<number>(0);
  const selectedRef = useRef(selectedId);
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
  const book = extra.length === 0 ? nextMainlineBook(selectedId) : null;
  const engineLine = visibleEngineLine(book, engine);
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
      replaceSelection(id, tape);
    },
    [tape, setPreviewHl],
  );

  const scrollToChapter = useCallback((id: string) => {
    const el = document.getElementById(`chapter-${id}`);
    if (!el) return;
    skipSpy.current = true;
    window.clearTimeout(skipSpyTimer.current);
    const top = window.scrollY + el.getBoundingClientRect().top - 12;
    const reduced = reducedMotion();
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    const release = () => {
      skipSpy.current = false;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release, { once: true });
    skipSpyTimer.current = window.setTimeout(release, reduced ? 80 : 1000);
  }, []);

  const userSelect = useCallback(
    (id: string) => {
      setPlaying(false);
      onSelect(id);
      scrollToChapter(id);
    },
    [onSelect, scrollToChapter, setPlaying],
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
    if (side !== startSide) return;
    if (!isLegalPly(pos, ply)) return;
    extraLenRef.current = extra.length + 1;
    setPlaying(false);
    setPlayHint(false);
    setPlay((cur) => ({
      id: selectedId,
      extra: [...(cur.id === selectedId ? cur.extra : []), ply],
      note: null,
    }));
  }

  useEffect(() => {
    if (extra.length === 0) return;
    const replySide = sideAfter(startSide, extra.length);
    if (replySide === startSide) return;
    let cancelled = false;
    const plyCount = extra.length;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const line = expandPlayLine(bookPlies, extra);
      const last = line[line.length - 1] ?? null;
      const board = positionAfter(line);
      const replyPos = fromPieces(board, replySide, last);
      const best = replyMove(replyPos);
      if (cancelled || !best) return;
      setPlay((cur) => {
        if (cur.id !== selectedId) return cur;
        if (cur.extra.length !== plyCount) return cur;
        return { id: selectedId, extra: [...cur.extra, best], note: null };
      });
    }, playDelayMs(1));
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
    return () => {
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(skipSpyTimer.current);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      e.preventDefault();
      setPlaying(false);
      const next = stepMainline(selectedId, e.key === "ArrowRight" ? 1 : -1);
      onSelect(next);
      scrollToChapter(next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect, scrollToChapter, selectedId]);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    extraLenRef.current = extra.length;
  }, [extra.length]);

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
      scrollToChapter(next);
      if (stepMainline(next, 1) === next) setPlaying(false);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [playing, selectedId, atEnd, node.plies.length, onSelect, scrollToChapter]);

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

  useEffect(() => {
    const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    if (chapters.length === 0) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      if (skipSpy.current) return;
      if (extraLenRef.current > 0) return;
      const lead = chapters[0];
      if (lead.getBoundingClientRect().top > window.innerHeight * 0.42) return;
      const line = window.innerHeight * 0.28;
      let best: { id: string; dist: number } | null = null;
      for (const el of chapters) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 64 || rect.top > window.innerHeight - 48) continue;
        const id = el.dataset.chapter;
        if (!id) continue;
        const dist = Math.abs(rect.top - line);
        if (!best || dist < best.dist) best = { id, dist };
      }
      if (best && best.id !== selectedRef.current) onSelect(best.id);
    };
    const io = new IntersectionObserver(
      () => {
        if (skipSpy.current) return;
        if (!frame) frame = window.requestAnimationFrame(pick);
      },
      { rootMargin: "-8% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );
    for (const el of chapters) io.observe(el);
    return () => {
      io.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [onSelect, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (selectedId === FLAGSHIP_ID) return;
    const timer = window.setTimeout(() => scrollToChapter(selectedId), 40);
    return () => window.clearTimeout(timer);
    // Deep-link once after hydration — not on every selectedId change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const lastExtra = extra[extra.length - 1];
  const highlight: [string, string] | null = lastExtra
    ? [lastExtra.from, lastExtra.to]
    : node.hl;
  const evalLabel = engine
    ? `${engine.evalCp >= 0 ? "+" : ""}${(engine.evalCp / 100).toFixed(2)}`
    : "…";
  const lampshade = `The engine gives ${evalLabel}. ${BROADSHEET.lampshade}`;
  const moveNumber =
    !node.color || node.moveNumber === 0
      ? 1
      : node.color === "w"
        ? node.moveNumber
        : node.moveNumber + 1;
  const playMoveNumber = extra.length === 0 ? moveNumber : moveNumber + Math.floor((extra.length + (startSide === "b" ? 1 : 0)) / 2);

  function onReadTheGame() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (atEnd) {
      onSelect(ROOT_ID);
      scrollToChapter(ROOT_ID);
    }
    setPlaying(true);
  }

  function onPlayThePosition() {
    setPlayHint(true);
    document.getElementById("play-board")?.focus();
  }

  return (
    <div className="min-h-screen text-ink" data-hydrated={hydrated ? "true" : "false"}>
      <a href="#the-game" className="skip-link">
        {BROADSHEET.skipLink}
      </a>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet w-full max-w-[1180px]">
          <Masthead />
          <main id="the-game">
          <div className="flex flex-col min-[980px]:flex-row-reverse min-[980px]:items-stretch">
            <aside
              data-testid="board-column"
              className="col-stack w-full shrink-0 min-[980px]:w-[min(520px,46%)] max-[979px]:sticky max-[979px]:top-0 max-[979px]:z-20"
            >
              <div className="flex flex-col gap-3 min-[980px]:gap-4 sticky top-0 min-[980px]:top-3 newsprint-sticky z-10 max-[979px]:border-b-2 max-[979px]:border-ink max-[979px]:py-2">
                <div className="board-engine-cluster" data-testid="board-engine-cluster">
                <BoardDiagram
                  plies={displayPlies}
                  highlight={highlight}
                  preview={previewHl}
                  caption={node.cap}
                  evalCp={engine ? engine.evalCp / 100 : null}
                  evalLabel={evalLabel}
                  arrow={engineLine.best}
                  legal={legal}
                  playable
                  playSide={side}
                  onPlay={onPlay}
                  onSquare={onPuzzleSquare}
                  puzzlePrompt={node.puzzle && extra.length === 0 ? node.puzzle.prompt : null}
                  puzzleNote={puzzleNote}
                  puzzleTarget={node.puzzle && extra.length === 0 ? node.puzzle.target : null}
                />
                <GlassEngine
                  info={engine}
                  book={book}
                  side={side}
                  moveNumber={playMoveNumber}
                  lampshade={lampshade}
                />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    data-play-control=""
                    data-testid="read-the-game"
                    aria-pressed={playing}
                    onClick={onReadTheGame}
                    className={cn(
                      "inline-flex items-center gap-2 border-2 border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-widest",
                      playing ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-deep",
                    )}
                  >
                    <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
                    {playing ? "Pause" : "Read the game"}
                  </button>
                  <button
                    type="button"
                    data-testid="play-the-position"
                    onClick={onPlayThePosition}
                    className={cn(
                      "inline-flex items-center gap-2 border-2 border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-widest",
                      playHint ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-deep",
                    )}
                  >
                    <span aria-hidden>♟</span>
                    {BROADSHEET.playInvite}
                  </button>
                </div>
                {playHint ? (
                  <p className="font-display text-[13px] italic text-ink">{BROADSHEET.playHint}</p>
                ) : null}
                <IssueIndex selectedId={selectedId} onSelect={userSelect} />
                <div className="max-[979px]:hidden">
                  <TodaysPuzzle selectedId={selectedId} onSelect={userSelect} />
                  <div className="mt-3">
                    <SituationsWanted />
                  </div>
                </div>
              </div>
            </aside>
            <NewspaperColumn />
            <section
              data-testid="tree-column"
              className="col-stack flex min-w-0 flex-1 flex-col"
            >
              <div className="max-[979px]:hidden">
                <TreeView
                  selectedId={selectedId}
                  onSelect={userSelect}
                  onPreview={onPreview}
                  tape={tape}
                />
              </div>
              <div className="mb-4 min-[980px]:hidden print:hidden">
                <SituationsWanted />
              </div>
              <NotationView
                selectedId={selectedId}
                onSelect={userSelect}
                onPreview={onPreview}
              />
              <BroadsheetFiller />
            </section>
          </div>
          </main>
        </div>
      </div>
    </div>
  );
}
