/**
 * 02, The data (key frames lab2-2, lab2-2-m; motion.md §11). 35,405,130 sheets stand at full height. Each of the
 * eight filter planes slides in from the dark side, from the top filter down, and the sheets above it fall off to
 * the white side into five heaps; the stack settles at 20,040,000 and one sheet slides out as the hold-out. The
 * seam follows the stack down, from 50% to 56.6% (on phones it sits on the stack's top, as in lab2-2-m).
 */
import * as THREE from "three";
import { content } from "@/content/site";
import { rng } from "@/lib/three/rng";
import { stage, frame, size, toScreen, compile, disposeStage, span, arrive, type ChapterFactory, type Frame, type Stage, type Tag } from "./kit";
import { type Steps } from "@/lib/three/steps";

const COPY = (content.pageCopy as unknown as { lab: { chapters: { filters: string[]; filtersPhone: string[]; heldOut: string }[] } }).lab.chapters[1];
const FILTERS = COPY.filters;

const AT = 20040000 / 35405130, FULL = 9.2, KEPT = FULL * AT, N = 420, T = KEPT / N;
const NF = Math.round((N * (FULL - KEPT)) / KEPT), TOP = KEPT + T * NF; // what fell away: 43% of the stack
const CAM: Record<string, Frame> = {
  desk: { pos: [-1.5, 6, 29], look: [0.5, 4.6, 0], fov: 32, off: [-0.147, 0.07] },
  phone: { pos: [0.9, 7.4, 34], look: [1.9, 4.6, 0], fov: 30, off: [-0.16, -0.045] },
};
const planeY = (i: number) => KEPT + ((FULL - KEPT) * (i + 0.5)) / FILTERS.length;

// the scrub: a short hold at full height, the eight filters from the top down, the settle, then the hold-out
const HOLD = 0.06, STEP = 0.085, SLIDE = 0.035, FALL = 0.035, SETTLE = HOLD + 8 * STEP, OUT: [number, number] = [0.84, 0.95];
const stepAt = (s: number) => HOLD + s * STEP; // step s brings in plane 7 - s; step 8 is the settle

