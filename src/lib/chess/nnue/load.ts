import { decodeNnue } from "./format";
import type { NnueNet } from "./types";

export async function loadNnue(url: string): Promise<NnueNet> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NNUE weights HTTP ${res.status}`);
  return decodeNnue(new Uint8Array(await res.arrayBuffer()));
}
