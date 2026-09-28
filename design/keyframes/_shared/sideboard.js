// Comps for the seven other projects (step 4a, owner: "new pieces but on a different board").
// A: the side board, by night. B: the simul, seven boards. C: the analysis, by day.
import { THREE, renderer, spot, applyEnv, board, position, piece, MAT, sq } from "./chess3d.js";
import { SIDELINES } from "./sidelines.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

// Positions after each move, played in the site's own engine (src/lib/chess/engine.ts).
export const FEN = {
  "financial-risk-predictor": "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR",
  "distributed-lead-scorer": "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R",
  mirrorfi: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R",
  veridian: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R",
  "slm-distillation-engine": "r1bqk2r/pppp1ppp/1bn2n2/4p3/2BPP3/2P2N2/PP3PPP/RNBQK2R",
  "multi-agent-graphrag": "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R",
  rexcheck: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
};
// where the moving piece came from, for the arrows (C)
export const FROM = { mirrorfi: "g8", veridian: "d2", "slm-distillation-engine": "c5", "multi-agent-graphrag": "d7", "distributed-lead-scorer": "d7" };
// on the one board (A, C): the moves that can share it. 1…Nf6 is another game (Alekhine's Defence), and
// RexCheck has no move yet: those two stand off the board.
export const ON_BOARD = ["distributed-lead-scorer", "mirrorfi", "veridian", "slm-distillation-engine", "multi-agent-graphrag"];

function panels(scene, list) {
  RectAreaLightUniformsLib.init();
  for (const [w, h, pos, look, I, color = 0xfff4e6] of list) { const l = new THREE.RectAreaLight(color, I, w, h); l.position.set(...pos); l.lookAt(...look); scene.add(l); }
}

const turn = (p, s) => { if (s.slug === "mirrorfi") p.rotation.y = -Math.PI / 2 + .5; if (s.slug === "financial-risk-predictor") p.rotation.y = -Math.PI / 2 - .3; };

/** A: a walnut and maple board on a low table in the gallery, under one lamp. */
export function sideBoard(canvas, { width = innerWidth, height = innerHeight, cam: cv } = {}) {
  const { r, envTex } = renderer(canvas, { width, height, exposure: 1.02 });
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x09090a);
  applyEnv(scene, envTex, .16); scene.add(new THREE.HemisphereLight(0x2a2a30, 0x050505, .35));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: .9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; floor.receiveShadow = true; scene.add(floor);
  const table = new THREE.Mesh(new THREE.BoxGeometry(15, .3, 11), new THREE.MeshStandardMaterial({ color: 0x141312, roughness: .6 }));
  table.position.set(-1.2, -.35, 0); table.receiveShadow = true; table.castShadow = true; scene.add(table);
  // smoked walnut and pale ash, dimmer than a tournament board; each move's square carries a trace of amber
  const b = board({ light: 0x7c7266, dark: 0x352820, frame: 0x221a14, tableSize: 0, highlight: ON_BOARD.map((s) => SIDELINES.find((x) => x.slug === s).square), move: 0x7a5424 });
  scene.add(b);
  const anchors = {};
  for (const s of SIDELINES) {
    const p = s.make(); turn(p, s);
    let at;
    if (ON_BOARD.includes(s.slug)) at = sq(s.square);
    else at = s.slug === "rexcheck" ? { x: -1.2, z: -5.2 } : { x: -3.2, z: -5.2 }; // off the board: on the table behind rank 8, set aside
    p.position.set(at.x, 0, at.z); scene.add(p); anchors[s.slug] = new THREE.Vector3(at.x + .28, 0, at.z + .5); // the tag sits in front of the base, a little right of centre
  }
  spot(scene, { color: 0xffe6c4, pos: [-4.5, 12, 5], target: [-1.8, 0, -.8], intensity: 260, angle: .36, penumbra: .8 });
  panels(scene, [[10, 2, [0, 6, -7], [0, 1, 0], 2.2]]);
  const cam = new THREE.PerspectiveCamera(cv?.fov ?? 30, width / height, .1, 200);
  cam.position.set(...(cv?.pos ?? [4.5, 11.5, 12.5])); cam.lookAt(...(cv?.look ?? [-1.4, 0, .4])); cam.updateMatrixWorld();
  if (cv?.offset) cam.setViewOffset(width, height, cv.offset[0], cv.offset[1], width, height);
  const toScreen = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * width, y: (1 - q.y) / 2 * height }; };
  return { r, scene, cam, anchors, toScreen };
}

