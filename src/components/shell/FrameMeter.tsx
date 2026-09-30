"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { traced } from "@/lib/perf/trace";

/**
 * The frame-rate readout for testing on real devices (phase 6, step 5). Off unless the address carries `?fps`
 * (kept for the tab until `?fps=0`). It times every frame and files it under the place on screen: the page and
 * the one page's section, or the page change under way. "Copy report" puts a table of every place on the
 * clipboard, with the device, to paste back, and below it the slowest frames, each with what ran in it: the page's
 * own log of its heavy moments (trace.ts) and the browser's account of the main thread's work in it (long animation
 * frames, in Chrome). A slow frame with little main-thread work was waiting on the GPU.
 */
const KEY = "fps-meter";
type Stats = { d: number[] };
const places = new Map<string, Stats>();
type Slow = { d: number; where: string; at: number; ran: string[] };
const slow: Slow[] = [];
type Script = { invoker: string; sourceFunctionName: string; duration: number };
type LoAF = PerformanceEntry & { renderStart: number; styleAndLayoutStart: number; scripts: Script[] };
const loafs: LoAF[] = [];
let loafOn = false; // the browser reports long animation frames (Chrome)

const pct = (s: number[], p: number) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
function summary(d: number[]) {
  const s = [...d].sort((a, b) => a - b), total = d.reduce((a, b) => a + b, 0);
  return { n: d.length, fps: (1000 * d.length) / total, p50: pct(s, 0.5), p95: pct(s, 0.95), p99: pct(s, 0.99), worst: s[s.length - 1], over33: d.filter((x) => x > 33.4).length, over50: d.filter((x) => x > 50).length };
}

function place() {
  const site = document.querySelector(".site");
  const where = location.pathname + (location.pathname === "/" ? location.hash || "#top" : "");
  return site?.hasAttribute("data-seam-moving") ? `page change to ${where}` : where;
}

