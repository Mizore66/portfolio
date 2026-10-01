/// <reference lib="webworker" />
/** Chapter 3's rough casts, worked out off the main thread (cast.ts). */
import { castOf } from "./cast";

export type CastIn = { id: number; position: Float32Array; amp: number; freq: number };

self.onmessage = (e: MessageEvent<CastIn>) => {
  const { id, position, amp, freq } = e.data, c = castOf(position, amp, freq);
  (self as DedicatedWorkerGlobalScope).postMessage({ id, cast: c }, [c.position.buffer, c.normal.buffer, ...(c.index ? [c.index.buffer] : [])]);
};
