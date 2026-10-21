// The Lab's chapters, in order (motion.md §11): each one's scene, how many screens it is pinned for, and whether it
// has a night side. Phones pin for one screen (§13).
import type { Spec, ChapterCopy } from "./Lab";
import type { ChapterFactory } from "./kit";
import { lazy } from "@/lib/three/steps";
import { scenes } from "@/lib/three/code";
import { Play } from "./Play";

// Each chapter's scene is fetched when it is first built, not with the page, behind the scenes' code (code.ts).
const later = (id: number): ChapterFactory => {
  const code = lazy(() => scenes.load().then((m) => m.chapter(id)));
  return (day, night, o) => code.steps((make) => make(day, night, o));
};

export const SPECS: Spec[] = [
  { id: 1, make: later(1), screens: 1.5, night: true },
  { id: 2, make: later(2), screens: 1.5, night: true },
  { id: 3, make: later(3), screens: 1.5, night: false },
  { id: 4, make: later(4), screens: 1.5, night: true },
  { id: 5, make: later(5), screens: 2.5, night: true },
  { id: 6, make: later(6), screens: 1.5, night: false },
  { id: 7, make: later(7), screens: 1, night: true },
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
