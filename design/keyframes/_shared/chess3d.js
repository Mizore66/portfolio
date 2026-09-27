// Throwaway key-frame toolkit (Phase 2). Not production code.
// Board: one square = 1 unit, centred on the origin. Files a..h run -x to +x; White sits at +z.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export { THREE };

const V = (r, y) => new THREE.Vector2(r, y);

const PROFILES = {
  P: [[0, 0], [.30, 0], [.30, .05], [.27, .08], [.27, .11], [.22, .14], [.13, .40], [.20, .46], [.20, .50], [.10, .54], [0, .54]],
  R: [[0, 0], [.33, 0], [.33, .06], [.29, .10], [.29, .13], [.24, .17], [.21, .62], [.25, .66], [.28, .71], [.28, .92], [.17, .92], [.17, .86], [0, .86]],
  N: [[0, 0], [.33, 0], [.33, .06], [.29, .10], [.29, .13], [.24, .17], [.22, .22], [0, .22]],
  B: [[0, 0], [.31, 0], [.31, .06], [.27, .10], [.27, .13], [.21, .17], [.12, .62], [.20, .68], [.20, .72], [.11, .76], [.16, .86], [.20, .98], [.17, 1.12], [.10, 1.22], [.04, 1.27], [0, 1.28]],
  Q: [[0, 0], [.34, 0], [.34, .06], [.30, .10], [.30, .14], [.23, .18], [.12, .78], [.21, .84], [.21, .88], [.11, .93], [.16, 1.10], [.24, 1.36], [.22, 1.40], [.14, 1.42], [0, 1.44]],
  K: [[0, 0], [.34, 0], [.34, .06], [.30, .10], [.30, .14], [.23, .18], [.13, .86], [.22, .92], [.22, .96], [.12, 1.00], [.17, 1.20], [.23, 1.40], [.21, 1.46], [.10, 1.50], [0, 1.50]],
};

const SMOOTH = {};
export function profileRadius(type, y) {
  const p = (SMOOTH[type] ??= smooth(PROFILES[type]));
  for (let i = 1; i < p.length; i++) {
    const [r0, y0] = p[i - 1], [r1, y1] = p[i];
    if (y >= y0 && y <= y1 && y1 > y0) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
  }
  return 0;
}

function knightHead() {
  const s = new THREE.Shape();
  s.moveTo(-.26, .20); s.lineTo(.22, .20);
  s.bezierCurveTo(.20, .34, .10, .46, .18, .56);
  s.lineTo(.36, .62);
  s.bezierCurveTo(.44, .66, .46, .74, .42, .80);
  s.bezierCurveTo(.36, .86, .24, .92, .18, 1.00);
  s.lineTo(.14, 1.10); s.lineTo(.10, 1.22); s.lineTo(.02, 1.12);
  s.bezierCurveTo(-.10, 1.12, -.22, 1.04, -.28, .92);
  s.bezierCurveTo(-.34, .78, -.32, .56, -.26, .44);
  s.bezierCurveTo(-.22, .34, -.28, .26, -.26, .20);
  const g = new THREE.ExtrudeGeometry(s, { depth: .16, bevelEnabled: true, bevelThickness: .065, bevelSize: .04, bevelSegments: 8, curveSegments: 40 });
  g.translate(0, 0, -.08);
  return g;
}

export const MAT = {
  ivory: () => new THREE.MeshPhysicalMaterial({ color: 0xeee7d8, roughness: .38, clearcoat: .5, clearcoatRoughness: .3 }),
  ebony: () => new THREE.MeshPhysicalMaterial({ color: 0x1d1a17, roughness: .32, clearcoat: .7, clearcoatRoughness: .2 }),
  porcelain: () => new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: .16, clearcoat: 1, clearcoatRoughness: .06, sheen: .4, sheenColor: new THREE.Color(0xfff6e8) }),
  aluminium: () => new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 1, roughness: .26 }),
  basalt: () => new THREE.MeshStandardMaterial({ color: 0x333335, roughness: .88 }),
  copper: () => new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 1, roughness: .32 }),
  dark: () => new THREE.MeshStandardMaterial({ color: 0x141312, roughness: .9 }),
};


/** Rounds gentle corners of a lathe profile (Chaikin cuts where the turn is under ~55°); crisp steps stay crisp. */
function smooth(pts, passes = 4) {
  let p = pts;
  for (let k = 0; k < passes; k++) {
    const out = [p[0]];
    for (let i = 1; i < p.length - 1; i++) {
      const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
      const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - b[0], c[1] - b[1]];
      const turn = Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]));
      if (turn > .96) { out.push(b); continue; }
      out.push([b[0] - u[0] * .25, b[1] - u[1] * .25], [b[0] + v[0] * .25, b[1] + v[1] * .25]);
    }
    out.push(p.at(-1)); p = out;
  }
  return p;
}

