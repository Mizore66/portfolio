/**
 * The second board (step 4a, comp A: design/keyframes/side-a.html): a smoked walnut board on a low table
 * in the gallery, under one lamp. It holds the position after 5. d4 with every other line's move laid on it
 * at once, each landing square carrying a trace of amber. Moves from another game, and the project with no
 * move yet, stand aside on the table behind rank 8. Ported from design/keyframes/_shared/sideboard.js.
 * Rendered only when something changes (design/motion.md, Performance).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { sq } from "@/lib/three/pieces";
import { SCULPTURE, disposeScene } from "@/lib/three/sculptures";
import { renderer } from "@/lib/three/env";
import { stageScale, stageTurn } from "@/components/project/stage";

type V3 = [number, number, number];
/** A framing: `sx`, `sy` place the look point on screen (0..1 across and down; .5 is the centre). */
export interface Frame { pos: V3; look: V3; fov: number; sx: number; sy: number }

/** side-a's framing; on phones the board sits at the top and the scoresheet runs below it (side-a-m). */
export const FRAME = {
  desk: { pos: [3.6, 9.2, 8.6], look: [-1.3, 0.3, -0.9], fov: 30, sx: 0.715, sy: 0.52 } as Frame,
  phone: { pos: [0, 13.6, 6.6], look: [-0.8, 0, -2.3], fov: 52, sx: 0.5, sy: 0.441 } as Frame,
};

/** where the pieces set aside stand: on the table, behind rank 8 */
const ASIDE: Record<string, { x: number; z: number }> = { rexcheck: { x: -1.2, z: -5.2 }, "financial-risk-predictor": { x: -3.2, z: -5.2 } };
/** the knights turn to show their profiles to the camera */
const TURN: Record<string, number> = { mirrorfi: -Math.PI / 2 + 0.5, "financial-risk-predictor": -Math.PI / 2 - 0.3 };
const LIFT = 0.16, MAIN = 260, FOCUS = 150;

export interface Sideboard {
  /** screen position (css px, in the canvas) of each piece's tag: just in front of its base */
  anchors(): Record<string, { x: number; y: number }>;
  pick(x: number, y: number): string | null;
  /** 0..1 per project: its own light, and how far it is lifted off its square */
  lights: Record<string, number>;
  lift: Record<string, number>;
  /** the room's light (0..1), its lamp and fill alone (goes out as a piece is opened), and how much of the rest of the set shows */
  room: { k: number; lamp: number; rest: number };
  cam: Frame;
  /** the one piece that stays when `room.rest` fades the others, and its turn from where it stands (0) to its page's (1) */
  keep: string | null;
  spin: { k: number };
  /** where to stand to face a piece exactly as its page frames it (project/stage.ts, scaled to the board) */
  facing(slug: string, at: number, phone: boolean): Frame;
  ready: Promise<void>;
  render(): void; resize(): void; dispose(): void;
}

function board(highlight: string[]) {
  // smoked walnut and pale ash, dimmer than a tournament board
  const light = 0x7c7266, dark = 0x352820, move = 0x7a5424, g = new THREE.Group();
  const lm = new THREE.MeshStandardMaterial({ color: light, roughness: 0.55 }), dm = new THREE.MeshStandardMaterial({ color: dark, roughness: 0.5 });
  const hm = new THREE.MeshStandardMaterial({ color: new THREE.Color(light).lerp(new THREE.Color(move), 0.55), roughness: 0.5 });
  const hd = new THREE.MeshStandardMaterial({ color: new THREE.Color(dark).lerp(new THREE.Color(move), 0.5), roughness: 0.5 });
  const geo = new THREE.BoxGeometry(1, 0.08, 1);
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
    const name = "abcdefgh"[f] + (r + 1), isDark = (f + r) % 2 === 0, hl = highlight.includes(name);
    const m = new THREE.Mesh(geo, hl ? (isDark ? hd : hm) : isDark ? dm : lm);
    const p = sq(name); m.position.set(p.x, -0.04, p.z); m.receiveShadow = true; g.add(m);
  }
  const fr = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.14, 8.9), new THREE.MeshStandardMaterial({ color: 0x221a14, roughness: 0.5 }));
  fr.position.y = -0.1; fr.receiveShadow = fr.castShadow = true; g.add(fr);
  return g;
}

