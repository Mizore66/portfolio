// A project piece standing on the seam, on a transparent canvas above the painted halves.
// Keyed from the dark side so the piece inverts like the type: shadowed on white, lit on black.
import { THREE, renderer, applyEnv } from "./chess3d.js";

export function onSeam(canvas, make, { at = .559, scale = 1, height = 1.45, cam = [0, 1.2, 9], look = [0, 1.05, 0], fov = 22, rot = 0 } = {}) {
  const W = innerWidth, H = innerHeight;
  const { r, envTex } = renderer(canvas, { exposure: 1.1 });
  r.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  applyEnv(scene, envTex, .025);
  const s = make(); s.scale.setScalar(scale); s.rotation.y = rot; scene.add(s);
  const key = new THREE.SpotLight(0xfff1dc, 160, 0, .45, .5, 1.4);
  key.position.set(6, 8, -1); key.target.position.set(0, height * scale * .55, 0); scene.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -.0003; scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .12); fill.position.set(2, 3, 6); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: .22 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const c = new THREE.PerspectiveCamera(fov, W / H, .1, 100);
  c.position.set(...cam); c.lookAt(...look);
  c.setViewOffset(W, H, (.5 - at) * W, 0, W, H);
  return { r, scene, cam: c };
}
