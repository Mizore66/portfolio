import type { SearchInfo } from "@/lib/chess/engine";
import type { Ply } from "@/lib/opening/types";

export const PV_MIN_DEPTH = 5;

export type BookLine = { san: string; plies: Ply[] };

/**
 * On-book: advertise the repertoire ply immediately so the glass case never
 * leads with a shallow Nc3. Off-book: wait until the search is deep enough
 * that the PV is more than a PeSTO quirk.
 */
export function visibleEngineLine(
  book: BookLine | null,
  info: SearchInfo | null,
): { pv: string[]; best: Ply | null } {
  if (book && book.plies.length > 0) {
    const rest =
      info && info.depth >= PV_MIN_DEPTH && info.pv[0] === book.san ? info.pv.slice(1) : [];
    return { pv: [book.san, ...rest], best: book.plies[0] };
  }
  if (!info || info.depth < PV_MIN_DEPTH) {
    return { pv: [], best: null };
  }
  return { pv: info.pv, best: info.best };
}
