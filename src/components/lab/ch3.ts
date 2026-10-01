/**
 * 03, Training (key frames lab2-3, lab2-3-m; motion.md §11). Three knight casts on plinths, from rough clay to
 * glaze: the first playing net, the comparison, and the net you can play. The casts turn together while the camera
 * moves along them from clay to glaze, and each score counts up as its cast is reached. All white: no night side.
 */
import * as THREE from "three";
import { piece, piecesReady, MAT } from "@/lib/three/pieces";
import { castOf, geometryOf, source, type Cast as CastData } from "./cast";
import { content } from "@/content/site";
import { stage, frame, size, toScreen, compile, disposeStage, span, arrive, type ChapterFactory, type Frame, type Tag } from "./kit";
import { type Steps } from "@/lib/three/steps";

interface Cast { score: string; shape: string; data: string; role: string }
const CASTS = (content.pageCopy as unknown as { lab: { chapters: { casts: Cast[]; castsPhone: Pick<Cast, "data" | "role">[] }[] } }).lab.chapters[2].casts;
const CASTS_PHONE = (content.pageCopy as unknown as { lab: { chapters: { castsPhone: { data: string; role: string }[] }[] } }).lab.chapters[2].castsPhone;

const KEY: Record<string, Frame> = {
  desk: { pos: [1.2, 3.1, 19], look: [0.9, 1.55, 0], fov: 24, off: [-0.08, -0.13] },
  phone: { pos: [0, 12, 21.5], look: [0, 1.2, -4.5], fov: 24, off: [0, -0.128] },
};
// where the camera starts: on the clay. Desktop trucks along the row at the key frame's distance; the phone's row
// runs into depth, so it starts close over the clay and pulls back past the other two.
const START: Record<string, Frame> = {
  desk: { ...KEY.desk, pos: [-4.1, 3.1, 19], look: [-4.4, 1.55, 0] },
  phone: { ...KEY.phone, pos: [-1.4, 6.6, 1], look: [-1.4, 1.2, -12] },
};
const PLACE = { desk: [[-4.4, 0], [0, 0], [4.4, 0]], phone: [[-1.4, -12], [1.5, -5.5], [-1.1, 1.4]] };
const MOVE: [number, number] = [0.02, 0.92], TURN = Math.PI;
const RISE: [number, number][] = [[0.04, 0.16], [0.4, 0.52], [0.8, 0.92]]; // each score, as its cast is reached
const smooth = (t: number) => t * t * (3 - 2 * t);

// rough casts (cast.ts), worked out once per visit (600 ms of tessellation), not each time the chapter is built, and
// in a worker while it is built in slices; disposing a scene frees their GPU buffers only, so a later build uploads them again
const CAST = new Map<string, THREE.BufferGeometry>();
let worker: Worker | null | undefined, ids = 0;
const replies = new Map<number, (c: CastData) => void>();
function work(position: Float32Array, amp: number, freq: number): Promise<CastData> | null {
  if (worker === undefined) {
    try { worker = new Worker(new URL("./cast.worker.ts", import.meta.url), { type: "module" }); worker.onmessage = (e: MessageEvent<{ id: number; cast: CastData }>) => { replies.get(e.data.id)?.(e.data.cast); replies.delete(e.data.id); }; }
    catch { worker = null; }
  }
  if (!worker) return null;
  const id = ++ids; worker.postMessage({ id, position, amp, freq }, [position.buffer]);
  return new Promise((r) => replies.set(id, r));
}
/** One knight cast in `mat`, roughened by amp and freq: each of its meshes from the worker as it comes, or worked out
 * here if the build is needed at once. */
function* cast(mat: THREE.Material, amp: number, freq: number): Steps<THREE.Group> {
  const g = piece("N", mat), meshes: THREE.Mesh[] = [];
  if (!amp) return g;
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  // the piece's geometries are cached and shared: each cast is worked on a copy
  const jobs = meshes.map((m) => {
    const key = `${amp}|${freq}|${m.geometry.uuid}`;
    if (CAST.has(key)) return { key, wait: null as Promise<CastData> | null, got: null as CastData | null };
    const job = { key, wait: work(source(m.geometry), amp, freq), got: null as CastData | null };
    job.wait?.then((c) => { job.got = c; });
    return job;
  });
  for (const [i, m] of meshes.entries()) {
    const job = jobs[i];
    if (job.wait && !job.got) yield job.wait;
    let geo = CAST.get(job.key);
    if (!geo) { geo = geometryOf(job.got ?? castOf(source(m.geometry), amp, freq)); CAST.set(job.key, geo); }
    m.geometry = geo; yield;
  }
  return g;
}

