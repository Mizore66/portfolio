/** NNUE-style net for the TypeScript engine. PeSTO remains the default eval. */

export const NNUE_MAGIC = "OPN2";
export const ARCH_256 = "768x2x256-32-1";
export const ARCH_128 = "768x2x128-32-1";
export const INPUT_FEATURES = 768;
export const HIDDEN = 32;
export const CRELU_MAX = 127;
export const QA = 255;
export const QB = 64;

export type NnueArch = typeof ARCH_256 | typeof ARCH_128;

export type NnueNet = {
  id: string;
  arch: NnueArch;
  accSize: 256 | 128;
  /** Hidden output → centipawns. */
  scale: number;
  ftW: Int16Array;
  ftB: Int16Array;
  l1W: Int8Array;
  l1B: Int32Array;
  l2W: Int8Array;
  l2B: Int32Array;
};

export type NnueAcc = {
  w: Int16Array;
  b: Int16Array;
};

export function accSizeFor(arch: NnueArch): 256 | 128 {
  return arch === ARCH_128 ? 128 : 256;
}
