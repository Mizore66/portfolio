// One composition rendered twice, day and night, and split at the seam so the 3D inverts like the type.
// build(theme) -> { r, scene, cam } on the canvas it is given. theme: "day" | "night".
import { done } from "./chess3d.js";

export function twin(root, darkClip, build) {
  const ink = root.querySelector("#ink");
  for (const theme of ["day", "night"]) {
    const c = document.createElement("canvas");
    c.style.zIndex = 1; if (theme === "night") c.style.clipPath = darkClip;
    ink.before(c);
    const { r, scene, cam } = build(theme, c);
    done(r, scene, cam);
  }
}
