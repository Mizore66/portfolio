"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { BroadsheetFiller } from "@/components/opening/BroadsheetFiller";
import { Closer } from "@/components/opening/Closer";
import { Colophon } from "@/components/opening/Colophon";
import { GlassEngine, useEngineSearch, useNnueWeights } from "@/components/opening/GlassEngine";
import { IssueIndex } from "@/components/opening/IssueIndex";
import { NewspaperColumn } from "@/components/opening/NewspaperColumn";
import { SituationsWanted } from "@/components/opening/SituationsWanted";
import { TodaysPuzzle } from "@/components/opening/TodaysPuzzle";
import { WayfindIndex } from "@/components/opening/WayfindIndex";
import { BROADSHEET } from "@/content/opening";
import type { EvalMode } from "@/lib/chess/engine";
import { PHASE2_DEFAULT_EVAL, PHASE2_EXHIBITS } from "@/lib/chess/phase2";
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

const NotationView = dynamic(() =>
  import("@/components/opening/NotationView").then((m) => m.NotationView),
);
const TreeView = dynamic(() =>
  import("@/components/opening/TreeView").then((m) => m.TreeView),
);

const NO_EXTRA: Ply[] = [];
type EngineApi = typeof import("@/lib/chess/engine");

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function OpeningApp({
  staticBoard,
}: {
  staticBoard?: ReactNode;
} = {}) {
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
  const [engineApi, setEngineApi] = useState<EngineApi | null>(null);
  const engineApiRef = useRef(engineApi);
  engineApiRef.current = engineApi;

  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    const load = () => {
      void import("@/lib/chess/engine").then((mod) => {
        if (!cancelled) setEngineApi(mod);
      });
    };
    if (typeof requestIdleCallback === "function") {
      idle = requestIdleCallback(load, { timeout: 400 });
    } else {
      idle = window.setTimeout(load, 0);
    }
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);
  const selectedRef = useRef(selectedId);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const node = getNode(selectedId);
  const bookPlies = useMemo(() => collectPlies(selectedId), [selectedId]);
  const displayPlies = useMemo(() => expandPlayLine(bookPlies, extra), [bookPlies, extra]);
  const startSide = sideToMove(selectedId);
  const side = sideAfter(startSide, extra.length);
  const [evalMode, setEvalMode] = useState<EvalMode>(PHASE2_DEFAULT_EVAL);
  const wantLearned = PHASE2_EXHIBITS && evalMode === "learned";
  const { net, status: weightsStatus } = useNnueWeights(wantLearned);
  const using: EvalMode = wantLearned && net ? "learned" : "handcrafted";
  const { info: engine, down: engineDown } = useEngineSearch(displayPlies, side, using, net);
  const book = extra.length === 0 ? nextMainlineBook(selectedId) : null;
  const engineLine = visibleEngineLine(book, engine);
  const atEnd = stepMainline(selectedId, 1) === selectedId;
  const piecesNow = useMemo(() => positionAfter(displayPlies), [displayPlies]);
  const pos = useMemo(
    () =>
      engineApi
        ? engineApi.fromPieces(
            piecesNow,
            side,
            displayPlies[displayPlies.length - 1] ?? lastPly(selectedId),
          )
        : null,
    [engineApi, piecesNow, side, displayPlies, selectedId],
  );
  const legal = useMemo(
    () => (engineApi && pos ? engineApi.legalPlies(pos) : []),
    [engineApi, pos],
  );
  const posRef = useRef(pos);
  posRef.current = pos;

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
    const stack =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--sticky-stack"),
      ) || 0;
    const top = window.scrollY + el.getBoundingClientRect().top - stack - 12;
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

  const onPlay = useCallback(
    (ply: Ply) => {
      const api = engineApiRef.current;
      const boardPos = posRef.current;
      if (!api || !boardPos) return;
      if (side !== startSide) return;
      if (!api.isLegalPly(boardPos, ply)) return;
      extraLenRef.current = extraLenRef.current + 1;
      setPlaying(false);
      setPlayHint(false);
      setPlay((cur) => ({
        id: selectedId,
        extra: [...(cur.id === selectedId ? cur.extra : []), ply],
        note: null,
      }));
    },
    [side, startSide, selectedId],
  );

  useEffect(() => {
    if (!engineApi) return;
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
      const replyPos = engineApi.fromPieces(board, replySide, last);
      const best = engineApi.replyMove(replyPos);
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
  }, [engineApi, extra, startSide, bookPlies, selectedId]);

  const onPuzzleSquare = useCallback(
    (sq: string) => {
      const puzzle = node.puzzle;
      if (!puzzle || extraLenRef.current > 0) return;
      if (sq === puzzle.target) {
        userSelect(FLAGSHIP_ID);
        return;
      }
      setPlay((cur) => ({
        id: selectedId,
        extra: cur.id === selectedId ? cur.extra : [],
        note: puzzle.miss,
      }));
    },
    [node.puzzle, selectedId, userSelect],
  );

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
  }, [onSelect]);

  useEffect(() => {
    if (selectedId === FLAGSHIP_ID) return;
    const timer = window.setTimeout(() => scrollToChapter(selectedId), 40);
    return () => window.clearTimeout(timer);
    // Deep-link once after mount — not on every selectedId change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const move = params.get("move");
    if (!move) return;
    const el = document.getElementById(`chapter-${move}`);
    if (!el) return;
    el.dataset.arrive = "true";
    const timer = window.setTimeout(() => {
      delete el.dataset.arrive;
    }, 1600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-sticky-board]");
    if (!el) return;
    const apply = () => {
      const rect = el.getBoundingClientRect();
      const full = rect.width >= window.innerWidth * 0.72;
      const sticky = getComputedStyle(el).position === "sticky";
      const h = sticky && full ? Math.round(rect.height) : 0;
      document.documentElement.style.setProperty("--sticky-stack", `${h}px`);
    };
    // Setting a property on <html> invalidates inherited styles, including the LCP board.
    let idle = 0;
    let cleanupRo = () => {};
    const arm = () => {
      apply();
      const ro = new ResizeObserver(apply);
      ro.observe(el);
      window.addEventListener("resize", apply);
      cleanupRo = () => {
        ro.disconnect();
        window.removeEventListener("resize", apply);
      };
    };
    if (typeof requestIdleCallback === "function") {
      idle = requestIdleCallback(arm, { timeout: 1800 });
    } else {
      idle = window.setTimeout(arm, 1800);
    }
    return () => {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanupRo();
      document.documentElement.style.removeProperty("--sticky-stack");
    };
  }, []);

  const lastExtra = extra[extra.length - 1];
  const highlight = useMemo<[string, string] | null>(
    () => (lastExtra ? [lastExtra.from, lastExtra.to] : node.hl),
    [lastExtra, node.hl],
  );
  const evalLabel = engine
    ? `${engine.evalCp >= 0 ? "+" : ""}${(engine.evalCp / 100).toFixed(2)}`
    : "…";
  const annotatorCp = Math.round(node.eval * 100);
  const annotatorLabel = `${node.eval >= 0 ? "+" : ""}${node.eval.toFixed(2)}`;
  const boardArrow = extra.length === 0 ? (book?.plies[0] ?? null) : (engineLine.best ?? null);
  const learnedDisagrees =
    using === "learned" && engine && Math.abs(engine.evalCp - annotatorCp) >= 80;
  const lampshade = learnedDisagrees
    ? `The engine gives ${evalLabel}. ${BROADSHEET.lampshade} ${BROADSHEET.lampshadeLearned}`
    : `The engine gives ${evalLabel}. ${BROADSHEET.lampshade}`;
  const moveNumber =
    !node.color || node.moveNumber === 0
      ? 1
      : node.color === "w"
        ? node.moveNumber
        : node.moveNumber + 1;
  const playMoveNumber = extra.length === 0 ? moveNumber : moveNumber + Math.floor((extra.length + (startSide === "b" ? 1 : 0)) / 2);

  const onStepPrev = useCallback(
    () => userSelect(stepMainline(selectedId, -1)),
    [userSelect, selectedId],
  );
  const onStepNext = useCallback(
    () => userSelect(stepMainline(selectedId, 1)),
    [userSelect, selectedId],
  );

  const liveBoard =
    selectedId !== FLAGSHIP_ID || extra.length > 0 || playing || playHint || previewHl !== null;

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
    <>
      <main id="the-game">
          <div
            data-opening-spread=""
            className="flex flex-col min-[700px]:flex-row min-[980px]:flex-row-reverse min-[980px]:items-stretch"
          >
            <aside
              data-testid="board-column"
              className="col-stack w-full shrink-0 min-[980px]:w-[min(520px,46%)] max-[699px]:contents"
            >
              <div className="flex flex-col gap-3 min-[980px]:gap-4 min-[980px]:sticky min-[980px]:top-3 newsprint-sticky z-10 max-[699px]:contents">
                <div className="board-engine-cluster" data-testid="board-engine-cluster">
                <div
                  data-sticky-board=""
                  onClick={
                    liveBoard || !staticBoard
                      ? undefined
                      : (e) => {
                          const t = e.target as HTMLElement;
                          if (t.closest('[data-testid="board-step-next"]')) onStepNext();
                          else if (t.closest('[data-testid="board-step-prev"]')) onStepPrev();
                          else if (t.closest("#play-board")) setPlayHint(true);
                        }
                  }
                >
                {liveBoard || !staticBoard ? (
                <BoardDiagram
                  plies={displayPlies}
                  highlight={highlight}
                  preview={previewHl}
                  caption={node.cap}
                  evalCp={node.eval}
                  evalLabel={annotatorLabel}
                  arrow={boardArrow}
                  legal={legal}
                  playable
                  playSide={side}
                  onPlay={onPlay}
                  onSquare={onPuzzleSquare}
                  puzzlePrompt={node.puzzle && extra.length === 0 ? node.puzzle.prompt : null}
                  puzzleNote={puzzleNote}
                  puzzleTarget={node.puzzle && extra.length === 0 ? node.puzzle.target : null}
                  onStepPrev={onStepPrev}
                  onStepNext={onStepNext}
                  canStepPrev={stepMainline(selectedId, -1) !== selectedId}
                  canStepNext={!atEnd}
                />
                ) : (
                  staticBoard
                )}
                </div>
                <GlassEngine
                  info={engine}
                  book={book}
                  side={side}
                  moveNumber={playMoveNumber}
                  lampshade={lampshade}
                  evalMode={evalMode}
                  onEvalMode={setEvalMode}
                  weightsStatus={weightsStatus}
                  down={engineDown}
                />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    data-play-control=""
                    data-testid="read-the-game"
                    data-hydrated={ready ? "true" : "false"}
                    aria-pressed={playing}
                    onClick={onReadTheGame}
                    className={cn(
                      "paper-control",
                      playing ? "bg-ink text-paper" : "bg-paper text-ink",
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
                      "paper-control",
                      playHint ? "bg-ink text-paper" : "bg-paper text-ink",
                    )}
                  >
                    <span aria-hidden>♟</span>
                    {BROADSHEET.playInvite}
                  </button>
                </div>
                {playHint ? (
                  <p className="font-display text-[16px] italic text-ink">{BROADSHEET.playHint}</p>
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
      <footer data-testid="paper-footer" className="paper-footer">
        <Closer />
        <Colophon />
      </footer>
      <WayfindIndex selectedId={selectedId} onSelect={userSelect} />
    </>
  );
}
