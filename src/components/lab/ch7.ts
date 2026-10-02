/**
 * 07, Play (key frames lab2-7, lab2-7-m; motion.md §12): the board seen from overhead, day and night, and the seam
 * where the learned net scores the position. The scene is the board; Play.tsx is the hand that moves on it.
 */
import * as THREE from "three";
import { gsap } from "gsap";
import { piece, sq, MAT, type PieceType } from "@/lib/three/pieces";
import { board as makeBoard, squares, ROLE } from "@/lib/three/board";
import { evalStep } from "@/lib/motion/ease";
import DATA from "@/content/lab-data.json";
import { stage, frame, size, compile, disposeStage, share, type Chapter, type ChapterFactory, type Frame, type Stage } from "./kit";
import { run, type Steps } from "@/lib/three/steps";
import { piecesReady } from "@/lib/three/pieces";
import { NARROW, TABLET } from "@/lib/seam/seam";

export const START = "rnbqkbnr/pppppppp/......../......../......../......../PPPPPPPP/RNBQKBNR";
const LIFT = 0.35;

export interface PlayStage extends Chapter {
  /** set the whole position (rows as in board.ts), with the last move lit */
  set(rows: string, last: [string, string] | null): void;
  /** slide every piece to where it stands in `rows` (600 ms, seam, 10 ms apart): the reset, pieces sliding home */
  slide(rows: string, last: [string, string] | null, ms: number): Promise<void>;
  /** play a move at hand speed: the piece lifts, travels and sets down (ms), a capture is taken away */
  move(from: string, to: string, ms: number): Promise<void>;
  /** press a piece: it lifts and its legal targets show as dots (captures as rings) */
  lift(square: string | null, targets: string[], captures: string[]): void;
  /** drag the lifted piece freely above the board, to a point on screen */
  drag(x: number, y: number): void;
  /** put the lifted piece back on its square (illegal drop) */
  settle(ms: number): Promise<void>;
  /** the square under a point on screen (css px in the frame) */
  pick(x: number, y: number): string | null;
  /** the seam steps to this eval (centipawns, White's view), evalStep over 340 ms */
  eval(cp: number): void;
  /** White at the bottom, or Black */
  orient(white: boolean): void;
  /** handed back to the one page (keep.ts): set back as it was built, and announced again for the game to take */
  restore(): void;
}

type Side = { s: Stage; pieces: Map<string, THREE.Group>; b: ReturnType<typeof makeBoard>; dots: THREE.Group };

let current: PlayStage | null = null;
const listeners = new Set<(p: PlayStage | null) => void>();
/** Play.tsx finds the stage here once the Lab has built it */
export const playStage = {
  get: () => current,
  on(fn: (p: PlayStage | null) => void) { listeners.add(fn); fn(current); return () => { listeners.delete(fn); }; },
};

