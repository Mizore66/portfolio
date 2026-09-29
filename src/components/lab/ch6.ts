/**
 * 06, What failed (key frames lab2-6, lab2-6-m; motion.md §11). One side only, gallery black: six plinths to scale in
 * centipawns (queen, rook, bishop, knight, pawn in basalt on dark plinths, the net's learned knight on a copper one),
 * each under its own spot. The plinths rise to scale, queen first; the net's copper plinth rises last, and two clamp
 * brackets close on its top at the ±60 line. The seam holds at 0 (no white side).
 */
import * as THREE from "three";
import { piece, MAT } from "@/lib/three/pieces";
import { learnedKnight } from "@/lib/three/sculptures";
import { content } from "@/content/site";
import { stage, frame, size, toScreen, compile, disposeStage, span, arrive, type ChapterFactory, type Frame, type Tag } from "./kit";

const COPY = (content.pageCopy as unknown as { lab: { chapters: { plinths: string[] }[] } }).lab.chapters[5];
const K = 0.0052; // scene units per centipawn
const ROW = [["Q", 900], ["R", 500], ["B", 330], ["N", 320], ["P", 100], ["net", 60]] as const;
const CAM: Record<string, Frame> = {
  desk: { pos: [1.5, 3.4, 22], look: [1.2, 2.3, 0], fov: 26, off: [-0.135, -0.13] },
  phone: { pos: [0, 16, 150], look: [0, 2.4, 0], fov: 10.5, off: [0, -0.085] },
};
const LAY = { desk: { x0: -4.9, dx: 1.95, w: 1.5, far: 200, fog: [30, 60], dy: 16 }, phone: { x0: -4.3, dx: 1.72, w: 1.3, far: 400, fog: [170, 260], dy: 10 } };

export const chapter6: ChapterFactory = (dayCanvas, _night, o) => {
  const k = o.phone ? "phone" : "desk", L = LAY[k];
  const d = stage(dayCanvas, { exposure: 1.08, env: 0.07, bg: 0x09090a, fov: 26 });
  d.cam.far = L.far; d.scene.fog = new THREE.Fog(0x09090a, L.fog[0], L.fog[1]);
  d.scene.add(new THREE.HemisphereLight(0x2a2a30, 0x050505, 0.45));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; d.scene.add(floor);
  const plinthM = new THREE.MeshStandardMaterial({ color: 0x19191b, roughness: 0.7 });
  const box = new THREE.BoxGeometry(L.w, 1, L.w); // one unit-tall box, scaled to each plinth's height

  const row = ROW.map(([t, v], i) => {
    const x = L.x0 + i * L.dx, h = v * K, net = t === "net";
    const pl = new THREE.Mesh(box, net ? MAT.copper() : plinthM); pl.castShadow = pl.receiveShadow = true; d.scene.add(pl);
    const pc = net ? learnedKnight() : piece(t, MAT.basalt()); pc.rotation.y = t === "N" || net ? -0.3 : 0; pc.scale.setScalar(1.05); d.scene.add(pc);
    const s = new THREE.SpotLight(0xffe2b8, net ? 520 : 360, 0, 0.19, 0.75, 1.5); s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048); s.shadow.radius = 5; s.shadow.bias = -0.0003; d.scene.add(s.target, s);
    // queen first, 0.1 apart; the net last, after a beat
    const at = net ? 0.6 : i * 0.1, dur = net ? 0.22 : 0.3;
    return { x, h, pl, pc, s, at, dur, t: 1, html: `${net ? "±" + v : v}<br><i>${COPY.plinths[i]}</i>`, key: COPY.plinths[i] };
  });

  // the clamp: two thin bars in the plinths' material, one from above and one from below, closing on the net's top edge (the 60 cp line)
  const net = row[5], jaw = new THREE.BoxGeometry(L.w + 0.24, 0.03, 0.05), JZ = L.w / 2 + 0.04, GAP = 0.035;
  const jaws = [{ m: new THREE.Mesh(jaw, plinthM), from: net.h + 0.4, to: net.h + GAP }, { m: new THREE.Mesh(jaw, plinthM), from: 0.02, to: net.h - GAP }];
  jaws.forEach(({ m }) => { m.castShadow = m.receiveShadow = true; m.position.set(net.x, 0, JZ); d.scene.add(m); });

  const c = compile([d]);
  let p = 1;
  const place = () => { size(d); frame(d, CAM[k]); };
  place();

  const chapter = {
    ready: c.ready,
    progress(v: number) {
      p = o.reduced ? 1 : v;
      for (const r of row) {
        r.t = arrive(span(p, r.at, r.at + r.dur));
        const hh = r.h * r.t;
        r.pl.scale.y = Math.max(0.001, hh); r.pl.position.set(r.x, hh / 2, 0); r.pl.visible = r.t > 0;
        r.pc.position.set(r.x, hh, 0);
        r.s.position.set(r.x - 3, hh + 9, 5); r.s.target.position.set(r.x, hh + 0.6, 0); r.s.target.updateMatrixWorld();
      }
      const shut = arrive(span(p, 0.84, 1));
      for (const j of jaws) { j.m.position.y = j.from + (j.to - j.from) * shut; j.m.scale.x = Math.max(0.001, shut); j.m.visible = shut > 0; }
    },
    seam: () => 0,
    tags(): Tag[] {
      return row.filter((r) => r.t >= 1).map((r) => { const q = toScreen(d, new THREE.Vector3(r.x, 0, 1)); return { key: r.key, x: q.x, y: q.y + L.dy, html: r.html, cls: "p" }; });
    },
    render() { if (!c.done()) return; place(); d.r.render(d.scene, d.cam); },
    resize: place,
    dispose() { c.ready.then(() => disposeStage(d)); },
  };
  chapter.progress(1);
  return chapter;
};
