// Real data for the prototypes. The line's evals are the kept engine at 6,000 nodes (handcrafted),
// recomputed for Phase 3; they match content.json's stored career evals exactly.
export const LINE = ["", "1. e4", "1…e5", "2. Nf3", "2…Nc6", "3. Bc4", "3…Bc5", "4. c3", "4…Nf6", "5. d4", "5…exd4", "6. e5", "6…d5", "7. Bb5", "7…Ne4", "8. cxd4", "8…Bb4+", "9. Bd2", "9…Bxd2+", "10. Nbxd2", "10…Bg4"];
export const LINE_CP = [5, 21, 33, 27, 27, -2, 49, 16, 37, 37, -5, 4, 4, -8, -18, -18, -18, -4, 38, 38, 64];
export async function career() {
  const c = await (await fetch("/content/content.json")).json();
  return c.chess.careerTimeline.map((t) => ({ ...t, when: t.end && t.end !== t.start ? `${t.start} to ${t.end}` : t.start }));
}
export const fmt = (cp) => (cp >= 0 ? "+" : "−") + (Math.abs(cp) / 100).toFixed(2);
