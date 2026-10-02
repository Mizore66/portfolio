"use client";

// Play's controls (lab2-7, lab2-7-m): opponent, side, the moves, the status and Start. Drawn in both layers like all
// the Lab's type; the ink copy mounts the game and holds it, and both read the same state. Only the ink copy is
// clicked (the paper copy is inert, and lets the pointer through to it).
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { EvalMode } from "@/lib/chess/engine";
import type { ChapterCopy } from "./Lab";
import { share } from "./kit";
import { lastMove, mountPlay, movesText, pawns, picker, seamPct, store, type Opening, type PlayState } from "./game";

type Game = ReturnType<typeof mountPlay>;

/** a copy template with its scores and moves set in mono, as the key frames set them */
function fill(t: string, v: Record<string, string>, mono: string[]) {
  return t.split(/(\{\w+\})/).map((part, i) => {
    const k = part.match(/^\{(\w+)\}$/)?.[1];
    if (!k) return part;
    return mono.includes(k) ? <span key={i} className="mono">{v[k]}</span> : v[k];
  });
}

function status(c: ChapterCopy, s: PlayState, phone: boolean) {
  const net = (s.opp === "learned" ? c.learned : c.handcrafted) as string, side = (s.white ? c.white : c.black) as string;
  const v = { net: net.toLowerCase(), side, eval: pawns(s.cp, s.white), best: s.best };
  const t = (k: string) => fill(c[k] as string, v, ["eval", "best"]);
  switch (s.phase) {
    case "loading": return t("loading");
    case "thinking": return t("thinking");
    case "won": case "lost": return t(s.phase);
    case "drawn": return t(({ repetition: "drawnRepetition", fifty: "drawnFifty", material: "drawnMaterial", stalemate: "drawn" } as const)[s.why ?? "stalemate"]);
    case "idle":
      // the engine to move first: at the start when you are Black, or after an opening, whichever side is to play
      if (s.opening ? (s.sans.length % 2 === 0) !== s.white : !s.white) return t(s.opening ? "openingWait" : "statusWait");
  }
  if (s.phase === "you" && !s.best) return t("yourMove"); // its line was too short to name your reply yet, or an opening's scores are on their way
  return t(phone ? "statusPhone" : "status");
}

/**
 * The opening to start from (the owner, 2026-10-01: every named line, searchable). Closed, it names the opening; open,
 * a search over Lichess's list with the six best matches, and the start position when nothing is typed. The ink copy
 * holds the real field; the paper copy, which is what shows on the dark side, draws what is typed and the caret.
 */
function OpeningPick({ inv, c, s, game }: { inv: boolean; c: ChapterCopy; s: PlayState; game: React.RefObject<Game | null> }) {
  const input = useRef<HTMLInputElement>(null), [caret, setCaret] = useState(0);
  useEffect(() => { if (!inv && s.picking) input.current?.focus(); }, [inv, s.picking]);
  const home = c.startPosition as string, name = s.opening?.name ?? home;
  const rows: (Opening | null)[] = s.query ? s.hits : [null, ...s.hits.slice(0, 5)]; // null: the start position
  // lines filed under one name (the Najdorf has five) are told apart by their last move
  const twin = (o: Opening) => s.hits.filter((h) => h.name === o.name).length > 1;
  const pick = (o: Opening | null) => { const g = game.current; if (g) g.setOpening(o); else picker.close(); };
  if (!s.picking) {
    return (
      <div className="opt opening">{c.opening as string}
        <div><button type="button" className="on" aria-haspopup="listbox" aria-expanded="false" onClick={() => picker.open()}>{name}</button></div>
      </div>
    );
  }
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); picker.step(e.key === "ArrowDown" ? 1 : -1, rows.length); }
    else if (e.key === "Enter") { e.preventDefault(); if (rows.length) pick(rows[s.active] ?? null); }
    else if (e.key === "Escape") { e.preventDefault(); picker.close(); }
  };
  const sync = () => setCaret(input.current?.selectionStart ?? s.query.length);
  return (
    <div className="opt opening open">{c.opening as string}
      <div className="find">
        {inv ? (
          <span className="field" aria-hidden="true">
            {s.query ? <>{s.query.slice(0, caret)}<i className="caret" />{s.query.slice(caret)}</> : <><i className="caret" /><span className="ph">{c.openingSearch as string}</span></>}
          </span>
        ) : (
          <input ref={input} className="field" type="text" value={s.query} placeholder={c.openingSearch as string} spellCheck={false} autoComplete="off"
            role="combobox" aria-expanded="true" aria-controls="opening-hits" aria-activedescendant={rows.length ? `opening-${s.active}` : undefined}
            aria-label={c.opening as string} onChange={(e) => { picker.type(e.target.value); setCaret(e.target.selectionStart ?? e.target.value.length); }}
            onKeyDown={key} onKeyUp={sync} onSelect={sync} onBlur={() => setTimeout(() => { if (store.get().picking) picker.close(); }, 150)} />
        )}
      </div>
      <ul className="hits" role="listbox" id={inv ? undefined : "opening-hits"} aria-label={c.opening as string}>
        {rows.map((o, i) => (
          // an option is picked by pointer or by the field's keys (the field keeps the focus: aria-activedescendant)
          <li key={o ? o.plies.map((p) => p.from + p.to).join("") : "home"} id={inv ? undefined : `opening-${i}`} role="option" aria-selected={i === s.active} className={i === s.active ? "on" : ""}
            onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}>
            <span className="eco">{o?.eco ?? ""}</span><span className="nm">{o?.name ?? home}{o && twin(o) ? <span className="last"> {lastMove(o)}</span> : null}</span>
          </li>
        ))}
        {s.query && !s.hits.length ? <li className="none">{c.openingNone as string}</li> : null}
      </ul>
    </div>
  );
}

