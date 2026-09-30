"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * The frame-rate readout for testing on real devices (phase 6, step 5). Off unless the address carries `?fps`
 * (kept for the tab until `?fps=0`). It times every frame and files it under the place on screen: the page and
 * the one page's section, or the page change under way. "Copy report" puts a table of every place on the
 * clipboard, with the device, to paste back.
 */
const KEY = "fps-meter";
type Stats = { d: number[] };
const places = new Map<string, Stats>();

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

function report() {
  const pad = (v: string | number, w: number) => String(v).padStart(w);
  const rows = [...places].filter(([, s]) => s.d.length > 10).map(([k, s]) => {
    const m = summary(s.d);
    return `${k.padEnd(34)}${pad(m.n, 7)}${pad(m.fps.toFixed(1), 7)}${pad(m.p50.toFixed(1), 7)}${pad(m.p95.toFixed(1), 7)}${pad(m.p99.toFixed(1), 7)}${pad(m.worst.toFixed(0), 7)}${pad(m.over33, 7)}${pad(m.over50, 7)}`;
  });
  return [`anasqumhiyeh.dev frame report, ${new Date().toISOString()}`, device(), "",
    `${"place".padEnd(34)}${pad("frames", 7)}${pad("fps", 7)}${pad("p50", 7)}${pad("p95", 7)}${pad("p99", 7)}${pad("worst", 7)}${pad(">33", 7)}${pad(">50", 7)}`, ...rows,
    "", "Frame times in ms. >33 and >50: frames slower than 30 and 20 fps."].join("\n");
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
      window1.push(d);
      if (t - shown > 500) {
        shown = t;
        const m = summary(window1.slice(-120));
        setLive({ where: k, fps: m.fps, p95: m.p95, worst: m.worst });
        window1 = window1.slice(-120);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
        <button type="button" onClick={() => { places.clear(); setLive({ where: "", fps: 0, p95: 0, worst: 0 }); }}>Reset</button>
        <button type="button" onClick={close}>Close</button>
      </span>
      {text ? <textarea readOnly value={text} aria-label="Frame report" onFocus={(e) => e.currentTarget.select()} /> : null}
    </div>
  );
}
