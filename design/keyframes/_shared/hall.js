// The day hall (roles, white side): seven tables in a horseshoe, each playing its own master game.
import { THREE, renderer, applyEnv, board, position, MAT } from "./chess3d.js";

export const TABLES = [
  { employer: "Monash University", when: "Degree, graduated Apr 2026", game: "Paulsen-Morphy" },
  { employer: "Petronas", when: "Nov 2024 - Feb 2025", game: "Rotlewi-Rubinstein" },
  { employer: "Western Digital", when: "Feb - Dec 2025", game: "Nimzowitsch-Tarrasch" },
  { employer: "Setel", when: "Jul - Dec 2025", game: "Nimzowitsch-Alapin" },
  { employer: "Monash University", when: "Contract, Nov 2025 - Feb 2026", game: "Botvinnik-Vidmar" },
  { employer: "Skribble Lab", when: "Jan - Jun 2026", game: "Byrne-Fischer" },
  { employer: "Deriv", when: "Jun 2026 - now", game: "Tal-Larsen" },
];

const S = .19; // one board square, in hall units

function table(pos, { current = false } = {}) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: current ? 0xcbbba1 : 0xd6ccbb, roughness: .6 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, .07, 1.35), wood); top.position.y = .76; top.castShadow = top.receiveShadow = true; g.add(top);
  const legM = new THREE.MeshStandardMaterial({ color: 0xb4a78f, roughness: .6 });
  [[-1.05, -.58], [1.05, -.58], [-1.05, .58], [1.05, .58]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .76, .06), legM); l.position.set(x, .38, z); l.castShadow = true; g.add(l); });
  const b = board({ tableSize: 0, highlight: pos.last, light: 0xe6dcc7, dark: 0xa38c6f, frame: 0xbfa888 });
  b.scale.setScalar(S); b.position.y = .8 + .014; g.add(b);
  const p = position(pos.fen); p.scale.setScalar(S); p.position.y = .8 + .014; g.add(p);
  const chairM = new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: .7 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.5, .05, .5), chairM); seat.position.set(0, .46, -1.05); seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .05), chairM); back.position.set(0, .72, -1.3); back.castShadow = true; g.add(back);
  [[-.22, -.83], [.22, -.83], [-.22, -1.27], [.22, -1.27]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, .46, .04), chairM); l.position.set(x, .23, z); g.add(l); });
  return g;
}

export async function hall(canvas, { view = "high", width = innerWidth, height = innerHeight } = {}) {
  const positions = await (await fetch("./_shared/positions.json")).json();
  const { r, envTex } = renderer(canvas, { width, height, exposure: 1.02 });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2f2ef);
  applyEnv(scene, envTex, .55);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cf, 1.1));
  const sun = new THREE.DirectionalLight(0xfffaf0, 2.2); sun.position.set(-6, 14, -6); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 8; sun.shadow.bias = -.0004;
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 }); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0xe6e4de, roughness: .85 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = new THREE.MeshStandardMaterial({ color: 0xf3f3f0, roughness: 1 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 16), wallM); wall.position.set(0, 8, -11); wall.receiveShadow = true; scene.add(wall);
  const glass = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = -3; i <= 3; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 6), glass); w.position.set(i * 3.4, 6.2, -10.98); scene.add(w); }
  const anchors = [];
  TABLES.forEach((t, i) => {
    const a = Math.PI * (.12 + .76 * i / 6), R = 7.2;
    const x = -Math.cos(a) * R, z = -Math.sin(a) * R * .72 + 2.2;
    const g = table(positions[t.game], { current: i === 6 });
    g.position.set(x, 0, z); g.rotation.y = Math.atan2(-x, 2.2 - z); scene.add(g);
    anchors.push(new THREE.Vector3(x, 0, z));
  });
  const cam = new THREE.PerspectiveCamera(view === "high" ? 34 : 30, width / height, .1, 200);
  if (view === "high") { cam.position.set(0, 13.5, 13); cam.lookAt(0, 0, -1.2); }
  else { cam.position.set(9.6, 3.6, 4.8); cam.lookAt(1.4, .1, -3.4); }
  if (view !== "high") cam.setViewOffset(width, height, -.2 * width, 0, width, height);
  cam.updateMatrixWorld();
  const toScreen = (v) => { const p = v.clone().project(cam); return { x: (p.x + 1) / 2 * width, y: (1 - p.y) / 2 * height, z: p.z }; };
  return { r, scene, cam, anchors, toScreen };
}
