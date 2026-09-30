// The 404's scene, loaded only when a 404 is shown (NotFound.tsx): Next loads the not-found page's scripts on every
// page, and importing three.js here put a second copy of it into every page's first load (phase 6, the load budget).
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PHONE } from "@/lib/seam/seam";
import { renderer } from "@/lib/three/env";
import { piece, MAT } from "@/lib/three/pieces";
import { disposeScene } from "@/lib/three/sculptures";

/** One captured pawn on its side under a spot, set beside the board (key frame 404-c). Drawn once, and on resize. */
export function pawn(canvas: HTMLCanvasElement) {
  const r = renderer(canvas, 1.05), scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.background = new THREE.Color(0x09090a); scene.environment = env; scene.environmentIntensity = 0.08;
  scene.add(new THREE.HemisphereLight(0x9aa4b8, 0x09090a, 0.18));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const p = piece("P", MAT.ivory()); p.rotation.z = Math.PI / 2 - 0.06; p.rotation.y = 0.55; p.position.set(0, 0.285, 0); scene.add(p);
  const spot = new THREE.SpotLight(0xffe2b8, 90, 0, 0.22, 0.75, 1.6); spot.position.set(-2.2, 7.5, 2.6); spot.target.position.set(0, 0, 0);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.radius = 5; spot.shadow.bias = -0.0003; scene.add(spot, spot.target);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const draw = () => {
    const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1, ph = window.matchMedia(PHONE).matches;
    r.setSize(W, H, false); cam.fov = ph ? 34 : 26; cam.aspect = W / H; cam.position.set(2.6, 2.3, 5.2);
    cam.setViewOffset(W, H, (ph ? -0.14 : -0.2) * W, (ph ? 0.16 : 0.02) * H, W, H); cam.updateProjectionMatrix(); cam.lookAt(0, 0.25, 0);
    r.render(scene, cam);
  };
  const ready = r.compileAsync(scene, cam).catch(() => {}).then(draw);
  return { ready, draw, dispose() { ready.then(() => { disposeScene(scene); env.dispose(); r.dispose(); }); } };
}
