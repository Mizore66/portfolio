/**
 * Sound (motion.md, "Sound"; Gate 4): four cues, 51 KB, off by default and on only when the visitor turns it on.
 * The choice is remembered in this browser. The cues are fetched and decoded the first time sound is turned on, so a
 * visitor who never does downloads none of them.
 */
export type Cue = "place" | "tick" | "seam" | "break";
const CUES: Cue[] = ["place", "tick", "seam", "break"];
const KEY = "sound";

let ctx: AudioContext | null = null, loading: Promise<void> | null = null;
const buf: Partial<Record<Cue, AudioBuffer>> = {};
let on = false, read = false;
const subs = new Set<() => void>();

function load() {
  ctx ??= new AudioContext();
  loading ??= Promise.all(CUES.map(async (n) => {
    buf[n] = await ctx!.decodeAudioData(await (await fetch(`/sound/${n}.m4a`)).arrayBuffer());
  })).then(() => {}, () => { loading = null; });
  return loading;
}

export const sound = {
  get(): boolean {
    if (!read && typeof window !== "undefined") { read = true; try { on = localStorage.getItem(KEY) === "on"; } catch {} }
    return on;
  },
  server: () => false,
  sub(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  /** turn sound on or off; called from the toggle's click, so the audio context may start */
  set(v: boolean) {
    on = v; read = true;
    try { localStorage.setItem(KEY, v ? "on" : "off"); } catch {}
    if (v) { void load(); void ctx?.resume(); }
    subs.forEach((f) => f());
  },
};

/** Play a cue when sound is on: `cue("place", { gain: 0.6, rate: 1.1 })`. Silent otherwise, and until loaded. */
export function cue(name: Cue, { gain = 1, rate = 1 } = {}) {
  if (!sound.get()) return;
  if (!ctx || !buf[name]) { void load(); return; } // a remembered "on" loads on the first cue; that cue is skipped
  if (ctx.state === "suspended") { void ctx.resume(); if (ctx.state === "suspended") return; }
  const s = ctx.createBufferSource(), g = ctx.createGain();
  s.buffer = buf[name]!; s.playbackRate.value = rate; g.gain.value = gain;
  s.connect(g).connect(ctx.destination); s.start();
}
