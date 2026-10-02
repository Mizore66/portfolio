/**
 * A role page's set (key frame role-a, prototype design/motion/role.html): the table's game at full size on
 * a table by the hall's windows. Each move is played whole, at hand speed: the piece lifts, travels and sets
 * down; a capture is lifted off and taken away; the rook follows the king 120 ms later. The squares of the
 * last move stay lit amber. Rendered only when something changes.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { disposeScene } from "@/lib/three/sculptures";
import { renderer } from "@/lib/three/env";
import { sq } from "@/lib/three/pieces";
import { board, position, ROLE } from "@/lib/three/board";
import type { GamePly } from "@/content/roles";
import { seatFrame } from "./hall";

export interface Replay {
  /** show the position before ply `k`, with ply k `f` of the way played (0..1) */
  show(k: number, f: number): void;
  /** 0..1 over the page: the camera's turn and fall */
  orbit: number;
  phone: boolean;
  ready: Promise<void>;
  render(): void; resize(): void; dispose(): void;
}

const ARC = 0.55;
const arc = (t: number) => Math.sin(Math.PI * t) * ARC;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function createReplay(canvas: HTMLCanvasElement, plies: GamePly[]): Replay {
  const r = renderer(canvas, 1.02);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf2f2ef);
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = 0.5;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cf, 1.05));
  const sun = new THREE.DirectionalLight(0xfffaf0, 2.3); sun.position.set(-7, 12, -5); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 7; sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); scene.add(sun);
  const b = board(ROLE); scene.add(b.group);
  const table = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xdcd4c6, roughness: 0.8 }));
  table.position.y = -0.42; table.receiveShadow = true; scene.add(table);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(90, 30), new THREE.MeshStandardMaterial({ color: 0xf3f3f0, roughness: 1 })); wall.position.set(0, 8, -24); scene.add(wall);
  const glass = new THREE.MeshBasicMaterial({ color: 0xffffff }), pane = new THREE.PlaneGeometry(3, 12);
  for (let i = -4; i <= 4; i++) { const w = new THREE.Mesh(pane, glass); w.position.set(i * 7, 11, -23.9); scene.add(w); }

  // Every piece of the first position, tracked through the game: where each stands before every ply.
  const set = position(plies[0].before); scene.add(set);
  const pieces = [...set.children] as THREE.Group[];
  const at: (Record<number, string>)[] = [];
  let now: Record<number, string> = Object.fromEntries(pieces.map((p, i) => [i, p.userData.square as string]));
  const who = (s: Record<number, string>, square: string) => Number(Object.keys(s).find((k) => s[+k] === square));
  for (const p of plies) {
    at.push(now); const next = { ...now };
    if (p.cap) delete next[who(now, p.cap)];
    next[who(now, p.from)] = p.to;
    if (p.rook) next[who(now, p.rook[0])] = p.rook[1];
    now = next;
  }
  at.push(now);

  const W = () => canvas.clientWidth || 1, H = () => canvas.clientHeight || 1; // 1, not 0, in a window with no size: a 0/0 aspect made every label NaN
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const st = { orbit: 0, phone: false };
  const seam = gsap.parseEase("seam");
  const place = () => {
    const f = seatFrame(st.orbit, st.phone);
    cam.position.set(...f.pos); cam.fov = f.fov; cam.aspect = W() / H();
    cam.setViewOffset(W(), H(), (0.5 - f.sx) * W(), (0.5 - f.sy) * H(), W(), H());
    cam.updateProjectionMatrix(); cam.lookAt(...f.look); cam.updateMatrixWorld();
  };

  function show(k: number, f: number) {
    k = Math.max(0, Math.min(plies.length, k));
    const s = at[k], ply = plies[k], done = f >= 1 || !ply;
    pieces.forEach((p, i) => {
      const square = s[i];
      p.visible = square != null; p.scale.setScalar(1);
      if (square == null) return;
      const q = sq(square); p.position.set(q.x, 0, q.z);
    });
    if (ply && f > 0) {
      const mover = who(s, ply.from), e = seam(clamp(f)), a = sq(ply.from), c = sq(ply.to);
      pieces[mover].position.set(a.x + (c.x - a.x) * e, done ? 0 : arc(clamp(f)), a.z + (c.z - a.z) * e);
      if (ply.rook) { // the rook follows the king 120 ms (a third of the move) later
        const t = clamp(f * 1.4 - 0.4), g = seam(t), ra = sq(ply.rook[0]), rb = sq(ply.rook[1]);
        pieces[who(s, ply.rook[0])].position.set(ra.x + (rb.x - ra.x) * g, done ? 0 : arc(t) * 0.8, ra.z + (rb.z - ra.z) * g);
      }
      if (ply.cap) { // lifted off and taken away: it rises 1.6 and shrinks to nothing as the mover arrives
        const t = clamp((f - 0.45) / 0.4), m = pieces[who(s, ply.cap)];
        m.position.y = t * 1.6; m.scale.setScalar(1 - t); m.visible = t < 1;
      }
    }
    const last = done && ply ? ply : plies[k - 1];
    b.light(last ? [last.from, last.to] : []);
  }

  function resize() { r.setSize(W(), H(), false); place(); }
  resize(); show(0, 0);
  let compiled = false, gone = false;
  const ready = r.compileAsync(scene, cam).then(() => { compiled = true; }, () => { compiled = true; });
  return {
    show, ready,
    get orbit() { return st.orbit; }, set orbit(v) { st.orbit = v; },
    get phone() { return st.phone; }, set phone(v) { st.phone = v; },
    render() { if (!compiled || gone) return; place(); r.render(scene, cam); },
    resize,
    dispose() { gone = true; ready.then(() => { disposeScene(scene); b.dispose(); env.dispose(); r.dispose(); }); },
  };
}
