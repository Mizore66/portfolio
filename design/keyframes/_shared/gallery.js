// The night gallery (projects, black side). Layouts: "row", "corridor", "plan".
import { THREE, renderer, spot, applyEnv, piece, MAT, sq } from "./chess3d.js";
import { faultline, teleportal, circuitmind } from "./sculptures.js";

export const FEATURED = [
  { slug: "teleportal", make: teleportal, square: "e4" },
  { slug: "faultline", make: faultline, square: "g4" },
  { slug: "circuitmind", make: circuitmind, square: "c5" },
];

export function gallery(canvas, { layout = "row", focus = "faultline", light = 1, width = innerWidth, height = innerHeight, transparent = false } = {}) {
  const { r, envTex } = renderer(canvas, { width, height, exposure: 1.05 });
  const scene = new THREE.Scene();
  if (!transparent) scene.background = new THREE.Color(0x09090a);
  applyEnv(scene, envTex, .22 * light);
  scene.add(new THREE.HemisphereLight(0x2a2a30, 0x050505, .35 * light));
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: .9 });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x151516, roughness: .7 });
  const anchors = {};
  const plinth = (x, z, w, h) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), plinthMat); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m); return h; };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 1 }));
  wall.position.set(0, 12, -12); wall.receiveShadow = true; scene.add(wall);
  let camPos = [0, 3.6, 15];
  const place = (f, x, z, H, scale, I) => {
    plinth(x, z, 1.9, H); const s = f.make(); s.scale.setScalar(scale); s.position.set(x, H, z); s.userData.slug = f.slug; scene.add(s);
    if (f.slug === "teleportal") s.rotation.y = Math.atan2(camPos[0] - x, camPos[2] - z) - .45;
    const on = f.slug === focus ? 1 : .42;
    spot(scene, { pos: [x - 4.5, 11, z + 4.5], target: [x, H + 1.1, z], intensity: I * on * light, angle: .2, penumbra: .8 });
    anchors[f.slug] = new THREE.Vector3(x, H - .15, z + .96);
  };
  let cam;
  if (layout === "row") {
    [[-7, -5.5], [-2.4, -6], [2.4, -6], [7, -5.5]].forEach(([x, z], i) => { const h = plinth(x, z, .9, 1.9); const p = piece(["P", "R", "Q", "N"][i], MAT.basalt()); p.scale.setScalar(.8); p.position.set(x, h, z); scene.add(p); spot(scene, { pos: [x - 3, 9, z + 3], target: [x, h, z], intensity: 14 * light, angle: .16 }); });
    FEATURED.forEach((f, i) => place(f, [-4.3, 0, 4.3][i], 0, 2.1, 1.8, 95));
    cam = new THREE.PerspectiveCamera(30, width / height, .1, 100); cam.position.set(0, 3.6, 15); cam.lookAt(0, 2.6, 0);
  } else if (layout === "corridor") {
    camPos = [7.4, 3.3, 11.5];
    const order = [FEATURED[1], FEATURED[0], FEATURED[2]];
    order.forEach((f, i) => place(f, [3.4, -3.8, -11.5][i], [3.4, -1.2, -6.5][i], 2.1, 1.8, 110));
    [[-14, -15], [-18, -19]].forEach(([x, z], i) => { const h = plinth(x, z, 1.2, 1.9); const p = piece(["Q", "R"][i], MAT.basalt()); p.position.set(x, h, z); scene.add(p); spot(scene, { pos: [x - 3, 9, z + 3], target: [x, h, z], intensity: 20 * light, angle: .16 }); });
    cam = new THREE.PerspectiveCamera(34, width / height, .1, 120); cam.position.set(...camPos); cam.lookAt(-3.6, 2.7, -1.6);
  } else if (layout === "plan") {
    const tile = 2.2, dark = new THREE.MeshStandardMaterial({ color: 0x111112, roughness: .8 }), lite = new THREE.MeshStandardMaterial({ color: 0x242427, roughness: .8 });
    for (let f = 0; f < 8; f++) for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(tile, .02, tile), (f + k) % 2 === 0 ? dark : lite); m.position.set((f - 3.5) * tile, .01, (4.5 - (k + 1)) * tile); m.receiveShadow = true; scene.add(m); }
    camPos = [1.5, 15.5, 13.5];
    FEATURED.forEach((f) => { const p = sq(f.square); place(f, p.x * tile, p.z * tile, .7, 1.9, 150); });
    scene.add(new THREE.AmbientLight(0x3a3a44, .6 * light));
    cam = new THREE.PerspectiveCamera(38, width / height, .1, 150); cam.position.set(...camPos); cam.lookAt(-.4, 0, -.2);
  }
  cam.updateMatrixWorld();
  const toScreen = (v) => { const p = v.clone().project(cam); return { x: (p.x + 1) / 2 * width, y: (1 - p.y) / 2 * height }; };
  return { r, scene, cam, anchors, toScreen };
}