export function createSideboard(canvas: HTMLCanvasElement, list: { slug: string; square: string | null }[], aside: Set<string>): Sideboard {
  const r = renderer(canvas, 1.02);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x09090a);
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env;
  const hemi = new THREE.HemisphereLight(0x2a2a30, 0x050505, 0.35); scene.add(hemi);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; floor.receiveShadow = true; scene.add(floor);
  const table = new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 11), new THREE.MeshStandardMaterial({ color: 0x141312, roughness: 0.6 }));
  table.position.set(-1.2, -0.35, 0); table.receiveShadow = table.castShadow = true; scene.add(table);
  scene.add(board(list.filter((e) => e.square && !aside.has(e.slug)).map((e) => e.square!)));

  const hit: THREE.Object3D[] = [], figure: Record<string, THREE.Group> = {}, at: Record<string, THREE.Vector3> = {}, tag: Record<string, THREE.Vector3> = {};
  const spots: Record<string, THREE.SpotLight> = {}, mats: Record<string, THREE.Material[]> = {}, felts: Record<string, THREE.Object3D[]> = {}, meshes: Record<string, THREE.Mesh[]> = {}, turn0: Record<string, number> = {};
  for (const e of list) {
    const p = SCULPTURE[e.slug]();
    p.rotation.y += TURN[e.slug] ?? 0; turn0[e.slug] = p.rotation.y;
    const q = aside.has(e.slug) || !e.square ? ASIDE[e.slug] ?? { x: -5.2, z: -5.2 } : sq(e.square);
    p.position.set(q.x, 0, q.z);
    mats[e.slug] = []; felts[e.slug] = []; meshes[e.slug] = [];
    p.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.userData.slug = e.slug; if (m.castShadow) meshes[e.slug].push(m);
      if ((Array.isArray(m.material) ? m.material : [m.material]).some((x) => x.userData.shared)) felts[e.slug].push(m); // the shared felt cannot fade: it is hidden
      for (const x of Array.isArray(m.material) ? m.material : [m.material]) if (!x.userData.shared && !mats[e.slug].includes(x)) mats[e.slug].push(x);
    });
    scene.add(p); hit.push(p); figure[e.slug] = p;
    at[e.slug] = new THREE.Vector3(q.x, 0, q.z);
    tag[e.slug] = new THREE.Vector3(q.x + 0.28, 0, q.z + 0.5); // in front of the base, a little right of centre
    // each piece's own narrow light, for when it is the one being read
    const l = new THREE.SpotLight(0xffe6c4, 0, 0, 0.1, 0.7, 1.6);
    l.position.set(q.x - 2.4, 9, q.z + 3.2); l.target.position.set(q.x, 0.5, q.z);
    scene.add(l, l.target); spots[e.slug] = l;
  }

  const lamp = new THREE.SpotLight(0xffe6c4, MAIN, 0, 0.36, 0.8, 1.6);
  lamp.position.set(-4.5, 12, 5); lamp.target.position.set(-1.8, 0, -0.8); scene.add(lamp.target);
  lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.radius = 5; lamp.shadow.bias = -0.0003; scene.add(lamp);
  RectAreaLightUniformsLib.init();
  const panel = new THREE.RectAreaLight(0xfff4e6, 2.2, 10, 2); panel.position.set(0, 6, -7); panel.lookAt(0, 1, 0); scene.add(panel);

  const W = () => canvas.clientWidth, H = () => canvas.clientHeight;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const view: Frame = { ...FRAME.desk, pos: [...FRAME.desk.pos], look: [...FRAME.desk.look] };
  const place = () => {
    cam.position.set(...view.pos); cam.fov = view.fov; cam.aspect = W() / H();
    cam.setViewOffset(W(), H(), (0.5 - view.sx) * W(), (0.5 - view.sy) * H(), W(), H());
    cam.updateProjectionMatrix(); cam.lookAt(...view.look); cam.updateMatrixWorld();
  };
  const lights: Record<string, number> = Object.fromEntries(list.map((e) => [e.slug, 0]));
  const lift: Record<string, number> = Object.fromEntries(list.map((e) => [e.slug, 0]));
  const room = { k: 1, lamp: 1, rest: 1 };
  let keep: string | null = null, faded = 1;
  const spin = { k: 0 };
  const ray = new THREE.Raycaster();

  const fade = (v: number) => { // the rest of the set, as a piece is opened
    if (v === faded) return; faded = v;
    for (const slug in mats) for (const m of mats[slug]) {
      const o = slug === keep ? 1 : v;
      m.transparent = o < 1; m.opacity = o; m.depthWrite = o > 0.5; m.needsUpdate = true;
    }
    for (const slug in felts) for (const f of felts[slug]) f.visible = slug === keep || v > 0.3;
    for (const slug in meshes) for (const m of meshes[slug]) m.castShadow = slug === keep || v > 0.5; // no shadow ghosts
  };

  function resize() { r.setSize(W(), H(), false); place(); }
  resize();
  let compiled = false, gone = false;
  const ready = r.compileAsync(scene, cam).then(() => { compiled = true; }, () => { compiled = true; });

  return {
    lights, lift, room, cam: view, ready, spin,
    get keep() { return keep; }, set keep(v) { keep = v; faded = -1; },
    anchors() {
      place();
      return Object.fromEntries(Object.entries(tag).map(([k, v]) => { const p = v.clone().project(cam); return [k, { x: ((p.x + 1) / 2) * W(), y: ((1 - p.y) / 2) * H() }]; }));
    },
    pick(x, y) {
      place();
      ray.setFromCamera(new THREE.Vector2((x / W()) * 2 - 1, 1 - (y / H()) * 2), cam);
      const h = ray.intersectObjects(hit, true)[0];
      return (h?.object.userData.slug as string) ?? null;
    },
    facing(slug, share, phone) {
      // project/stage.ts: the piece at its stage scale, the camera at (0, 1.25, 11.5) looking at (0, 1.3, 0); here the piece is at 1x
      const p = at[slug], k = 1 / stageScale(slug);
      return { pos: [p.x, p.y + 1.25 * k, p.z + 11.5 * k], look: [p.x, p.y + 1.3 * k, p.z], fov: phone ? 30 : 22, sx: phone ? 0.5 : share, sy: phone ? share : 0.5 };
    },
    render() {
      if (!compiled || gone) return;
      place();
      for (const k in spots) spots[k].intensity = FOCUS * lights[k] * room.k;
      for (const k in figure) figure[k].position.y = LIFT * lift[k];
      if (keep) figure[keep].rotation.y = turn0[keep] + (stageTurn(keep) - turn0[keep]) * spin.k;
      lamp.intensity = MAIN * room.k * room.lamp; panel.intensity = 2.2 * room.k * room.lamp;
      hemi.intensity = 0.35 * room.k * room.lamp; scene.environmentIntensity = 0.16 * room.k * (0.4 + 0.6 * room.lamp);
      fade(room.rest);
      r.render(scene, cam);
    },
    resize,
    dispose() { gone = true; ready.then(() => { disposeScene(scene); env.dispose(); r.dispose(); }); },
  };
}
