/**
 * The day hall (key frame roles-b, "along the row"): seven tables in a horseshoe on the white side, each set at
 * its game's famous position, under a high sun from the windows. Ported from design/keyframes/_shared/hall.js.
 * Rendered only when something changes (design/motion.md, Performance).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { disposeScene } from "@/lib/three/sculptures";
import { renderer } from "@/lib/three/env";
import { warmScenes } from "@/lib/three/warm";
import { board, positionSteps, HALL } from "@/lib/three/board";
import { MAT, piecesReady } from "@/lib/three/pieces";
import { type Steps } from "@/lib/three/steps";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type V3 = [number, number, number];
/** `sx`, `sy`: where the look point sits on screen (0..1 across and down; .5 is the centre) */
export interface Frame { pos: V3; look: V3; fov: number; sx: number; sy: number }

/** roles-b's eye-level view along the row, Deriv's table in front; on phones the row is seen from higher up. */
export const FRAME = {
  desk: { pos: [9.6, 3.6, 4.8], look: [1.4, 0.1, -3.4], fov: 30, sx: 0.7, sy: 0.5 } as Frame,
  phone: { pos: [10.4, 5.2, 7.4], look: [0.4, 0.2, -2.6], fov: 50, sx: 0.34, sy: 0.42 } as Frame,
};

/**
 * The role page's camera around its board (role-a, design/motion/role.html): it looks at LOOK from R0 away and
 * turns 9° (.16 rad) and lowers .5 over the scroll (`orbit` 0..1). On phones it stands 2.2 times further out and higher.
 */
export const LOOK: V3 = [0.9, 0.2, -0.8];
const D = [-8.4 - LOOK[0], 8.6 - LOOK[2]], R0 = Math.hypot(D[0], D[1]), A0 = Math.atan2(D[1], D[0]);
export function seatPos(orbit: number, phone: boolean): V3 {
  const a = A0 + orbit * 0.16, k = phone ? 2.2 : 1;
  return [LOOK[0] + Math.cos(a) * R0 * k, (phone ? 11.6 - orbit * 0.7 : 3.4 - orbit * 0.5), LOOK[2] + Math.sin(a) * R0 * k];
}
export const seatFrame = (orbit: number, phone: boolean): Frame => ({ pos: seatPos(orbit, phone), look: [...LOOK], fov: phone ? 40 : 38, sx: phone ? 0.51 : 0.75, sy: phone ? 0.66 : 0.5 });

/** one board square, in hall units */
export const S = 0.19;
const TOP = 0.8 + 0.014;

export interface Hall {
  lamps: Record<string, number>;
  room: { k: number };
  cam: Frame;
  /** a table's position on the floor (for easing the camera toward it) */
  at(slug: string): THREE.Vector3;
  /**
   * The role page's camera (role-a: the set at full size, the camera at (-8.4, 3.4, 8.6) looking at
   * (.9, .2, -.8), fov 38, the board a quarter screen right), as it stands at this table: where "sitting down" ends.
   */
  seat(slug: string, phone: boolean): Frame;
  /** the table under a point, as seen from `from` (default: the camera as it stands) */
  pick(x: number, y: number, from?: Frame): string | null;
  ready: Promise<void>;
  render(): void; resize(): void; dispose(): void;
  /** one draw of everything in it, into a pixel, so its first real frame is like any other (warmScenes) */
  /** draws everything once into a pixel, a few things a frame (warm.ts) */
  warm(): Promise<void>;
}

