import type { NnueAcc } from "./types";

type WasmExports = {
  memory: WebAssembly.Memory;
  heap_ptr: () => number;
  heap_size: () => number;
  nnue_load: (off: number, len: number) => number;
  nnue_eval: (stmOff: number, nstmOff: number, side: number) => number;
  nnue_acc_size: () => number;
};

let exportsRef: WasmExports | null = null;
let heapBase = 0;
let scratchOff = 0;

export async function loadNnueWasm(
  wasmBytes: BufferSource,
  netBytes: Uint8Array,
): Promise<number> {
  const { instance } = await WebAssembly.instantiate(wasmBytes, {});
  const exp = instance.exports as unknown as WasmExports;
  exportsRef = exp;
  heapBase = exp.heap_ptr();
  const mem = new Uint8Array(exp.memory.buffer);
  if (heapBase + netBytes.length + 2048 > mem.length) {
    throw new Error("NNUE wasm heap too small");
  }
  mem.set(netBytes, heapBase);
  const acc = exp.nnue_load(0, netBytes.length);
  if (acc < 0) throw new Error(`NNUE wasm load ${acc}`);
  scratchOff = (netBytes.length + 1) & ~1;
  return acc;
}

export function evaluateNnueWasm(acc: NnueAcc, side: 1 | -1): number {
  const exp = exportsRef;
  if (!exp) throw new Error("NNUE wasm not loaded");
  const n = exp.nnue_acc_size();
  const mem = new Uint8Array(exp.memory.buffer);
  const stmOff = scratchOff;
  const nstmOff = scratchOff + n * 2;
  const stm = side === 1 ? acc.w : acc.b;
  const nstm = side === 1 ? acc.b : acc.w;
  mem.set(new Uint8Array(stm.buffer, stm.byteOffset, stm.byteLength), heapBase + stmOff);
  mem.set(new Uint8Array(nstm.buffer, nstm.byteOffset, nstm.byteLength), heapBase + nstmOff);
  return exp.nnue_eval(stmOff, nstmOff, side);
}

export function wasmReady(): boolean {
  return exportsRef !== null;
}