export const chapter3: ChapterFactory = function* (dayCanvas, _night, o) {
  const k = o.phone ? "phone" : "desk", ph = o.phone;
  const d = yield* stage(dayCanvas, { exposure: 1, env: 0.45, bg: 0xf3f3f1 }), sc = d.scene;
  sc.fog = ph ? new THREE.Fog(0xf3f3f1, 30, 60) : new THREE.Fog(0xf3f3f1, 26, 48);
  sc.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cf, 0.55));
  const key = new THREE.DirectionalLight(0xfff6ea, 3.2); key.position.set(-8, 9, 7); key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 9; key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sc.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(8, 4, 6); sc.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);

  const NETS = [
    { mat: new THREE.MeshStandardMaterial({ color: 0x8e8a83, roughness: 1 }), amp: 0.022, freq: 23 },
    { mat: new THREE.MeshStandardMaterial({ color: 0xe6e2d9, roughness: 0.78 }), amp: 0.005, freq: 47 },
    { mat: MAT.porcelain(), amp: 0, freq: 0 },
  ];
  const pl = new THREE.MeshStandardMaterial({ color: 0xf1efea, roughness: 0.9 }), plinth = new THREE.CylinderGeometry(1.05, 1.05, 0.5, 96);
  yield* piecesReady();
  const knights: THREE.Group[] = [];
  for (const [i, n] of NETS.entries()) {
    const [x, z] = PLACE[k][i];
    const base = new THREE.Mesh(plinth, pl); base.position.set(x, 0.25, z); base.castShadow = base.receiveShadow = true; sc.add(base);
    const kn = yield* cast(n.mat, n.amp, n.freq); kn.scale.setScalar(1.8); kn.position.set(x, 0.5, z); kn.rotation.y = -0.22; sc.add(kn);
    knights.push(kn);
  }

  const c = compile([d]);
  const cam: Frame = { ...KEY[k], pos: [...KEY[k].pos], look: [...KEY[k].look] };
  let p = 1;
  const place = () => { size(d); frame(d, cam); };
  place();

  return {
    ready: c.ready,
    progress(v) {
      p = o.reduced ? 1 : v;
      const s = smooth(span(p, ...MOVE)), a = START[k], b = KEY[k];
      for (let j = 0; j < 3; j++) { cam.pos[j] = a.pos[j] + (b.pos[j] - a.pos[j]) * s; cam.look[j] = a.look[j] + (b.look[j] - a.look[j]) * s; }
      frame(d, cam);
      // the three casts turn together, coming to rest as the key frame has them
      knights.forEach((kn) => { kn.rotation.y = -0.22 - (1 - s) * TURN; });
    },
    seam: () => 1,
    tags(): Tag[] {
      const out: Tag[] = [];
      CASTS.map((n, i) => (ph ? { ...n, ...CASTS_PHONE[i] } : n)).forEach((n, i) => {
        const t = arrive(span(p, ...RISE[i]));
        if (t <= 0) return;
        const dec = (n.score.split(".")[1] ?? "").length, score = t < 1 ? (Number(n.score) * t).toFixed(dec) : n.score;
        const html = `<span class="r">${score}</span>${n.shape}<br><i>${n.data}<br>${n.role}</i>`, [x, z] = PLACE[k][i];
        if (!ph) { const a = toScreen(d, new THREE.Vector3(x, 0, 1.3 + z)); out.push({ key: `c${i}`, x: a.x, y: a.y + 22, html, cls: "p" }); return; }
        // lab2-3-m: the casts left of centre are labelled on their right, and the one right of centre on its left
        const L = x < 0, a = toScreen(d, new THREE.Vector3(x + (L ? 1.3 : -1.3), 1.4, z));
        out.push({ key: `c${i}`, x: a.x, y: a.y - 40, html, cls: L ? "p left" : "p right" });
      });
      return out;
    },
    render() { if (!c.done()) return; place(); d.r.render(d.scene, d.cam); },
    resize: place,
    dispose() { c.ready.then(() => disposeStage(d)); },
  };
};