function* table(fen: string, last: string[], current: boolean): Steps<THREE.Group> {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: current ? 0xcbbba1 : 0xd6ccbb, roughness: 0.6 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.07, 1.35), wood); top.position.y = 0.76; top.castShadow = top.receiveShadow = true; g.add(top);
  const legM = new THREE.MeshStandardMaterial({ color: 0xb4a78f, roughness: 0.6 }), legG = new THREE.BoxGeometry(0.06, 0.76, 0.06);
  for (const [x, z] of [[-1.05, -0.58], [1.05, -0.58], [-1.05, 0.58], [1.05, 0.58]]) { const l = new THREE.Mesh(legG, legM); l.position.set(x, 0.38, z); l.castShadow = true; g.add(l); }
  const b = board(HALL); b.light(last); b.group.scale.setScalar(S); b.group.position.y = TOP; g.add(b.group);
  // seen small, so fewer segments round each piece
  yield; const p = yield* positionSteps(fen, { white: MAT.ivory(), black: MAT.ebony() }, { lod: true }); p.scale.setScalar(S); p.position.y = TOP; g.add(p);
  const chairM = new THREE.MeshStandardMaterial({ color: 0xcfc6b6, roughness: 0.7 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), chairM); seat.position.set(0, 0.46, -1.05); seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), chairM); back.position.set(0, 0.72, -1.3); back.castShadow = true; g.add(back);
  const cl = new THREE.BoxGeometry(0.04, 0.46, 0.04);
  for (const [x, z] of [[-0.22, -0.83], [0.22, -0.83], [-0.22, -1.27], [0.22, -1.27]]) { const l = new THREE.Mesh(cl, chairM); l.position.set(x, 0.23, z); g.add(l); }
  return yield* bake(g);
}

/**
 * The tables never move: each one's meshes are merged by material, so the hall draws in a few dozen calls rather
 * than well over a thousand (seven sets of 32 pieces and 64 squares, twice with the sun's shadow).
 */
function* bake(g: THREE.Group): Steps<THREE.Group> {
  g.updateMatrixWorld(true);
  const by = new Map<THREE.Material, { geo: THREE.BufferGeometry[]; cast: boolean }>(), meshes: THREE.Mesh[] = [];
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  for (const [i, m] of meshes.entries()) {
    if (i && i % 16 === 0) yield;
    const mat = m.material as THREE.Material, geo = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld);
    for (const k of Object.keys(geo.attributes)) if (k !== "position" && k !== "normal") geo.deleteAttribute(k);
    const e = by.get(mat) ?? { geo: [], cast: false }; e.geo.push(geo); e.cast ||= m.castShadow; by.set(mat, e);
  }
  const out = new THREE.Group();
  for (const [mat, { geo, cast }] of by) {
    yield;
    const m = new THREE.Mesh(mergeGeometries(geo), mat); m.castShadow = cast; m.receiveShadow = true; out.add(m);
    geo.forEach((x) => x.dispose());
  }
  disposeGeometries(g);
  return out;
}
const disposeGeometries = (g: THREE.Object3D) => g.traverse((o) => (o as THREE.Mesh).geometry?.dispose());