function device() {
  let gpu = "unknown";
  try {
    const c = document.createElement("canvas"), gl = c.getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    if (gl && ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch { /* no WebGL */ }
  const n = navigator as Navigator & { deviceMemory?: number };
  return `${navigator.userAgent}\n${innerWidth}×${innerHeight} at ${devicePixelRatio}x · ${n.hardwareConcurrency ?? "?"} cores · ${n.deviceMemory ?? "?"} GB · GPU ${gpu}`;
}

// What the browser says the main thread did in a slow frame: how long it was busy, its scripts (the heaviest three),
// and style and layout.
function thread(from: number, to: number) {
  const hit = loafs.filter((e) => e.startTime < to && e.startTime + e.duration > from);
  if (!loafOn) return "not reported by this browser";
  if (!hit.length) return "no long main-thread work: it waited on the GPU or the compositor";
  const ms = (x: number) => `${Math.round(x)} ms`;
  const scripts = hit.flatMap((e) => e.scripts).sort((a, b) => b.duration - a.duration);
  const script = scripts.reduce((a, x) => a + x.duration, 0);
  const layout = hit.reduce((a, e) => a + (e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), 0);
  const busy = hit.reduce((a, e) => a + e.duration, 0);
  const top = scripts.slice(0, 3).map((x) => `${x.invoker}${x.sourceFunctionName ? ` (${x.sourceFunctionName})` : ""} ${ms(x.duration)}`).join(", ");
  return `busy ${ms(busy)}: scripts ${ms(script)}${top ? ` [${top}]` : ""}, style and layout ${ms(layout)}`;
}

function slowest() {
  const worst = [...slow].sort((a, b) => b.d - a.d).slice(0, 5);
  if (!worst.length) return [];
  return ["", "Slowest frames: when (seconds after load), where, then what ran in it.", ...worst.flatMap((f) => [
    `${Math.round(f.d)} ms at ${(f.at / 1000).toFixed(1)} s, ${f.where}`,
    `  logged: ${f.ran.length ? f.ran.join("; ") : "nothing"}`,
    `  main thread: ${thread(f.at - f.d, f.at)}`,
  ])];
}

function report() {
  const pad = (v: string | number, w: number) => String(v).padStart(w);
  const rows = [...places].filter(([, s]) => s.d.length > 10).map(([k, s]) => {
    const m = summary(s.d);
    return `${k.padEnd(34)}${pad(m.n, 7)}${pad(m.fps.toFixed(1), 7)}${pad(m.p50.toFixed(1), 7)}${pad(m.p95.toFixed(1), 7)}${pad(m.p99.toFixed(1), 7)}${pad(m.worst.toFixed(0), 7)}${pad(m.over33, 7)}${pad(m.over50, 7)}`;
  });
  return [`anasqumhiyeh.dev frame report, ${new Date().toISOString()}`, device(), "",
    `${"place".padEnd(34)}${pad("frames", 7)}${pad("fps", 7)}${pad("p50", 7)}${pad("p95", 7)}${pad("p99", 7)}${pad("worst", 7)}${pad(">33", 7)}${pad(">50", 7)}`, ...rows,
    "", "Frame times in ms. >33 and >50: frames slower than 30 and 20 fps.", ...slowest()].join("\n");
}

// ?fps turns it on for the tab and ?fps=0 off; read on the client only (the server always renders nothing)
const noSub = () => () => {};
function wanted() {
  const q = new URLSearchParams(location.search).get("fps");
  if (q === "0") sessionStorage.removeItem(KEY); else if (q != null) sessionStorage.setItem(KEY, "1");
  return sessionStorage.getItem(KEY) === "1";
}

export function FrameMeter() {
  const [closed, setClosed] = useState(false);
  const on = useSyncExternalStore(noSub, wanted, () => false) && !closed;
  const [live, setLive] = useState({ where: "", fps: 0, p95: 0, worst: 0 });
  const [copied, setCopied] = useState(""), [text, setText] = useState("");

  useEffect(() => {
    if (!on) return;
    let raf = 0, last = 0, window1: number[] = [], shown = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const d = t - last; last = t;
      if (!d || d > 1000 || document.hidden) return; // the first frame, and time away from the tab
      const k = place();
      (places.get(k) ?? places.set(k, { d: [] }).get(k)!).d.push(d);
      if (d > 50) { slow.push({ d, where: k, at: t, ran: traced(t - d, t) }); if (slow.length > 200) slow.splice(0, 100); }
      window1.push(d);
      if (t - shown > 500) {
        shown = t;
        const m = summary(window1.slice(-120));
        setLive({ where: k, fps: m.fps, p95: m.p95, worst: m.worst });
        window1 = window1.slice(-120);
      }
    };
    raf = requestAnimationFrame(tick);
    let po: PerformanceObserver | undefined;
    try {
      po = new PerformanceObserver((l) => { loafs.push(...(l.getEntries() as LoAF[])); if (loafs.length > 400) loafs.splice(0, 200); });
      po.observe({ type: "long-animation-frame", buffered: true }); loafOn = PerformanceObserver.supportedEntryTypes.includes("long-animation-frame");
    } catch { /* not Chrome: the log alone */ }
    return () => { cancelAnimationFrame(raf); po?.disconnect(); };
  }, [on]);

  if (!on) return null;
  const copy = () => {
    const text = report();
    navigator.clipboard.writeText(text).then(() => setCopied("Copied"), () => { setCopied("Copy it below"); setText(text); });
    setTimeout(() => setCopied(""), 2500);
  };
  const close = () => { sessionStorage.removeItem(KEY); setClosed(true); };
  return (
    <div className="frame-meter mono" role="status" aria-label="Frame rate">
      <b>{live.fps.toFixed(0)} fps</b> <span>p95 {live.p95.toFixed(1)} ms · worst {live.worst.toFixed(0)} ms</span>
      <span className="fm-where">{live.where}</span>
      <span className="fm-buttons">
        <button type="button" onClick={copy}>{copied || "Copy report"}</button>
        <button type="button" onClick={() => { places.clear(); slow.length = 0; setLive({ where: "", fps: 0, p95: 0, worst: 0 }); }}>Reset</button>
        <button type="button" onClick={close}>Close</button>
      </span>
      {text ? <textarea readOnly value={text} aria-label="Frame report" onFocus={(e) => e.currentTarget.select()} /> : null}
    </div>
  );
}