export function piece(type, mat) {
  const g = new THREE.Group();
  const add = (geo, m = mat) => { const mesh = new THREE.Mesh(geo, m); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  add(new THREE.LatheGeometry((SMOOTH[type] ??= smooth(PROFILES[type])).map(([r, y]) => V(r, y)), 96));
  if (type === "P") add(new THREE.SphereGeometry(.16, 48, 32)).position.y = .68;
  if (type === "B") {
    add(new THREE.SphereGeometry(.05, 24, 16)).position.y = 1.33;
    // the mitre cut: a dark groove laid on the head's surface, rising diagonally across the front
    const cut = []; for (let i = 0; i <= 40; i++) { const t = i / 40, y = 1.0 + t * .15, a = -.62 + t * .8, r = profileRadius("B", y) - .002; cut.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)); }
    const groove = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cut), 80, .0075, 8, false), MAT.dark()); groove.castShadow = false;
  }
  if (type === "Q") {
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add(new THREE.SphereGeometry(.045, 20, 12)).position.set(Math.cos(a) * .2, 1.4, Math.sin(a) * .2); }
    add(new THREE.SphereGeometry(.07, 24, 16)).position.y = 1.52;
  }
  if (type === "K") {
    add(new THREE.BoxGeometry(.07, .22, .07)).position.y = 1.61;
    add(new THREE.BoxGeometry(.19, .06, .07)).position.y = 1.64;
  }
  if (type === "R") {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, m = add(new THREE.BoxGeometry(.11, .13, .1)); m.position.set(Math.cos(a) * .225, .985, Math.sin(a) * .225); m.rotation.y = -a; }
  }
  if (type === "N") add(knightHead());
  return g;
}

export function sq(square) {
  return { x: "abcdefgh".indexOf(square[0]) - 3.5, z: 4.5 - Number(square[1]) };
}

export function board({ light = 0xe2d6bf, dark = 0x9c8468, frame = 0xb79e7c, table = 0xd9d2c5, tableSize = 14, highlight = [], move = 0xe8a33d } = {}) {
  const g = new THREE.Group();
  const lm = new THREE.MeshStandardMaterial({ color: light, roughness: .55 });
  const dm = new THREE.MeshStandardMaterial({ color: dark, roughness: .5 });
  const hm = new THREE.MeshStandardMaterial({ color: new THREE.Color(light).lerp(new THREE.Color(move), .55), roughness: .5 });
  const hd = new THREE.MeshStandardMaterial({ color: new THREE.Color(dark).lerp(new THREE.Color(move), .5), roughness: .5 });
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
    const name = "abcdefgh"[f] + (r + 1), isDark = (f + r) % 2 === 0, hl = highlight.includes(name);
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, .08, 1), hl ? (isDark ? hd : hm) : (isDark ? dm : lm));
    const p = sq(name); m.position.set(p.x, -.04, p.z); m.receiveShadow = true; g.add(m);
  }
  const fr = new THREE.Mesh(new THREE.BoxGeometry(8.9, .14, 8.9), new THREE.MeshStandardMaterial({ color: frame, roughness: .5 }));
  fr.position.y = -.1; fr.receiveShadow = true; fr.castShadow = true; g.add(fr);
  if (tableSize) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(tableSize, .5, tableSize), new THREE.MeshStandardMaterial({ color: table, roughness: .8 }));
    t.position.y = -.42; t.receiveShadow = true; g.add(t);
  }
  return g;
}

/** fen: piece placement only, rank 8 first, "." or digits for empty squares. */
export function position(fen, { white = MAT.ivory(), black = MAT.ebony(), lift = null } = {}) {
  const g = new THREE.Group();
  fen.replace(/\d/g, (d) => ".".repeat(+d)).split("/").forEach((row, i) => {
    [...row].forEach((ch, f) => {
      if (ch === ".") return;
      const w = ch === ch.toUpperCase(), name = "abcdefgh"[f] + (8 - i), p = piece(ch.toUpperCase(), w ? white : black);
      const s = sq(name); p.position.set(s.x, name === lift ? .35 : 0, s.z);
      if (ch.toUpperCase() === "N") p.rotation.y = w ? Math.PI / 2 : -Math.PI / 2;
      p.userData.square = name; g.add(p);
    });
  });
  return g;
}

export function renderer(canvas, { width = innerWidth, height = innerHeight, exposure = 1, env = .35 } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.setSize(width, height, true);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = exposure;
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const pm = new THREE.PMREMGenerator(r);
  const envTex = pm.fromScene(new RoomEnvironment(), .04).texture;
  return { r, envTex, envIntensity: env };
}

export function keyLight(scene, { color = 0xffffff, intensity = 2.2, pos = [-6, 10, 4], target = [0, 0, 0], size = 7, softness = 6 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos); l.target.position.set(...target); scene.add(l.target);
  l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = softness; l.shadow.bias = -.0004;
  const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = .5; c.far = 40;
  scene.add(l); return l;
}

export function spot(scene, { color = 0xffe2b8, intensity = 60, pos = [-3, 8, 3], target = [0, 0, 0], angle = .32, penumbra = .7 } = {}) {
  const l = new THREE.SpotLight(color, intensity, 0, angle, penumbra, 1.6);
  l.position.set(...pos); l.target.position.set(...target); scene.add(l.target);
  l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = 5; l.shadow.bias = -.0003;
  scene.add(l); return l;
}

export function applyEnv(scene, env, intensity) {
  scene.environment = env; scene.environmentIntensity = intensity;
}

export function done(r, scene, cam) {
  r.render(scene, cam);
  requestAnimationFrame(() => { r.render(scene, cam); window.__ready = true; });
}
