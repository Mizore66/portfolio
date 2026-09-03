"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BoardDiagram } from "@/components/opening/BoardDiagram";
import { GlassEngine, useEngineSearch, useNnueWeights } from "@/components/opening/GlassEngine";
import { BROADSHEET } from "@/content/opening";
import type { EvalMode } from "@/lib/chess/engine";
import { formatEvalCp } from "@/lib/chess/engine-view";
import { PHASE2_DEFAULT_EVAL, PHASE2_EXHIBITS } from "@/lib/chess/phase2";
import { isChessKeyTarget } from "@/lib/chess/keys";
import { emitDesk } from "@/lib/desk";
import { playDelayMs } from "@/lib/opening/motion";
import {
  collectPlies,
  FLAGSHIP_ID,
  getNode,
  nextMainlineBook,
  ROOT_ID,
  sideToMove,
  stepMainline,
} from "@/lib/opening/tree";

export function HeroEngine({ staticBoard }: { staticBoard: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState(FLAGSHIP_ID);
  const [evalMode, setEvalMode] = useState<EvalMode>(PHASE2_DEFAULT_EVAL);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = window.setTimeout(() => setPlaying(true), 900);
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (!isChessKeyTarget(e.target)) return;
      e.preventDefault();
      setPlaying(false);
      setId((current) => stepMainline(current, e.key === "ArrowRight" ? 1 : -1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const node = getNode(id);
  const plies = useMemo(() => collectPlies(id), [id]);
  const side = sideToMove(id);
  const book = nextMainlineBook(id);
  const wantLearned = PHASE2_EXHIBITS && evalMode === "learned";
  const { net, status: weightsStatus } = useNnueWeights(wantLearned);
  const using: EvalMode = wantLearned && net ? "learned" : "handcrafted";
  const { info, down } = useEngineSearch(plies, side, using, net);

  const onPrev = useCallback(() => {
    setPlaying(false);
    setId((current) => stepMainline(current, -1));
  }, []);
  const onNext = useCallback(() => {
    setPlaying(false);
    setId((current) => stepMainline(current, 1));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const wait = playDelayMs(Math.max(1, node.plies.length));
    const t = window.setTimeout(() => {
      if (!playingRef.current) return;
      setId((current) => {
        const next = stepMainline(current, 1);
        return next === current ? ROOT_ID : next;
      });
    }, wait);
    return () => window.clearTimeout(t);
  }, [playing, id, node.plies.length]);

  useEffect(() => {
    emitDesk({
      type: "board",
      id,
      san: node.san,
      evalCp: info?.evalCp ?? Math.round(node.eval * 100),
    });
  }, [id, node.san, node.eval, info?.evalCp]);

  const annotatorLabel = `${node.eval >= 0 ? "+" : ""}${node.eval.toFixed(2)}`;
  const liveLabel = info ? formatEvalCp(info.evalCp) : annotatorLabel;
  const moveNumber =
    !node.color || node.moveNumber === 0 ? 1 : node.color === "w" ? node.moveNumber : node.moveNumber + 1;

  return (
    <aside className="hero-engine" id="the-game" data-testid="hero-engine">
      <p className="band-kicker">Analysis board</p>
      <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
        {BROADSHEET.heroBoardKicker}
      </p>
      <div className="hero-engine-board mt-3" data-chess-keys>
        {ready ? (
          <BoardDiagram
            planeId="hero-board"
            plies={plies}
            highlight={node.hl}
            caption={node.cap}
            evalCp={info ? info.evalCp / 100 : node.eval}
            evalLabel={liveLabel}
            arrow={book?.plies[0] ?? null}
            playable={false}
            onStepPrev={onPrev}
            onStepNext={onNext}
            canStepPrev={stepMainline(id, -1) !== id}
            canStepNext={stepMainline(id, 1) !== id}
          />
        ) : (
          staticBoard
        )}
      </div>
      <p className="mt-3">
        <button
          type="button"
          className="masthead-chip"
          data-testid="hero-play"
          aria-pressed={playing}
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? BROADSHEET.pauseGame : BROADSHEET.playInvite}
        </button>
      </p>
      <p className="hero-engine-chip mt-3" data-testid="hero-engine-chip">
        {BROADSHEET.heroResultChip}
      </p>
      {ready ? (
        <div className="mt-3" data-chess-keys>
          <GlassEngine
            info={info}
            book={book}
            side={side}
            moveNumber={moveNumber}
            lampshade=""
            evalMode={evalMode}
            onEvalMode={setEvalMode}
            weightsStatus={weightsStatus}
            down={down}
            compact
          />
        </div>
      ) : null}
      <p
        className="mt-3 max-w-[42ch] font-display text-[15px] leading-snug text-ink"
        data-testid="hero-engine-caption"
      >
        {BROADSHEET.heroCaption}
      </p>
      <p className="mt-2 max-w-[42ch] font-display text-[14px] italic text-faded">
        {BROADSHEET.heroFollowThrough}
      </p>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        <a
          href="/lab/learned-evaluator"
          className="masthead-chip masthead-chip-primary"
          data-testid="hero-experiment"
        >
          Read the experiment
        </a>
        <a href={BROADSHEET.paperHref} className="masthead-chip" data-testid="read-the-paper">
          {BROADSHEET.paperLink}
        </a>
      </p>
      <p className="mt-2 max-w-[42ch] font-mono text-[12px] text-faded">{BROADSHEET.paperLinkDek}</p>
    </aside>
  );
}
