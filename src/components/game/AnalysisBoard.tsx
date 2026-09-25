"use client";

import { track } from "@vercel/analytics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EvalMode, SearchInfo } from "@/lib/chess/engine";
import { numberPv } from "@/lib/chess/notation";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { FILES, positionAfter, type Color, type Piece, type PieceType } from "@/lib/chess/replay";
import { loadLearnedNet, startSearch } from "@/lib/game/engine-client";
import type { Ply } from "@/lib/opening/types";
import { replayPlies, sideToMoveAfter } from "@/lib/game/plies";
import { EvalBar } from "./EvalBar";

type EngineApi = typeof import("@/lib/chess/engine");

const GLYPH: Record<PieceType, string> = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };
const NAME: Record<PieceType, string> = { K: "king", Q: "queen", R: "rook", B: "bishop", N: "knight", P: "pawn" };
const ORDER: PieceType[] = ["K", "Q", "R", "B", "N", "P"];

const sq = (file: number, rank: number) => `${FILES[file]}${rank}`;
const fileOf = (s: string) => FILES.indexOf(s[0]);
const rankOf = (s: string) => Number(s[1]);

function pieceAt(pieces: readonly Piece[], square: string) {
  return pieces.find((p) => !p.captured && p.square === square);
}

/** Short algebraic without check or disambiguation marks; enough to read back a move. */
function moveText(pieces: readonly Piece[], ply: Ply): string {
  const mover = pieceAt(pieces, ply.from);
  if (!mover) return `${ply.from}–${ply.to}`;
  if (mover.type === "K" && Math.abs(fileOf(ply.to) - fileOf(ply.from)) === 2) return fileOf(ply.to) > fileOf(ply.from) ? "O-O" : "O-O-O";
  const capture = Boolean(pieceAt(pieces, ply.to)) || (mover.type === "P" && ply.from[0] !== ply.to[0]);
  const promo = mover.type === "P" && (ply.to[1] === "8" || ply.to[1] === "1") ? "=Q" : "";
  const letter = mover.type === "P" ? (capture ? ply.from[0] : "") : mover.type;
  return `${letter}${capture ? "x" : ""}${ply.to}${promo}`;
}

/** Position as text for screen readers (brief §4.6). */
function describePosition(pieces: readonly Piece[]): string {
  const side = (c: Color) =>
    ORDER.flatMap((t) =>
      pieces
        .filter((p) => !p.captured && p.color === c && p.type === t)
        .map((p) => `${NAME[t]} ${p.square}`),
    ).join(", ");
  return `White: ${side("w")}. Black: ${side("b")}.`;
}

export type AnalysisBoardProps = {
  /** Engine plies from the start to the annotated position. */
  basePlies: readonly Ply[];
  /** Changes when the annotated position changes; resets any moves played since. */
  positionKey: string;
  /** Accessible name for the board. */
  label: string;
  /** Opens with Learned selected (the lab page). */
  initialMode?: EvalMode;
  size?: "pane" | "wide";
};

type Status = "idle" | "loading" | "ready" | "error";

