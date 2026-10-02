// The Lab's chapters, in order (motion.md §11): each one's scene, how many screens it is pinned for, and whether it
// has a night side. Phones pin for one screen (§13).
import type { Spec, ChapterCopy } from "./Lab";
import { chapter1 } from "./ch1";
import { chapter2 } from "./ch2";
import { chapter3 } from "./ch3";
import { chapter4 } from "./ch4";
import { chapter5 } from "./ch5";
import { chapter6 } from "./ch6";
import { chapter7 } from "./ch7";
import { Play } from "./Play";

export const SPECS: Spec[] = [
  { id: 1, make: chapter1, screens: 1.5, night: true },
  { id: 2, make: chapter2, screens: 1.5, night: true },
  { id: 3, make: chapter3, screens: 1.5, night: false },
  { id: 4, make: chapter4, screens: 1.5, night: true },
  { id: 5, make: chapter5, screens: 2.5, night: true },
  { id: 6, make: chapter6, screens: 1.5, night: false },
  { id: 7, make: chapter7, screens: 1, night: true },
];

/** chapter-specific type beyond the title, notes and big number */
export const EXTRAS: Record<number, (inv: boolean, copy: ChapterCopy) => React.ReactNode> = {
  4: (_, c) => <><p className="half mono">{c.share as string}</p><div className="fade" /></>,
  5: (_, c) => (<>
    <p className="result display">{c.result as string}</p>
    <p className="pm">{c.pm as string}<span>{c.qualifier as string}</span></p>
    <p className="ctr" aria-live="polite" />
  </>),
  6: (_, c) => (<>
    <p className="voice">{c.voice as string}</p>
    <p className="note scale"><span className="wide">{c.scale as string}</span><span className="narrow">{c.scalePhone as string}</span></p>
  </>),
  7: (inv, c) => <Play inv={inv} copy={c} />,
};
