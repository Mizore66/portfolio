/**
 * The Work room (key frame work-c, "the floor is the board"): the night gallery seen from above. Each
 * featured project stands on a plinth on the square its move landed on, under its own spot.
 * Ported from design/keyframes/_shared/gallery.js ("plan").
 * Rendered only when something changes (design/motion.md, Performance).
 */
import * as THREE from "three";
import { sq } from "@/lib/three/pieces";
import { SCULPTURE, disposeScene } from "@/lib/three/sculptures";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { renderer } from "@/lib/three/env";

const TILE = 2.2, PLINTH = 0.7, SCALE = 1.9, SPOT = 150;
type V3 = [number, number, number];

export interface View { pos: V3; look: V3; fov: number; /** where on screen the look point sits (0..1 across, or down on phones); .5 is the centre */ shift?: number }

/** work-c's framing; on phones the camera looks along the floor from the g-file side, so the pieces stack. */
export const VIEW = {
  desk: { pos: [1.5, 15.5, 13.5], look: [-0.4, 0, -0.2], fov: 38 } as View,
  phone: { pos: [17, 12.5, 3.2], look: [0.6, 0.4, -1.4], fov: 44 } as View,
};

export interface Gallery {
  /** screen position (css px) of each piece's label anchor, just under its plinth's front edge */
  anchors(phone: boolean): Record<string, { x: number; y: number }>;
  /** the project whose piece is under a point (css px), if any */
  pick(x: number, y: number): string | null;
  /** 0..1 per project: how far its spot is up */
  lights: Record<string, number>;
  /** the room's light as a whole, 0..1; `fill`: its ambient share alone (goes out as a piece is opened) */
  room: { k: number; fill: number };
  cam: { pos: THREE.Vector3; look: THREE.Vector3; fov: number; shift: number; phone: boolean };
  /** where to stand to face a piece exactly as its page frames it (the step into its page) */
  facing(slug: string, at: number, phone: boolean): View;
  /** resolves once the shaders are compiled (off the main thread where the browser can); render() waits for it */
  ready: Promise<void>;
  render(): void; resize(): void; dispose(): void;
}