/** The hall in steps (steps.ts): the renderer, the environment, the room, then a table at a time. */
export function* hallSteps(canvas: HTMLCanvasElement, list: { slug: string; fen: string; last: string[]; current: boolean }[]): Steps<Hall> {
  const r = renderer(canvas, 1.02); yield;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf2f2ef);
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = 0.55; yield;
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d6cf, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfffaf0, 2.2); sun.position.set(-6, 14, -6); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 8; sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 }); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0xe6e4de, roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 16), new THREE.MeshStandardMaterial({ color: 0xf3f3f0, roughness: 1 })); wall.position.set(0, 8, -11); wall.receiveShadow = true; scene.add(wall);
  const glass = new THREE.MeshBasicMaterial({ color: 0xffffff }), pane = new THREE.PlaneGeometry(1.6, 6);
  for (let i = -3; i <= 3; i++) { const w = new THREE.Mesh(pane, glass); w.position.set(i * 3.4, 6.2, -10.98); scene.add(w); }

  const groups: Record<string, THREE.Group> = {}, lampOf: Record<string, THREE.SpotLight> = {}, hit: THREE.Object3D[] = [];
  yield* piecesReady(true);
  for (const [i, t] of list.entries()) {
    yield;
    const a = Math.PI * (0.12 + (0.76 * i) / 6), R = 7.2, x = -Math.cos(a) * R, z = -Math.sin(a) * R * 0.72 + 2.2;
    const g = yield* table(t.fen, t.last, t.current);
    g.position.set(x, 0, z); g.rotation.y = Math.atan2(-x, 2.2 - z);
    g.traverse((o) => { o.userData.slug = t.slug; });
    scene.add(g); groups[t.slug] = g; hit.push(g);
    // each table's lamp, for when its name is read (motion.md §9)
    const l = new THREE.SpotLight(0xfff1dc, 0, 0, 0.32, 0.6, 1.4);
    l.position.set(x, 5.4, z + 0.4); l.target.position.set(x, TOP, z); scene.add(l, l.target); lampOf[t.slug] = l;
  }
  yield;
  scene.updateMatrixWorld(true);

  const W = () => canvas.clientWidth, H = () => canvas.clientHeight;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const view: Frame = { ...FRAME.desk, pos: [...FRAME.desk.pos], look: [...FRAME.desk.look] };
  const aim = (c: THREE.PerspectiveCamera, v: Frame) => {
    c.position.set(...v.pos); c.fov = v.fov; c.aspect = W() / H();
    c.setViewOffset(W(), H(), (0.5 - v.sx) * W(), (0.5 - v.sy) * H(), W(), H());
    c.updateProjectionMatrix(); c.lookAt(...v.look); c.updateMatrixWorld();
  };
  const place = () => aim(cam, view);
  const pickCam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const lamps: Record<string, number> = Object.fromEntries(list.map((t) => [t.slug, 0]));
  const room = { k: 1 };
  const ray = new THREE.Raycaster();
  function resize() { r.setSize(W(), H(), false); place(); }
  resize();
  // nothing in the hall moves but the camera and the lamps (which cast no shadow): the sun's shadow is drawn once
  r.shadowMap.autoUpdate = false;
  let shadowFrames = 3; // the first frames draw it, so it is there once every program is ready
  let compiled = false, gone = false;
  const ready = r.compileAsync(scene, cam).then(() => { compiled = true; }, () => { compiled = true; });

  return {
    lamps, room, cam: view, ready,
    at: (slug) => groups[slug].position.clone(),
    seat(slug, phone) {
      // the board's origin in the hall: the table's frame, raised to its top and scaled by S
      const g = groups[slug], o = (x: number, y: number, z: number) => new THREE.Vector3(x * S, TOP + y * S, z * S).applyMatrix4(g.matrixWorld);
      const [px, py, pz] = seatPos(0, phone), p = o(px, py, pz), l = o(...LOOK);
      return { pos: [p.x, p.y, p.z], look: [l.x, l.y, l.z], fov: phone ? 40 : 38, sx: phone ? 0.51 : 0.75, sy: phone ? 0.66 : 0.5 };
    },
    pick(x, y, from) {
      // judged in `from` when given (the resting view), so the camera easing toward a table cannot change what is under a still pointer
      if (from) aim(pickCam, from); else place();
      ray.setFromCamera(new THREE.Vector2((x / W()) * 2 - 1, 1 - (y / H()) * 2), from ? pickCam : cam);
      return (ray.intersectObjects(hit, true)[0]?.object.userData.slug as string) ?? null;
    },
    warm() { return compiled && !gone ? warmScenes([{ r, scene }], () => this.render(), { name: "roles: warm" }) : Promise.resolve(); },
    render() {
      if (!compiled || gone) return;
      place();
      for (const k in lampOf) lampOf[k].intensity = 70 * lamps[k] * room.k;
      hemi.intensity = 1.1 * (0.35 + 0.65 * room.k); sun.intensity = 2.2 * room.k;
      if (shadowFrames > 0) { shadowFrames--; r.shadowMap.needsUpdate = true; }
      r.render(scene, cam);
    },
    resize,
    dispose() { gone = true; ready.then(() => { disposeScene(scene); env.dispose(); r.dispose(); }); },
  };
}
