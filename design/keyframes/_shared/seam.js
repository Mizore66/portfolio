// The Advantage seam. Paints the two halves and clones #ink into an inverted layer clipped to the dark side,
// so every element that crosses the seam inverts. dir "v": white on the left; dir "h": white on top.
// at: share of white, 0..1. tilt (deg, vertical seams only) rotates the seam about its centre.
export function seam({ at = .559, dir = "v", tilt = 0, under = false, root = document.querySelector(".frame") } = {}) {
  const ink = root.querySelector("#ink");
  const W = root.clientWidth, H = root.clientHeight;
  let dark, light;
  if (dir === "h") {
    const y = at * H;
    dark = `polygon(0 ${y}px, ${W}px ${y}px, ${W}px ${H}px, 0 ${H}px)`;
    light = `polygon(0 0, ${W}px 0, ${W}px ${y}px, 0 ${y}px)`;
  } else {
    const x = at * W, d = Math.tan((tilt * Math.PI) / 180) * (H / 2);
    dark = `polygon(${x - d}px 0, ${W}px 0, ${W}px ${H}px, ${x + d}px ${H}px)`;
    light = `polygon(0 0, ${x - d}px 0, ${x + d}px ${H}px, 0 ${H}px)`;
  }
  // under: the dark side is a window onto whatever sits below (a 3D canvas); only the white side is painted.
  const bg = document.createElement("div");
  bg.className = "seam-bg";
  bg.style.cssText = under
    ? `position:absolute;inset:0;background:var(--paper);clip-path:${light};z-index:1`
    : `position:absolute;inset:0;background:var(--ink);clip-path:${dark};z-index:0`;
  root.querySelector("#ink").before(bg);
  const inv = ink.cloneNode(true);
  inv.id = "ink-inv";
  inv.setAttribute("aria-hidden", "true");
  inv.style.cssText += `;clip-path:${dark};--fg:var(--paper);--fg2:#b9b5ad`;
  ink.after(inv);
  return { dark };
}