export const chapter2: ChapterFactory = function* (dayCanvas, nightCanvas, o) {
  const k = o.phone ? "phone" : "desk", ph = o.phone, X = ph ? 1.9 : 3.3;

  // the sheets, placed once (rng(7) in the key frame's order: the kept stack, then the heaps)
  const R = rng(7), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), ONE = new THREE.Vector3(1, 1, 1);
  const kept: THREE.Matrix4[] = [];
  for (let i = 0; i < N; i++) kept.push(new THREE.Matrix4().compose(new THREE.Vector3(X + (R() - 0.5) * 0.05, T * (i + 0.5), (R() - 0.5) * 0.05), new THREE.Quaternion().setFromEuler(E.set(0, (R() - 0.5) * 0.025, 0)), ONE));
  // the heaps (lab2-2); lab2-2-m has none, so on phones the fallen sheets land out of frame and are gone at the end
  const RH = ph ? rng(9) : R, shift = ph ? -5 : 0;
  const end: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
  for (let i = 0; i < NF; i++) {
    const heap = i % 5, cx = [-4.6, -7.4, -10.6, -6, -9.2][heap] + shift, cz = [2.6, 0.6, 2.2, 5.2, 5.6][heap], j = Math.floor(i / 5);
    const y = T * ((j % 60) + 0.5) + (j >= 60 ? 0.02 : 0), spread = j >= 60 ? 1.6 : 0.4;
    const p = new THREE.Vector3(cx + (RH() - 0.5) * spread, y, cz + (RH() - 0.5) * spread);
    end.push({ p, q: new THREE.Quaternion().setFromEuler(E.set((RH() - 0.5) * 0.04, RH() * Math.PI, (RH() - 0.5) * 0.04)) });
  }
  // where each fallen sheet stood: on top of the kept stack, the first to fall (the lowest in its heap) at the top
  const RS = rng(11), start: { p: THREE.Vector3; q: THREE.Quaternion }[] = [], when: number[] = [];
  const perStep: number[][] = Array.from({ length: 9 }, () => []);
  for (let i = 0; i < NF; i++) {
    const y = T * (N + (NF - 1 - i) + 0.5);
    start.push({ p: new THREE.Vector3(X + (RS() - 0.5) * 0.05, y, (RS() - 0.5) * 0.05), q: new THREE.Quaternion().setFromEuler(E.set(0, (RS() - 0.5) * 0.025, 0)) });
    let s = 0; while (s < 8 && y <= planeY(7 - s)) s++; // the first plane, from the top, that it stands above
    perStep[s].push(i);
  }
  perStep.forEach((ids, s) => { const a = stepAt(s) + (s < 8 ? SLIDE * 0.85 : 0), room = (s < 8 ? stepAt(s + 1) : SETTLE + STEP) - a - FALL; ids.forEach((i, r) => { when[i] = a + (ids.length > 1 ? r / (ids.length - 1) : 0) * room; }); });
  const fallT = (p: number, i: number) => span(p, when[i], when[i] + FALL);
  const height = (p: number) => { let h = KEPT; for (let i = 0; i < NF; i++) h += T * (1 - fallT(p, i)); return h; };
  const HO0 = new THREE.Vector3(X, T * 0.4, 0), HO1 = ph ? new THREE.Vector3(X - 3.6, T * 0.4, 1.4) : new THREE.Vector3(X + 3.4, T * 0.4, 1.2), HOR = ph ? 0.5 : 0.18;

  interface Side { s: Stage; fell: THREE.InstancedMesh; planes: THREE.Object3D[][]; ho: THREE.Mesh }
  const build = function* (canvas: HTMLCanvasElement, day: boolean): Steps<Side> {
    const s = yield* stage(canvas, { exposure: day ? 1 : 1.05, env: day ? 0.5 : 0.05, bg: day ? 0xf3f3f1 : 0x0b0e14 }), sc = s.scene;
    sc.add(new THREE.HemisphereLight(day ? 0xffffff : 0x1c2433, day ? 0xd8d5ce : 0x05070a, day ? (ph ? 0.55 : 0.45) : 0.4));
    const key = day ? new THREE.DirectionalLight(0xfff8ee, ph ? 3.2 : 3.6) : new THREE.SpotLight(0xfff0dc, 420, 0, 0.5, 0.75, 1.3);
    if (ph) { key.position.set(day ? -12 : 7, day ? 9 : 13, day ? 10 : 7); key.target.position.set(X, 2.5, 0); }
    else { key.position.set(day ? -18 : 7, day ? 7 : 13, day ? 9 : 7); key.target.position.set(day ? -6 : X, day ? 0 : 2.5, day ? 3 : 0); }
    sc.add(key.target);
    key.castShadow = true; key.shadow.mapSize.set(4096, 4096); if (!ph) key.shadow.radius = 5; key.shadow.bias = -0.0004;
    if (day) { const e = ph ? 14 : 18; Object.assign(key.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 50 }); }
    sc.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: day ? 0xcdcac2 : 0x0d1118, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sc.add(floor);
    if (!day) sc.fog = new THREE.Fog(0x0b0e14, 45, 95); else if (ph) sc.fog = new THREE.Fog(0xf3f3f1, 26, 48);
    const face = new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.85 }), edge = new THREE.MeshStandardMaterial({ color: 0x9c978d, roughness: 0.9 });
    const paper = day ? [edge, edge, face, face, edge, edge] : face;
    const sheet = new THREE.BoxGeometry(2.6, T * 0.8, 1.9);
    const km = new THREE.InstancedMesh(sheet, paper, N); kept.forEach((m, i) => km.setMatrixAt(i, m));
    km.castShadow = km.receiveShadow = true; sc.add(km);
    const fell = new THREE.InstancedMesh(sheet, paper, NF); fell.castShadow = fell.receiveShadow = true; fell.frustumCulled = false; sc.add(fell);
    // held out: one sheet's worth, set apart
    const ho = new THREE.Mesh(new THREE.BoxGeometry(2.6, T * 0.8, 1.9), paper); ho.castShadow = ho.receiveShadow = true; sc.add(ho);
    // the height it was read at, and the eight filters it came down through
    const lc = day ? 0x57534c : 0xb9c0cc;
    const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.62, FULL - KEPT, 1.92)), new THREE.LineDashedMaterial({ color: lc, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: ph ? 0.6 : 0.55 }));
    ghost.position.set(X, KEPT + (FULL - KEPT) / 2, 0); ghost.computeLineDistances(); sc.add(ghost);
    const glass = new THREE.MeshStandardMaterial({ color: day ? 0x9fb0bf : 0x8fa6c8, transparent: true, opacity: ph ? 0.14 : day ? 0.16 : 0.12, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false });
    const [pw, pd] = ph ? [3.4, 2.6] : [3.6, 2.8], pg = new THREE.PlaneGeometry(pw, pd), eg = new THREE.EdgesGeometry(pg);
    const planes = FILTERS.map(() => {
      const g = new THREE.Mesh(pg, glass), e = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: lc, transparent: true, opacity: 0.45 }));
      g.rotation.x = e.rotation.x = -Math.PI / 2; sc.add(g, e); return [g, e];
    });
    return { s, fell, planes, ho };
  };
  yield;
  const sides = [yield* build(dayCanvas, true)]; if (nightCanvas) sides.push(yield* build(nightCanvas, false));
  const d = sides[0].s;
  const stages = sides.map((x) => x.s), c = compile(stages);
  let p = 1;
  const place = () => stages.forEach((s) => { size(s); frame(s, CAM[k]); });
  place();

  const P = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1), TQ = new THREE.Quaternion();
  const planeT = (v: number, i: number) => arrive(span(v, stepAt(7 - i), stepAt(7 - i) + SLIDE));

  return {
    ready: c.ready,
    progress(v) {
      p = o.reduced ? 1 : v;
      for (let i = 0; i < NF; i++) {
        const t = fallT(p, i), a = start[i], b = end[i];
        // slides off to the white side first, then drops, tipping over the edge as it goes
        const h = 1 - (1 - t) * (1 - t);
        P.set(a.p.x + (b.p.x - a.p.x) * h, a.p.y + (b.p.y - a.p.y) * t * t, a.p.z + (b.p.z - a.p.z) * h);
        Q.slerpQuaternions(a.q, b.q, t).premultiply(TQ.setFromAxisAngle(Z, Math.sin(Math.PI * t) * 0.5));
        M.compose(P, Q, ONE);
        for (const sd of sides) sd.fell.setMatrixAt(i, M);
      }
      const gone = ph && p >= SETTLE + STEP; // lab2-2-m shows no heaps
      const ht = arrive(span(p, OUT[0], OUT[1]));
      for (const sd of sides) {
        sd.fell.instanceMatrix.needsUpdate = true; sd.fell.visible = !gone;
        sd.planes.forEach(([g, e], i) => { const t = planeT(p, i); g.position.set(X + (1 - t) * 12, planeY(i), 0); e.position.copy(g.position); g.visible = e.visible = t > 0; });
        sd.ho.position.lerpVectors(HO0, HO1, ht); sd.ho.rotation.y = HOR * ht; sd.ho.visible = ht > 0;
      }
    },
    seam(v) {
      const q = o.reduced ? 1 : v, h = height(q);
      if (!ph) return 0.5 + ((AT - 0.5) * (TOP - h)) / (TOP - KEPT);
      // lab2-2-m: the seam sits exactly on the top of the stack
      frame(d, CAM[k]);
      return Math.min(1, Math.max(0, (1 - new THREE.Vector3(X, h, 0.95).project(d.cam).y) / 2));
    },
    tags(): Tag[] {
      const out: Tag[] = [];
      (ph ? COPY.filtersPhone : FILTERS).forEach((f, i) => {
        if (planeT(p, i) < 1) return;
        out.push({ key: `f${i}`, ...toScreen(d, new THREE.Vector3(X - (ph ? 1.7 : 1.8), planeY(i), ph ? 1.3 : 1.4)), html: `${f}<span></span>`, cls: "r" });
      });
      if (p >= OUT[1]) {
        const a = toScreen(d, ph ? new THREE.Vector3(X - 3.6, T * 2, 1.4) : new THREE.Vector3(X + 3.4, T * 2 + 0.1, 1.2));
        out.push({ key: "ho", x: a.x, y: a.y - (ph ? 14 : 18), html: COPY.heldOut });
      }
      return out;
    },
    render() { if (!c.done()) return; place(); for (const s of stages) s.r.render(s.scene, s.cam); },
    resize: place,
    dispose() { c.ready.then(() => stages.forEach(disposeStage)); },
  };
};
