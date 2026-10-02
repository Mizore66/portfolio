// Art-directed environment maps (Phase 4). Built from emissive panels, then prefiltered with PMREM.
// studio: a pale product studio; gallery: a black room with two narrow strips and a warm softbox; hall: tall daylight windows.
import { THREE } from "/design/keyframes/_shared/chess3d.js";
function bake(r, build) {
  const s = new THREE.Scene(), box = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0xffffff }));
  build(s, box); s.add(box);
  const pm = new THREE.PMREMGenerator(r), t = pm.fromScene(s, .02).texture; pm.dispose(); return t;
}
const panel = (w, h, c, i) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
export const studio = (r) => bake(r, (s, box) => { box.material.color.set(0x8e8c88);
  const a = panel(8, 5, 0xfff4e6, 5); a.position.set(-6, 4, 5); a.lookAt(0, 0, 0); s.add(a);
  const b = panel(10, 3, 0xffffff, 2.2); b.position.set(7, 5, -2); b.lookAt(0, 0, 0); s.add(b);
  const top = panel(12, 12, 0xffffff, 1.4); top.position.set(0, 5.9, 0); top.rotation.x = Math.PI / 2; s.add(top); });
export const gallery = (r) => bake(r, (s, box) => { box.material.color.set(0x050506);
  for (const x of [-4, 4]) { const st = panel(.35, 9, 0xffffff, 6); st.position.set(x, 1, -9.9); s.add(st); }
  const sb = panel(3, 2, 0xffe2b8, 9); sb.position.set(-5, 5.5, 6); sb.lookAt(0, 0, 0); s.add(sb);
  const fl = panel(20, 20, 0x0e0e0f, 1); fl.position.y = -5.9; fl.rotation.x = -Math.PI / 2; s.add(fl); });
export const hall = (r) => bake(r, (s, box) => { box.material.color.set(0xd8d5ce);
  for (let i = -3; i <= 3; i++) { const w = panel(1.6, 7, 0xffffff, 4); w.position.set(i * 2.6, 1.5, -9.9); s.add(w); }
  const sky = panel(20, 20, 0xf6f4ef, 1.6); sky.position.y = 5.9; sky.rotation.x = Math.PI / 2; s.add(sky);
  const fl = panel(20, 20, 0xe6e4de, 1); fl.position.y = -5.9; fl.rotation.x = -Math.PI / 2; s.add(fl); });
