/**
 * The one page's scenes, kept across a visit to a detail page (phase 6, step 5: on a phone, coming back from a
 * project or a role took 170-300 ms frames, because every scene near the screen was built again from nothing
 * while the seam swept in: geometry baked, a new WebGL context, every shader compiled).
 *
 * A section renders an empty slot. On mount it claims its canvases: the ones it drew into last time, with the
 * built scene, or fresh ones. On unmount it keeps them instead of disposing of them. A scene no one claims
 * within ten minutes is disposed of, so the GPU memory is not held for a visit that does not come back.
 */
const LIFE = 10 * 60_000;
interface Kept { canvases: HTMLCanvasElement[]; stage: unknown; dispose: () => void; timer: number }
const kept = new Map<string, Kept>();

/** Fills each slot with a canvas: the ones kept under `key`, returned with their scene, or new ones and null. */
export function claim<T>(key: string, slots: HTMLElement[]): { canvases: HTMLCanvasElement[]; stage: T | null } {
  const k = kept.get(key);
  if (k) { kept.delete(key); clearTimeout(k.timer); }
  const canvases = k?.canvases ?? slots.map(() => document.createElement("canvas"));
  slots.forEach((s, i) => s.replaceChildren(canvases[i]));
  return { canvases, stage: (k?.stage as T) ?? null };
}

/** Sets a built scene aside as its section unmounts. `dispose` runs if it is not claimed again in time. */
export function keep(key: string, canvases: HTMLCanvasElement[], stage: unknown, dispose: () => void) {
  const old = kept.get(key);
  if (old && old.stage !== stage) { clearTimeout(old.timer); old.dispose(); }
  const timer = window.setTimeout(() => { if (kept.get(key)?.stage === stage) { kept.delete(key); dispose(); } }, LIFE);
  kept.set(key, { canvases, stage, dispose, timer });
}
