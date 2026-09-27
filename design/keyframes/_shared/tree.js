// Placeholder search tree (seeded). The build draws the kept engine's real search instead.
export function tree({ root = [0, 0], dir = 0, len = 120, depth = 10, seed = 7, bounds = [0, 0, 1e4, 1e4] } = {}) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const lines = [], pv = [root];
  (function grow(x, y, a, l, d, isPv) {
    if (!d) return; const x2 = x + l * Math.cos(a), y2 = y + l * Math.sin(a);
    if (x2 < bounds[0] || y2 < bounds[1] || x2 > bounds[2] || y2 > bounds[3]) return;
    if (isPv) pv.push([x2, y2]); else lines.push([x, y, x2, y2, d]);
    const n = d > 6 ? 3 : 2, k = isPv ? Math.floor(rnd() * n) : -1, sp = d > 7 ? .7 : d > 4 ? .48 : .34;
    for (let i = 0; i < n; i++) grow(x2, y2, a + (i - (n - 1) / 2) * sp + (rnd() - .5) * .2, l * (.78 + rnd() * .1), d - 1, i === k);
  })(root[0], root[1], dir, len, depth, true);
  return { lines, pv };
}