export function Play({ inv, copy: c }: { inv: boolean; copy: ChapterCopy }) {
  const s = useSyncExternalStore(store.sub, store.get, store.server);
  const ref = useRef<HTMLDivElement>(null), game = useRef<Game | null>(null);
  useEffect(() => {
    if (inv) return;
    const pin = ref.current!.closest<HTMLElement>(".ch-pin")!;
    // held by this copy, not the module: a Play leaving (the page it was on) cannot take the arriving one's game
    // with it, and a module reloaded in development cannot leave the controls without one
    const g = mountPlay(pin, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    game.current = g;
    return () => { g.dispose(); if (game.current === g) game.current = null; };
    // `store` too: in development a reload of game.ts gives it a new store, and the game must be mounted on that one
  }, [inv, store]);

  const opt = (label: string, items: [string, boolean, () => void][]) => (
    <div className="opt">{label}<div>{items.map(([t, on, go]) => <button key={t} type="button" className={on ? "on" : ""} aria-pressed={on} onClick={go}>{t}</button>)}</div></div>
  );
  const setOpp = (o: EvalMode) => () => game.current?.setOpp(o), setWhite = (w: boolean) => () => game.current?.setWhite(w);
  const over = s.phase === "won" || s.phase === "lost" || s.phase === "drawn";
  const ev = `${pawns(s.seamCp, true)} · ${seamPct(s.seamCp)}`;
  return (
    <div ref={ref} className="play" data-picking={s.picking || undefined}>
      <div className="ctl">
        <div className="opts">
          {opt(c.opponent as string, [[c.learned as string, s.opp === "learned", setOpp("learned")], [c.handcrafted as string, s.opp === "handcrafted", setOpp("handcrafted")]])}
          {opt(c.youPlay as string, [[c.white as string, s.white, setWhite(true)], [c.black as string, !s.white, setWhite(false)]])}
        </div>
        <div className="bot">
          <OpeningPick inv={inv} c={c} s={s} game={game} />
          {/* the game's account: a column of its own beside the options on a tablet (lab.css) */}
          <div className="say">
          <div className="moves ev-ph">{c.seamLabel as string} · {ev}</div>
          <div className="moves">{movesText(s.sans)}</div>
          <p className="status" aria-live={inv ? undefined : "polite"}><span className="wide">{status(c, s, false)}</span><span className="narrow">{status(c, s, true)}</span></p>
          {!s.started || over ? (
            <button type="button" className="start" disabled={s.phase === "loading"} onClick={() => (over ? game.current?.again() : game.current?.start())}>{(over ? c.again : c.start) as string}</button>
          ) : null}
          {!s.started ? <p className="note start-note">{c.startNote as string}</p> : null}
          </div>
        </div>
      </div>
      {/* the label rides the seam; it steps above the note when the seam runs left of it, and flips at the right edge */}
      <div className={`ev mono${share(s.seamCp) < 0.27 ? " low" : ""}${share(s.seamCp) > 0.86 ? " end" : ""}`}>{ev}</div>
    </div>
  );
}