export const chapter7: ChapterFactory = function* (dayCanvas, nightCanvas, o) {
  const phone = o.phone, at0 = share(43); // the key frames' seam: the learned net's +0.43 after 3…Bc5
  // a tablet held upright has the controls under the board, not above it too, so the camera comes down and the board
  // takes the room (lab.css)
  // and a narrow landscape screen (a tablet on its side, a small laptop) sets the board in the column between the note
  // and the controls, under a one-line title (lab.css). Read at each placing, so a resized window is framed anew.
  const frameNow = (): Frame => {
    if (phone) { const tablet = window.matchMedia(TABLET).matches; return { pos: [0, tablet ? 30 : 36, tablet ? 5.8 : 7], look: [0, 0, 0.2], fov: 30, off: [0, 0.5 - at0 + 0.045] }; }
    if (window.matchMedia(NARROW).matches) return { pos: [0, 31.5, 8.4], look: [0, 0, 0.3], fov: 28, off: [0.045, -0.1] };
    return { pos: [0, 24, 6.4], look: [0, 0, 0.3], fov: 28, off: [0.056, 0.01] };
  };
  const side = function* (canvas: HTMLCanvasElement, day: boolean): Steps<Side> {
    const s = yield* stage(canvas, { exposure: day ? 1 : 1.08, env: day ? 0.45 : 0.1, bg: day ? 0xf3f3f1 : 0x0b0e14 });
    s.scene.add(new THREE.HemisphereLight(day ? 0xffffff : 0x9aa4b8, day ? 0xd8d5ce : 0x0b0e14, day ? 0.8 : 0.25));
    const key = day ? new THREE.DirectionalLight(0xfff8ee, 2.4) : new THREE.SpotLight(0xfff1dc, 150, 0, 0.5, 0.7, 1.5);
    key.position.set(-3, 14, 5); key.target.position.set(0, 0, 0); s.scene.add(key.target);
    key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 6; key.shadow.bias = -0.0004;
    if (day) Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 }); s.scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: day ? 0xe9e7e1 : 0x0d1118, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.18; floor.receiveShadow = true; s.scene.add(floor);
    const b = makeBoard(ROLE); s.scene.add(b.group);
    const dots = new THREE.Group(); s.scene.add(dots);
    return { s, pieces: new Map(), b, dots };
  };
  const sides = [yield* side(dayCanvas, true)]; if (nightCanvas) sides.push(yield* side(nightCanvas, false));
  yield* piecesReady();
  const mats = { w: MAT.ivory(), b: MAT.ebony() };
  const c = compile(sides.map((x) => x.s));
  let white = true, lifted: string | null = null, shown = share(DATA.start.learned.evalCp); // the start position, as game.ts begins
  const dotM = new THREE.MeshBasicMaterial({ color: 0x0d0d0c, transparent: true, opacity: 0.32 });
  const dotG = new THREE.CircleGeometry(0.14, 40), ringG = new THREE.RingGeometry(0.36, 0.44, 48);

  const place = () => { const F = frameNow(); sides.forEach((x) => { size(x.s); frame(x.s, white ? F : { ...F, pos: [-F.pos[0], F.pos[1], -F.pos[2]], look: [-F.look[0], F.look[1], -F.look[2]] }); }); };
  let raf = 0;
  // It draws itself as the game moves, while it is on screen: off it, the Lab draws it as it comes on (its warm and
  // its first frame), and a sleeping one is drawn as it is woken (keep.ts). Drawn off screen as it was built, it
  // took its first shadow pass, and its programs, on the spot (109-196 ms), or gave a sleeping canvas its buffers back.
  const seen = () => { const r = dayCanvas.getBoundingClientRect(); return dayCanvas.width > 1 && r.bottom > 0 && r.top < innerHeight; };
  const draw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (seen()) api.render(); }); };

  const make = (ch: string) => {
    const w = ch === ch.toUpperCase(), t = ch.toUpperCase() as PieceType, p = piece(t, w ? mats.w : mats.b);
    if (t === "N") p.rotation.y = w ? Math.PI / 2 : -Math.PI / 2;
    p.userData.kind = ch; return p;
  };
  const tween = (o: object, to: object, ms: number, delay: number) => new Promise<void>((res) => {
    if (!ms) { Object.assign(o, to); draw(); return res(); }
    // a tween cut short (the pieces set at once, which puts them where it was taking them) settles too: one left
    // waiting held the game busy, with the board answering nothing
    gsap.to(o, { ...to, duration: ms / 1000, delay: delay / 1000, ease: "seam", onUpdate: draw, onComplete: () => res(), onInterrupt: () => res() });
  });
  // The position, set in steps (eight new pieces at a time) for the build, or at once as the game plays. A piece of
  // the same kind already on its square stays, set back to rest there: putting the board back after a page visit,
  // or after a move, made all 64 pieces again (about 100 ms).
  function* setSteps(rows: string, last: [string, string] | null): Steps<void> {
    const at = squares(rows);
    for (const x of sides) {
      const old = x.pieces, next = new Map<string, THREE.Group>();
      let made = 0;
      for (const [name, ch] of Object.entries(at)) {
        const q = sq(name);
        let p = old.get(name);
        if (p && p.userData.kind === ch) { old.delete(name); gsap.killTweensOf([p.position, p.scale]); p.scale.setScalar(1); }
        else { p = make(ch); x.s.scene.add(p); if (++made % 8 === 0) yield; }
        p.position.set(q.x, 0, q.z); next.set(name, p);
      }
      for (const g of old.values()) { gsap.killTweensOf([g.position, g.scale]); x.s.scene.remove(g); }
      x.pieces = next; x.b.light(last ?? []);
    }
    draw();
  }
  const set = (rows: string, last: [string, string] | null) => run(setSteps(rows, last));

  const api: PlayStage = {
    ready: c.ready,
    progress() {}, // Play is not scrubbed: the camera is already overhead (motion.md §11, 07)
    still: true,
    seam: () => shown,
    tags: () => [],
    set,
    slide(rows, last, ms) {
      const want = Object.entries(squares(rows)), tw: Promise<void>[] = [];
      for (const x of sides) {
        // each piece in the new position takes the nearest piece of its kind still standing; the rest leave or arrive
        const left = new Map(x.pieces), next = new Map<string, THREE.Group>();
        const kind = (g: THREE.Group) => g.userData.kind as string;
        want.forEach(([name, ch], i) => {
          const q = sq(name); let best: string | null = null, d = Infinity;
          for (const [s0, g] of left) if (kind(g) === ch) { const p = sq(s0), dd = Math.hypot(p.x - q.x, p.z - q.z); if (dd < d) { d = dd; best = s0; } }
          let g: THREE.Group;
          if (best) { g = left.get(best)!; left.delete(best); }
          else { g = make(ch); g.position.set(q.x, 0, q.z); g.scale.setScalar(0.001); x.s.scene.add(g); tw.push(tween(g.scale, { x: 1, y: 1, z: 1 }, ms, i * 10)); }
          next.set(name, g); tw.push(tween(g.position, { x: q.x, y: 0, z: q.z }, ms, i * 10));
        });
        for (const g of left.values()) tw.push(tween(g.scale, { x: 0.001, y: 0.001, z: 0.001 }, ms, 0).then(() => { x.s.scene.remove(g); }));
        x.pieces = next; x.dots.clear(); x.b.light(last ?? []);
      }
      lifted = null;
      return Promise.all(tw).then(() => draw());
    },
    move(from, to, ms) {
      const a = sq(from), b = sq(to), tw: Promise<void>[] = [];
      for (const x of sides) {
        const p = x.pieces.get(from), cap = x.pieces.get(to);
        if (!p) continue;
        if (cap) tw.push(new Promise((res) => gsap.to(cap.position, { y: 1.6, duration: ms / 1000, ease: "arrive", onUpdate: draw, onComplete: () => { x.s.scene.remove(cap); res(); } })));
        if (cap) gsap.to(cap.scale, { x: 0.001, y: 0.001, z: 0.001, duration: ms / 1000, ease: "arrive" });
        const st = { t: 0 }, y0 = p.position.y;
        tw.push(new Promise((res) => gsap.to(st, { t: 1, duration: ms / 1000, ease: "seam", onUpdate: () => {
          p.position.set(a.x + (b.x - a.x) * st.t, (1 - st.t) * y0 + Math.sin(Math.PI * st.t) * 0.55, a.z + (b.z - a.z) * st.t); draw();
        }, onComplete: () => res() })));
        x.pieces.delete(from); x.pieces.set(to, p);
      }
      lifted = null; sides.forEach((x) => x.dots.clear());
      return Promise.all(tw).then(() => {});
    },
    lift(square, targets, captures) {
      for (const x of sides) {
        if (lifted && lifted !== square) { const p = x.pieces.get(lifted); if (p) gsap.to(p.position, { y: 0, duration: 0.15, ease: "arrive", onUpdate: draw }); }
        x.dots.clear();
        if (!square) continue;
        const p = x.pieces.get(square); if (p) gsap.to(p.position, { y: LIFT, duration: 0.15, ease: "arrive", onUpdate: draw });
        for (const t of targets) { const q = sq(t), m = new THREE.Mesh(captures.includes(t) ? ringG : dotG, dotM); m.rotation.x = -Math.PI / 2; m.position.set(q.x, 0.005, q.z); x.dots.add(m); }
      }
      lifted = square; draw();
    },
    drag(x, y) {
      if (!lifted) return;
      const d = sides[0].s, r = new THREE.Raycaster();
      r.setFromCamera(new THREE.Vector2((x / d.canvas.clientWidth) * 2 - 1, 1 - (y / d.canvas.clientHeight) * 2), d.cam);
      const hit = new THREE.Vector3();
      if (!r.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -LIFT), hit)) return;
      for (const s of sides) { const p = s.pieces.get(lifted); if (p) { gsap.killTweensOf(p.position); p.position.set(hit.x, LIFT, hit.z); } }
      draw();
    },
    settle(ms) {
      const home = lifted; if (!home) return Promise.resolve();
      const q = sq(home);
      return Promise.all(sides.map((x) => new Promise<void>((res) => { const p = x.pieces.get(home); if (!p) return res(); gsap.to(p.position, { x: q.x, y: 0, z: q.z, duration: ms / 1000, ease: "seam", onUpdate: draw, onComplete: () => res() }); })))
        .then(() => { lifted = null; sides.forEach((x) => x.dots.clear()); draw(); });
    },
    pick(x, y) {
      const d = sides[0].s, r = new THREE.Raycaster();
      r.setFromCamera(new THREE.Vector2((x / d.canvas.clientWidth) * 2 - 1, 1 - (y / d.canvas.clientHeight) * 2), d.cam);
      const hit = new THREE.Vector3();
      if (!r.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return null;
      const file = Math.floor(hit.x + 4), rank = Math.floor(5 - hit.z); // sq(): x = file - 3.5, z = 4.5 - rank, cells 1 wide
      return file >= 0 && file < 8 && rank >= 1 && rank <= 8 ? "abcdefgh"[file] + rank : null;
    },
    eval(cp) {
      const from = shown, to = share(cp), st = { t: 0 };
      if (o.reduced) { shown = to; window.dispatchEvent(new Event("lab:seam")); return; }
      gsap.to(st, { t: 1, duration: 0.34, ease: "none", onUpdate: () => { shown = from + (to - from) * evalStep(st.t); window.dispatchEvent(new Event("lab:seam")); } });
    },
    orient(w) { white = w; place(); draw(); },
    restore() {
      for (const x of sides) { for (const g of x.pieces.values()) gsap.killTweensOf([g.position, g.scale]); x.dots.clear(); }
      white = true; lifted = null; shown = share(DATA.start.learned.evalCp);
      place(); if (!listeners.size) set(START, null); // the game sets its own position as it takes the board
      current = api; listeners.forEach((fn) => fn(api));
    },
    render() { if (!c.done()) return; place(); sides.forEach((x) => x.s.r.render(x.s.scene, x.s.cam)); },
    resize() { place(); draw(); },
    dispose() {
      if (current === api) { current = null; listeners.forEach((fn) => fn(null)); }
      cancelAnimationFrame(raf); c.ready.then(() => sides.forEach((x) => disposeStage(x.s)));
    },
  };
  place(); yield* setSteps(START, null);
  current = api; listeners.forEach((fn) => fn(api));
  return api;
};
