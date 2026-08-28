import { ARCH_128, ARCH_256, INPUT_FEATURES, NNUE_MAGIC, accSizeFor, type NnueArch, type NnueNet } from "./types";

const ARCH_CODE: Record<NnueArch, number> = { [ARCH_256]: 1, [ARCH_128]: 2 };

function codeArch(code: number): NnueArch {
  if (code === 2) return ARCH_128;
  if (code === 1) return ARCH_256;
  throw new Error(`unknown NNUE arch ${code}`);
}

function writeU32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

export function encodeNnue(net: NnueNet): Uint8Array {
  const idBytes = new TextEncoder().encode(net.id);
  const body =
    4 +
    2 +
    1 +
    4 +
    2 +
    idBytes.length +
    net.ftW.byteLength +
    net.ftB.byteLength +
    net.l1W.byteLength +
    net.l1B.byteLength +
    net.l2W.byteLength +
    net.l2B.byteLength;
  const buf = new ArrayBuffer(body);
  const view = new DataView(buf);
  const u8 = new Uint8Array(buf);
  u8[0] = NNUE_MAGIC.charCodeAt(0);
  u8[1] = NNUE_MAGIC.charCodeAt(1);
  u8[2] = NNUE_MAGIC.charCodeAt(2);
  u8[3] = NNUE_MAGIC.charCodeAt(3);
  view.setUint16(4, 1, true);
  u8[6] = ARCH_CODE[net.arch];
  writeU32(view, 7, net.scale);
  view.setUint16(11, idBytes.length, true);
  u8.set(idBytes, 13);
  let o = 13 + idBytes.length;
  u8.set(new Uint8Array(net.ftW.buffer, net.ftW.byteOffset, net.ftW.byteLength), o);
  o += net.ftW.byteLength;
  u8.set(new Uint8Array(net.ftB.buffer, net.ftB.byteOffset, net.ftB.byteLength), o);
  o += net.ftB.byteLength;
  u8.set(new Uint8Array(net.l1W.buffer, net.l1W.byteOffset, net.l1W.byteLength), o);
  o += net.l1W.byteLength;
  u8.set(new Uint8Array(net.l1B.buffer, net.l1B.byteOffset, net.l1B.byteLength), o);
  o += net.l1B.byteLength;
  u8.set(new Uint8Array(net.l2W.buffer, net.l2W.byteOffset, net.l2W.byteLength), o);
  o += net.l2W.byteLength;
  u8.set(new Uint8Array(net.l2B.buffer, net.l2B.byteOffset, net.l2B.byteLength), o);
  return u8;
}

export function decodeNnue(bytes: Uint8Array): NnueNet {
  if (bytes.length < 16) throw new Error("NNUE weights truncated");
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== NNUE_MAGIC) throw new Error(`NNUE magic mismatch: ${magic}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint16(4, true);
  if (version !== 1) throw new Error(`NNUE version ${version} unsupported`);
  const arch = codeArch(bytes[6]);
  const accSize = accSizeFor(arch);
  const scale = view.getInt32(7, true);
  const idLen = view.getUint16(11, true);
  const id = new TextDecoder().decode(bytes.subarray(13, 13 + idLen));
  let o = 13 + idLen;
  const ftW = new Int16Array(accSize * INPUT_FEATURES);
  const ftB = new Int16Array(accSize);
  const l1W = new Int8Array(32 * 2 * accSize);
  const l1B = new Int32Array(32);
  const l2W = new Int8Array(32);
  const l2B = new Int32Array(1);
  const take = (dest: ArrayBufferView) => {
    const src = bytes.subarray(o, o + dest.byteLength);
    if (src.length !== dest.byteLength) throw new Error("NNUE weights truncated");
    new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength).set(src);
    o += dest.byteLength;
  };
  take(ftW);
  take(ftB);
  take(l1W);
  take(l1B);
  take(l2W);
  take(l2B);
  if (o !== bytes.length) throw new Error("NNUE trailing bytes");
  return { id, arch, accSize, scale, ftW, ftB, l1W, l1B, l2W, l2B };
}

/** Deterministic toy net so inference tests do not need trained weights. */
export function toyNet(accSize: 256 | 128 = 256, seed = 1): NnueNet {
  const arch = accSize === 128 ? ARCH_128 : ARCH_256;
  const ftW = new Int16Array(accSize * INPUT_FEATURES);
  const ftB = new Int16Array(accSize);
  const l1W = new Int8Array(32 * 2 * accSize);
  const l1B = new Int32Array(32);
  const l2W = new Int8Array(32);
  const l2B = new Int32Array(1);
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
  for (let i = 0; i < ftW.length; i++) ftW[i] = (next() % 7) - 3;
  for (let i = 0; i < ftB.length; i++) ftB[i] = (next() % 5) - 2;
  for (let i = 0; i < l1W.length; i++) l1W[i] = (next() % 5) - 2;
  for (let i = 0; i < l1B.length; i++) l1B[i] = (next() % 9) - 4;
  for (let i = 0; i < l2W.length; i++) l2W[i] = (next() % 5) - 2;
  l2B[0] = 0;
  return {
    id: `nnue-toy-${accSize}-${seed}`,
    arch,
    accSize,
    scale: 64,
    ftW,
    ftB,
    l1W,
    l1B,
    l2W,
    l2B,
  };
}