/** B: seven small boards on a long table, each at the position after its move. */
export function simul(canvas, { width = innerWidth, height = innerHeight, grid = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1]], gap = 11, rowGap = gap, cam: cv } = {}) {
  const { r, envTex } = renderer(canvas, { width, height, exposure: 1.02 });
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x09090a);
  applyEnv(scene, envTex, .14); scene.add(new THREE.HemisphereLight(0x2a2a30, 0x050505, .3));
  const table = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .8 }));
  table.rotation.x = -Math.PI / 2; table.position.y = -.17; table.receiveShadow = true; scene.add(table);
  // the rest of each position is plain and quiet, so the project's own piece carries the board
  const plainW = new THREE.MeshStandardMaterial({ color: 0x55524d, roughness: .6 }), plainB = new THREE.MeshStandardMaterial({ color: 0x161514, roughness: .5 });
  const anchors = {};
  SIDELINES.forEach((s, i) => {
    const [gx, gz] = grid[i], ox = gx * gap, oz = gz * rowGap;
    const g = new THREE.Group(); g.position.set(ox, 0, oz);
    g.add(board({ light: 0x3a3836, dark: 0x242221, frame: 0x191817, tableSize: 0, highlight: s.square ? [s.square] : [], move: 0x6e4c22 }));
    const pos = position(FEN[s.slug], { white: plainW, black: plainB });
    const hero = s.square ?? "e8";
    pos.children.filter((p) => p.userData.square === hero).forEach((p) => pos.remove(p));
    g.add(pos);
    const p = s.make(); turn(p, s); p.scale.setScalar(1.35); const h = sq(hero); p.position.set(h.x, 0, h.z); g.add(p);
    scene.add(g);
    spot(scene, { color: 0xffe6c4, pos: [ox + h.x - 2.5, 9, oz + h.z + 3], target: [ox + h.x, .6, oz + h.z], intensity: 190, angle: .13, penumbra: .75 });
    anchors[s.slug] = new THREE.Vector3(ox, 0, oz + 4.6);
  });
  const cx = (Math.max(...grid.map((g) => g[0])) * gap) / 2, cz = (Math.max(...grid.map((g) => g[1])) * rowGap) / 2;
  const overhead = new THREE.DirectionalLight(0xcfd4dc, .55); overhead.position.set(cx - 8, 30, cz + 14); overhead.target.position.set(cx, 0, cz); scene.add(overhead.target);
  overhead.castShadow = true; overhead.shadow.mapSize.set(4096, 4096); Object.assign(overhead.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 90 }); overhead.shadow.radius = 4; scene.add(overhead);
  const cam = new THREE.PerspectiveCamera(cv?.fov ?? 30, width / height, .1, 300);
  cam.position.set(...(cv?.pos ?? [cx, 46, cz + 38])); cam.lookAt(...(cv?.look ?? [cx, 0, cz + 1])); cam.updateMatrixWorld();
  if (cv?.offset) cam.setViewOffset(width, height, cv.offset[0], cv.offset[1], width, height);
  const toScreen = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * width, y: (1 - q.y) / 2 * height }; };
  return { r, scene, cam, anchors, toScreen };
}

