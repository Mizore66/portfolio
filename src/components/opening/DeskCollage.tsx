"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DESK_EVENT, PROJECT_DESK, SECTION_MOVE, type DeskEvent } from "@/lib/desk";

type NetworkInformation = EventTarget & { saveData?: boolean };

function connection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function subscribe(onStoreChange: () => void) {
  const nav = connection();
  nav?.addEventListener("change", onStoreChange);
  const mq = window.matchMedia("(prefers-reduced-data: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => {
    nav?.removeEventListener("change", onStoreChange);
    mq.removeEventListener("change", onStoreChange);
  };
}

function skipDecor(): boolean {
  if (connection()?.saveData === true) return true;
  return window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

const PV_PATHS: { id: string; d: string }[] = [
  { id: "start", d: "M40 40 L40 92" },
  { id: "e4", d: "M40 92 L40 148" },
  { id: "e5", d: "M40 148 L40 204" },
  { id: "nf3", d: "M40 204 L40 260" },
  { id: "nc6", d: "M40 260 L40 316" },
  { id: "bc4", d: "M40 316 L40 372" },
  { id: "bc5", d: "M40 372 L86 410" },
  { id: "oo", d: "M40 372 L40 428" },
  { id: "nf6", d: "M40 428 L40 484" },
  { id: "d4", d: "M40 484 L40 560" },
  { id: "alekhine", d: "M40 92 L96 132" },
  { id: "elephant", d: "M40 204 L96 244" },
  { id: "bb6", d: "M40 560 L8 604" },
  { id: "exd4", d: "M40 560 L40 640" },
  { id: "re1", d: "M40 640 L40 720" },
  { id: "work", d: "M40 484 L40 560" },
  { id: "experience", d: "M40 260 L40 316" },
  { id: "lab", d: "M40 40 L40 92" },
  { id: "about", d: "M40 148 L40 204" },
  { id: "contact", d: "M40 640 L40 720" },
];

export function DeskCollage() {
  const skip = useSyncExternalStore(subscribe, skipDecor, () => false);
  const layerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("d4");
  const [hover, setHover] = useState<{ san: string; datum: string } | null>(null);
  const [evalCp, setEvalCp] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: fine)");
    const apply = () => {
      setReduced(motion.matches);
      setFinePointer(pointer.matches);
    };
    apply();
    motion.addEventListener("change", apply);
    pointer.addEventListener("change", apply);
    return () => {
      motion.removeEventListener("change", apply);
      pointer.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    function onDesk(event: Event) {
      const detail = (event as CustomEvent<DeskEvent>).detail;
      if (!detail) return;
      if (detail.type === "board") {
        setActive(detail.id);
        setEvalCp(detail.evalCp);
        const layer = layerRef.current;
        if (layer && !reduced) {
          layer.dataset.draw = "1";
          window.setTimeout(() => {
            delete layer.dataset.draw;
          }, 240);
        }
      } else if (detail.type === "section") {
        setActive(SECTION_MOVE[detail.id] ?? detail.id);
      } else if (detail.type === "project") {
        if (!detail.slug) {
          setHover(null);
          return;
        }
        const mapped = PROJECT_DESK[detail.slug];
        if (mapped) {
          setHover({ san: mapped.san, datum: mapped.datum });
          setActive(mapped.node);
        }
      }
    }
    window.addEventListener(DESK_EVENT, onDesk);
    return () => window.removeEventListener(DESK_EVENT, onDesk);
  }, [reduced]);

  useEffect(() => {
    const ids = ["work", "experience", "lab", "about", "contact"];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) emitSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.15, 0.4] },
    );
    for (const node of nodes) io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    function onVis() {
      setHidden(document.hidden);
    }
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (skip || reduced || hidden || !finePointer) return;
    const layer = layerRef.current;
    if (!layer) return;
    let frame = 0;
    const layerEl = layer;
    function onMove(e: PointerEvent) {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const x = (e.clientX / window.innerWidth - 0.5) * 8;
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        layerEl.style.setProperty("--desk-parx", `${Math.max(-4, Math.min(4, x))}px`);
        layerEl.style.setProperty("--desk-pary", `${Math.max(-4, Math.min(4, y))}px`);
        const edge = Math.min(e.clientX, e.clientY, window.innerWidth - e.clientX, window.innerHeight - e.clientY);
        document.documentElement.style.setProperty(
          "--sheet-shadow",
          edge < 96 ? "0 22px 52px rgba(28, 14, 8, 0.62)" : "0 16px 40px rgba(28, 14, 8, 0.48)",
        );
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
      layer.style.removeProperty("--desk-parx");
      layer.style.removeProperty("--desk-pary");
      document.documentElement.style.removeProperty("--sheet-shadow");
    };
  }, [skip, reduced, hidden, finePointer]);

  const wash =
    evalCp == null
      ? "transparent"
      : evalCp >= 0
        ? "rgba(139, 36, 28, 0.03)"
        : "rgba(30, 58, 114, 0.03)";

  return (
    <div
      ref={layerRef}
      className={skip ? "desk-plain" : "desk-collage"}
      aria-hidden="true"
      data-desk-hidden={hidden ? "true" : undefined}
      data-desk-reduced={reduced ? "true" : undefined}
      style={{ ["--desk-eval" as string]: wash }}
    >
      {skip || hidden ? null : (
        <>
          <div className="desk-eval-wash" />
          <svg className="desk-pv" viewBox="0 0 160 760" preserveAspectRatio="xMinYMid meet">
            {PV_PATHS.map((path) => (
              <path
                key={path.id}
                d={path.d}
                data-active={path.id === active ? "true" : undefined}
                fill="none"
                stroke="currentColor"
              />
            ))}
          </svg>
          <svg className="desk-pv desk-pv-right" viewBox="0 0 160 760" preserveAspectRatio="xMaxYMid meet">
            {PV_PATHS.map((path) => (
              <path
                key={`r-${path.id}`}
                d={path.d}
                data-active={path.id === active ? "true" : undefined}
                fill="none"
                stroke="currentColor"
              />
            ))}
          </svg>
          <span className="desk-reg desk-reg-tl" />
          <span className="desk-reg desk-reg-tr" />
          <span className="desk-reg desk-reg-bl" />
          <span className="desk-reg desk-reg-br" />
          {hover ? (
            <p className="desk-hover-note">
              {hover.san}
              <span> · {hover.datum}</span>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function emitSection(id: string) {
  window.dispatchEvent(new CustomEvent<DeskEvent>(DESK_EVENT, { detail: { type: "section", id } }));
}
