import type { SearchInfo } from "@/lib/chess/engine";
import type { Ply } from "@/lib/opening/types";

export const PV_MIN_DEPTH = 5;
/** Depths the glass case must paint, in order, before it may race ahead. */
export const SHOW_DEPTHS = 8;

export type BookLine = { san: string; plies: Ply[] };

export type VisibleLine = {
  pv: string[];
  best: Ply | null;
  settling: boolean;
};

export function visibleEngineLine(
  book: BookLine | null,
  info: SearchInfo | null,
): VisibleLine {
  if (!info) {
    return { pv: [], best: null, settling: false };
  }
  const settling = info.depth < PV_MIN_DEPTH;
  if (book && book.plies.length > 0) {
    const rest = info.pv[0] === book.san ? info.pv.slice(1) : [];
    return { pv: [book.san, ...rest], best: book.plies[0], settling };
  }
  return { pv: info.pv, best: info.best, settling };
}