export function createGallery(canvas: HTMLCanvasElement, slugs: { slug: string; square: string }[]): Gallery {
  const r = renderer(canvas, 1.05);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x09090a);
  // work-c's own environment (a neutral room at .22), which keeps the floor's squares and the aluminium readable
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env;
  const hemi = new THREE.HemisphereLight(0x2a2a30, 0x050505, 0.35), amb = new THREE.AmbientLight(0x3a3a44, 0.6);
  scene.add(hemi, amb);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const dark = new THREE.MeshStandardMaterial({ color: 0x111112, roughness: 0.8 }), lite = new THREE.MeshStandardMaterial({ color: 0x242427, roughness: 0.8 });
  const tileGeo = new THREE.BoxGeometry(TILE, 0.02, TILE);
  for (let f = 0; f < 8; f++) for (let k = 0; k < 8; k++) {
    const m = new THREE.Mesh(tileGeo, (f + k) % 2 === 0 ? dark : lite);
    m.position.set((f - 3.5) * TILE, 0.01, (4.5 - (k + 1)) * TILE); m.receiveShadow = true; scene.add(m);
  }
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x151516, roughness: 0.7 }), plinthGeo = new THREE.BoxGeometry(1.9, PLINTH, 1.9);

  const spots: Record<string, THREE.SpotLight> = {}, hit: THREE.Object3D[] = [], at: Record<string, THREE.Vector3> = {};
  const anchor: Record<string, THREE.Vector3> = {}, side: Record<string, THREE.Vector3> = {};
  const deskCam = VIEW.desk.pos;
  for (const { slug, square } of slugs) {
    const p = sq(square), x = p.x * TILE, z = p.z * TILE;
    const pl = new THREE.Mesh(plinthGeo, plinthMat); pl.position.set(x, PLINTH / 2, z); pl.castShadow = pl.receiveShadow = true; scene.add(pl);
    const s = SCULPTURE[slug](); s.scale.setScalar(SCALE); s.position.set(x, PLINTH, z);
    s.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = o.receiveShadow = true; o.userData.slug = slug; } });
    pl.userData.slug = slug;
    if (slug === "gemini-teleportal") s.rotation.y = Math.atan2(deskCam[0] - x, deskCam[2] - z) - 0.45;
    scene.add(s); hit.push(s, pl);
    const l = new THREE.SpotLight(0xffe2b8, 0, 0, 0.2, 0.8, 1.6);
    l.position.set(x - 4.5, 11, z + 4.5); l.target.position.set(x, PLINTH + 1.1, z);
    l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.radius = 5; l.shadow.bias = -0.0003;
    scene.add(l, l.target); spots[slug] = l;
    at[slug] = new THREE.Vector3(x, PLINTH, z);
    anchor[slug] = new THREE.Vector3(x, PLINTH - 0.15, z + 0.96);
    side[slug] = new THREE.Vector3(x, PLINTH + 1.3, z); // phones: the label sits beside the piece, at its middle
  }

  const W = () => canvas.clientWidth, H = () => canvas.clientHeight;
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 150);
  const view = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 38, shift: 0.5, phone: false };
  const lights: Record<string, number> = Object.fromEntries(slugs.map((s) => [s.slug, 0]));
  const room = { k: 0, fill: 1 };
  const place = () => {
    // The room is framed at 16:10 (work-c). In a narrower window the vertical field widens so the three pieces keep
    // their width on screen; the widening fades out as the camera steps down to a project (fov 22), whose page it cuts to.
    const aspect = W() / H(), k = view.phone ? 0 : Math.min(1, Math.max(0, (view.fov - 22) / 16)), fit = Math.max(1, 1.6 / aspect);
    const fov = fit > 1 ? (2 * Math.atan(Math.tan((view.fov * Math.PI) / 360) * fit) * 180) / Math.PI : view.fov;
    cam.position.copy(view.pos); cam.fov = view.fov + (fov - view.fov) * k; cam.aspect = aspect;
    const d = 0.5 - view.shift;
    if (Math.abs(d) < 1e-4) cam.clearViewOffset();
    else if (view.phone) cam.setViewOffset(W(), H(), 0, d * H(), W(), H());
    else cam.setViewOffset(W(), H(), d * W(), 0, W(), H());
    cam.updateProjectionMatrix(); cam.lookAt(view.look); cam.updateMatrixWorld();
  };
  const ray = new THREE.Raycaster();

  function resize() { r.setSize(W(), H(), false); place(); }
  resize();
  // Compiling the programs at once would hold the page change past the browser's view-transition timeout
  // on a slow device; compile them asynchronously and draw once they are in.
  let compiled = false, gone = false;
  const ready = r.compileAsync(scene, cam).then(() => { compiled = true; }, () => { compiled = true; });

  return {
    lights, room, cam: view, ready,
    anchors(phone) {
      place();
      return Object.fromEntries(Object.entries(phone ? side : anchor).map(([k, v]) => { const p = v.clone().project(cam); return [k, { x: ((p.x + 1) / 2) * W(), y: ((1 - p.y) / 2) * H() }]; }));
    },
    pick(x, y) {
      place();
      ray.setFromCamera(new THREE.Vector2((x / W()) * 2 - 1, 1 - (y / H()) * 2), cam);
      const h = ray.intersectObjects(hit, true)[0];
      let o: THREE.Object3D | null = h?.object ?? null;
      while (o && !o.userData.slug) o = o.parent;
      return (o?.userData.slug as string) ?? null;
    },
    facing(slug, share, phone) {
      // project/stage.ts: the camera at (0, 1.25, 11.5) looking at (0, 1.3, 0), the piece on the seam
      const p = at[slug];
      return { pos: [p.x, p.y + 1.25, p.z + 11.5], look: [p.x, p.y + 1.3, p.z], fov: phone ? 30 : 22, shift: share };
    },
    render() {
      if (!compiled || gone) return;
      place();
      for (const k in spots) spots[k].intensity = SPOT * lights[k] * room.k;
      const f = room.k * room.fill;
      hemi.intensity = 0.35 * f; amb.intensity = 0.6 * f; scene.environmentIntensity = 0.22 * f;
      r.render(scene, cam);
    },
    resize,
    dispose() { gone = true; ready.then(() => { disposeScene(scene); tileGeo.dispose(); plinthGeo.dispose(); env.dispose(); r.dispose(); }); }, // not mid-compile: three would poll a freed program
  };
}