function diagramBoard() {
  // a printed book diagram: paper light squares, hatched grey dark squares, a ruled border and coordinates
  const c = document.createElement("canvas"); c.width = c.height = 2048; const g = c.getContext("2d"), S = 2048, m = 150, q = (S - 2 * m) / 8;
  g.fillStyle = "#f1efe9"; g.fillRect(0, 0, S, S);
  for (let f = 0; f < 8; f++) for (let rk = 0; rk < 8; rk++) {
    const dark = (f + rk) % 2 === 0, x = m + f * q, y = m + (7 - rk) * q;
    if (!dark) continue;
    g.save(); g.beginPath(); g.rect(x, y, q, q); g.clip(); g.fillStyle = "#dcd8cf"; g.fillRect(x, y, q, q);
    g.strokeStyle = "rgba(60,56,50,.55)"; g.lineWidth = 3; for (let d = -q; d < q * 2; d += 16) { g.beginPath(); g.moveTo(x + d, y); g.lineTo(x + d - q, y + q); g.stroke(); }
    g.restore();
  }
  g.strokeStyle = "#1d1b18"; g.lineWidth = 7; g.strokeRect(m, m, S - 2 * m, S - 2 * m); g.lineWidth = 2; g.strokeRect(m - 16, m - 16, S - 2 * m + 32, S - 2 * m + 32);
  g.fillStyle = "#4a463f"; g.font = "500 44px JetBrains Mono, monospace"; g.textAlign = "center"; g.textBaseline = "middle";
  for (let i = 0; i < 8; i++) { g.fillText("abcdefgh"[i], m + (i + .5) * q, S - m + 70); g.fillText(String(8 - i), m - 72, m + (i + .5) * q); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { tex: t, scale: 8 / (S - 2 * m) * S };
}

/** C: the analysis by day. A printed diagram on the paper table; ink arrows for each move. */
export function analysis(canvas, { width = innerWidth, height = innerHeight, cam: cv, focus = null } = {}) {
  const { r, envTex } = renderer(canvas, { width, height, exposure: .98 });
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf3f3f1);
  applyEnv(scene, envTex, .5);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0xebe9e3, roughness: .95 }));
  desk.rotation.x = -Math.PI / 2; desk.position.y = -.01; desk.receiveShadow = true; scene.add(desk);
  const { tex, scale } = diagramBoard();
  // a plane, so the canvas's top (rank 8) lies away from White, as the pieces do
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), new THREE.MeshStandardMaterial({ map: tex, roughness: .92 }));
  sheet.rotation.x = -Math.PI / 2; sheet.position.y = .008; sheet.receiveShadow = true; scene.add(sheet);
  const ink = new THREE.MeshBasicMaterial({ color: 0x2a2724 }), amber = new THREE.MeshBasicMaterial({ color: 0xc98a2c });
  const arrow = (a, b, mat) => { // a flat printed arrow on the paper, stopping short of the target square's piece
    const A = sq(a), B = sq(b), d = new THREE.Vector2(B.x - A.x, B.z - A.z), len = d.length() - .52, sh = new THREE.Shape(), w = .026, hw = .1, hl = .22;
    sh.moveTo(0, -w); sh.lineTo(len - hl, -w); sh.lineTo(len - hl, -hw); sh.lineTo(len, 0); sh.lineTo(len - hl, hw); sh.lineTo(len - hl, w); sh.lineTo(0, w); sh.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(-(B.z - A.z), B.x - A.x);
    m.position.set(A.x + d.x / d.length() * .1, .014, A.z + d.y / d.length() * .1); scene.add(m);
  };
  const anchors = {};
  for (const s of SIDELINES) {
    const p = s.make(); turn(p, s);
    let at; if (ON_BOARD.includes(s.slug)) { at = sq(s.square); arrow(FROM[s.slug], s.square, s.slug === focus ? amber : ink); }
    else at = s.slug === "rexcheck" ? { x: -1.2, z: -5.6 } : { x: -3.2, z: -5.6 }; // set aside on the desk, past the diagram's top edge
    p.position.set(at.x, .012, at.z); scene.add(p); anchors[s.slug] = new THREE.Vector3(at.x + .28, 0, at.z + .5);
  }
  const sun = new THREE.DirectionalLight(0xfff5e8, 2.4); sun.position.set(-9, 14, 7); sun.target.position.set(-1, 0, 0); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 7; sun.shadow.bias = -.0004; Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, far: 50 }); scene.add(sun);
  panels(scene, [[14, 5, [2, 9, -6], [0, 0, 0], 1.6]]);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d4cb, .5));
  const cam = new THREE.PerspectiveCamera(cv?.fov ?? 30, width / height, .1, 200);
  cam.position.set(...(cv?.pos ?? [5, 12, 11])); cam.lookAt(...(cv?.look ?? [-1.6, 0, .3])); cam.updateMatrixWorld();
  if (cv?.offset) cam.setViewOffset(width, height, cv.offset[0], cv.offset[1], width, height);
  const toScreen = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * width, y: (1 - q.y) / 2 * height }; };
  return { r, scene, cam, anchors, toScreen };
}