export function AnalysisBoard({ basePlies, positionKey, label, initialMode = "handcrafted", size = "pane" }: AnalysisBoardProps) {
  const [extra, setExtra] = useState<Ply[]>([]);
  const [api, setApi] = useState<EngineApi | null>(null);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<EvalMode>(initialMode);
  const [net, setNet] = useState<NnueNet | null>(null);
  const [netFailed, setNetFailed] = useState(false);
  const [info, setInfo] = useState<SearchInfo | null>(null);
  const [finishedSearch, setFinishedSearch] = useState<string | null>(null);
  const [engineDown, setEngineDown] = useState(false);
  const [visible, setVisible] = useState(true);
  const [cursor, setCursor] = useState("e2");
  const [selected, setSelected] = useState<string | null>(null);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [announce, setAnnounce] = useState("");
  const squareRefs = useRef(new Map<string, HTMLButtonElement>());

  // A new chapter resets the board to its position (adjusted during render, not in an effect).
  const [shownKey, setShownKey] = useState(positionKey);
  if (shownKey !== positionKey) {
    setShownKey(positionKey);
    setExtra([]);
    setSelected(null);
    setAwaitingReply(false);
    setInfo(null);
  }

  const enginePlies = useMemo(() => [...basePlies, ...extra], [basePlies, extra]);
  const replay = useMemo(() => replayPlies(enginePlies), [enginePlies]);
  const pieces = useMemo(() => positionAfter(replay), [replay]);
  const side = sideToMoveAfter(enginePlies.length);

  const legal = useMemo(() => {
    if (!api) return [] as Ply[];
    const pos = api.fromPieces(pieces, side, replay[replay.length - 1] ?? null);
    return api.legalPlies(pos);
  }, [api, pieces, side, replay]);
  const outcome = useMemo(() => {
    if (!api) return null;
    return api.gameOutcome(api.fromPieces(pieces, side, replay[replay.length - 1] ?? null));
  }, [api, pieces, side, replay]);

  // Pause the search when the tab is hidden (brief §4.6).
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Weights only when Learned is chosen after the engine starts.
  useEffect(() => {
    if (!started || mode !== "learned" || net || netFailed) return;
    let cancelled = false;
    loadLearnedNet()
      .then((n) => {
        if (!cancelled) setNet(n);
      })
      .catch(() => !cancelled && setNetFailed(true));
    return () => {
      cancelled = true;
    };
  }, [started, mode, net, netFailed]);

  const effectiveMode: EvalMode = mode === "learned" && net ? "learned" : "handcrafted";
  const netStatus: Status = net ? "ready" : netFailed ? "error" : started && mode === "learned" ? "loading" : "idle";
  const waitingForNet = mode === "learned" && !net && netStatus === "loading";

  const play = useCallback(
    (ply: Ply, by: "you" | "engine") => {
      setAnnounce(`${by === "you" ? "You played" : "Engine played"} ${moveText(pieces, ply)}.`);
      setExtra((xs) => [...xs, ply]);
      setSelected(null);
    },
    [pieces],
  );

  // One bounded search per position; the engine replies after the visitor's move. "Thinking" is
  // derived: true until the search for the current inputs reports done.
  const searchKey = `${enginePlies.length}:${replay.map((p) => p.from + p.to).join("")}:${effectiveMode}:${net ? 1 : 0}:${awaitingReply ? 1 : 0}`;
  const searching = started && visible && !outcome && !waitingForNet;
  const thinking = searching && finishedSearch !== searchKey;
  useEffect(() => {
    if (!searching) return;
    let latest: SearchInfo | null = null;
    const cancel = startSearch({ plies: replay, side, mode: effectiveMode, net }, (e) => {
      if (e.type === "info") {
        latest = { depth: e.depth, nodes: e.nodes, nps: e.nps, evalCp: e.evalCp, pv: e.pv, best: e.best, thinking: e.thinking, evalMode: e.evalMode };
        setInfo(latest);
        return;
      }
      setFinishedSearch(searchKey);
      if (e.type === "error") {
        setEngineDown(true);
        return;
      }
      if (awaitingReply && latest?.best) {
        setAwaitingReply(false);
        play(latest.best, "engine");
      }
    });
    return cancel;
    // replay identity changes with every move; the rest are the search inputs.
  }, [searching, searchKey, replay, side, effectiveMode, net, awaitingReply, play]);

  async function start() {
    setStarted(true);
    track("engine_start");
    setApi(await import("@/lib/chess/engine"));
    setAnnounce("Engine started. Select a piece, then a square. Arrow keys move around the board.");
  }

  const targets = useMemo(
    () => new Set(selected ? legal.filter((p) => p.from === selected).map((p) => p.to) : []),
    [legal, selected],
  );
  const canMove = started && Boolean(api) && !awaitingReply && !outcome;

  function activate(square: string) {
    if (!canMove) return;
    if (selected && targets.has(square)) {
      setAwaitingReply(true);
      play({ from: selected, to: square }, "you");
      return;
    }
    const p = pieceAt(pieces, square);
    if (p && p.color === side && legal.some((l) => l.from === square)) {
      setSelected(square === selected ? null : square);
      setAnnounce(square === selected ? "Selection cleared." : `${NAME[p.type]} on ${square} selected.`);
    } else {
      setSelected(null);
    }
  }

  function onKeyDown(event: React.KeyboardEvent, square: string) {
    const f = fileOf(square);
    const r = rankOf(square);
    const moves: Record<string, [number, number]> = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (event.key in moves) {
      event.preventDefault();
      const [df, dr] = moves[event.key];
      const next = sq(Math.min(7, Math.max(0, f + df)), Math.min(8, Math.max(1, r + dr)));
      setCursor(next);
      squareRefs.current.get(next)?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(square);
    } else if (event.key === "Escape") {
      setSelected(null);
    }
  }

  const squares = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const s = sq(file, rank);
      const piece = pieceAt(pieces, s);
      const dark = (file + rank) % 2 === 1;
      const cls = [
        "gb-sq",
        dark ? "gb-dark" : "gb-light",
        selected === s ? "gb-selected" : "",
        targets.has(s) ? "gb-target" : "",
      ].join(" ");
      const glyph = piece ? (
        <span className={piece.color === "w" ? "gb-piece gb-white" : "gb-piece gb-black"} aria-hidden="true">
          {`${GLYPH[piece.type]}︎`}
        </span>
      ) : null;
      if (!started) {
        squares.push(
          <div key={s} className={cls} data-square={s}>
            {glyph}
          </div>,
        );
        continue;
      }
      const name = piece ? `${piece.color === "w" ? "white" : "black"} ${NAME[piece.type]}` : "empty";
      squares.push(
        <button
          key={s}
          type="button"
          ref={(el) => {
            if (el) squareRefs.current.set(s, el);
          }}
          className={cls}
          data-square={s}
          tabIndex={s === cursor ? 0 : -1}
          aria-label={`${s}, ${name}${targets.has(s) ? ", legal move" : ""}`}
          aria-pressed={selected === s}
          onClick={() => {
            setCursor(s);
            activate(s);
          }}
          onKeyDown={(e) => onKeyDown(e, s)}
        >
          {glyph}
        </button>,
      );
    }
  }

  const moveNumber = Math.floor(enginePlies.length / 2) + 1;
  const pvText = info?.pv.length ? numberPv(info.pv.slice(0, 8), side, moveNumber) : "";
  const turn = outcome
    ? outcome === "1/2-1/2"
      ? "Draw."
      : `${outcome === "1-0" ? "White" : "Black"} wins.`
    : awaitingReply
      ? "Engine thinking…"
      : `${side === "w" ? "White" : "Black"} to move${started ? ": your move" : ""}.`;

  return (
    <div className={size === "wide" ? "gb gb-wide" : "gb"}>
      <div className="gb-frame">
        <EvalBar evalCp={started && info ? info.evalCp : null} />
        <div
          className="gb-board"
          role={started ? "group" : "img"}
          aria-label={started ? `${label}. Chessboard, ${turn}` : label}
        >
          {squares}
        </div>
      </div>
      <p className="sr-only">{describePosition(pieces)}</p>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      {!started ? (
        <div className="gb-start">
          <button type="button" className="btn" onClick={start}>
            Start engine
          </button>
          <p className="note">Runs a small chess engine in your browser. Nothing loads until you press it.</p>
        </div>
      ) : (
        <div className="gb-panel">
          <fieldset className="gb-toggle">
            <legend className="sr-only">Evaluation</legend>
            {(["handcrafted", "learned"] as const).map((m) => (
              <label key={m} className={mode === m ? "chip chip-active" : "chip"}>
                <input type="radio" name={`eval-${label}`} value={m} checked={mode === m} onChange={() => {
                    setMode(m);
                    if (m === "learned") setNetFailed(false);
                  }} className="sr-only" />
                {m === "handcrafted" ? "Handcrafted (PeSTO)" : "Learned (NNUE)"}
              </label>
            ))}
          </fieldset>
          <p className="gb-status">{turn}</p>
          {mode === "learned" && netStatus === "loading" ? <p className="note">Loading the learned weights…</p> : null}
          {mode === "learned" && netStatus === "error" ? (
            <p className="note">The learned weights did not load. The handcrafted evaluation is still running.</p>
          ) : null}
          {engineDown ? <p className="note">The engine stopped. Reload the page to restart it.</p> : null}
          <dl className="gb-stats">
            <div>
              <dt>Eval</dt>
              <dd>{info ? `${info.evalCp >= 0 ? "+" : ""}${(info.evalCp / 100).toFixed(2)}` : "…"}</dd>
            </div>
            <div>
              <dt>Depth</dt>
              <dd>{info?.depth ?? "…"}</dd>
            </div>
            <div>
              <dt>Nodes/s</dt>
              <dd>{info ? info.nps.toLocaleString("en-GB") : "…"}</dd>
            </div>
          </dl>
          <p className="gb-pv">
            <span className="sr-only">Principal variation: </span>
            {pvText || (thinking ? "Searching…" : "")}
          </p>
          {extra.length ? (
            <button
              type="button"
              className="copy-link"
              onClick={() => {
                setExtra([]);
                setAwaitingReply(false);
                setAnnounce("Back to the annotated position.");
              }}
            >
              Back to the annotated position
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
