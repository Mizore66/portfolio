/**
 * A project's piece standing on the seam (key frame proj-a), on a transparent canvas above the painted
 * halves. Keyed from the dark side, so the piece inverts like the type: shadowed on white, lit on black.
 * Ported from design/keyframes/_shared/project.js.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SCULPTURE, disposeScene } from "@/lib/three/sculptures";
import { renderer } from "@/lib/three/env";

const SCALE = 1.9, HEIGHT = 1.45;
/** the king stands taller than the bishops, and the glass bishop sits under a two-line name: both are scaled down so they clear it */
const SIZE: Record<string, number> = { rexcheck: 1.3, "slm-distillation-engine": 1.7 };
export const stageScale = (slug: string) => SIZE[slug] ?? SCALE;
/** the piece's turn about its axis as the page first shows it */
export const stageTurn = (slug: string) => ROT[slug] ?? 0;
/** proj-a's framing; the knight turns to show its profile */
const ROT: Record<string, number> = { faultline: 0, "gemini-teleportal": 0.35, circuitmindai: -0.5, mirrorfi: -0.15, "financial-risk-predictor": 0.6 };
/** metal and glass read as themselves only with something to reflect */
const ENV: Record<string, number> = {
  "gemini-teleportal": 0.3, mirrorfi: 0.35, "financial-risk-predictor": 0.3, "multi-agent-graphrag": 0.3, "slm-distillation-engine": 0.3, rexcheck: 0.25,
};

export interface ProjectStage {
  /** the seam's share (0..1) and direction; the piece stands on it */
  seat(at: number, phone: boolean): void;
  /** extra turn about the piece's axis (radians) and the key light's swing (radians) */
  pose: { turn: number; light: number };
  /** resolves once the shaders are compiled; render() waits for it */
  ready: Promise<void>;
  render(): void; resize(): void; dispose(): void;
}

export function createProjectStage(canvas: HTMLCanvasElement, slug: string): ProjectStage {
  const r = renderer(canvas, 1.1);
  r.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = env; scene.environmentIntensity = ENV[slug] ?? 0.025;
  const s = SCULPTURE[slug](), base = ROT[slug] ?? 0;
  s.scale.setScalar(stageScale(slug)); s.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(s);
  const key = new THREE.SpotLight(0xfff1dc, 160, 0, 0.45, 0.5, 1.4), K0 = new THREE.Vector3(5.2, 12, -1.6);
  key.position.copy(K0); key.target.position.set(0, HEIGHT * SCALE * 0.55, 0); scene.add(key.target);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.12); fill.position.set(2, 3, 6); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.13 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const cam = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
  cam.position.set(0, 1.25, 11.5); cam.lookAt(0, 1.3, 0);
  let seat = { at: 0.559, phone: false };
  const pose = { turn: 0, light: 0 };
  const Y = new THREE.Vector3(0, 1, 0);

  function frame() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    cam.aspect = W / H;
    // on phones the piece is smaller against the tall frame, and stands across the horizontal seam
    cam.fov = seat.phone ? 30 : 22;
    if (seat.phone) cam.setViewOffset(W, H, 0, (0.5 - seat.at) * H, W, H);
    else cam.setViewOffset(W, H, (0.5 - seat.at) * W, 0, W, H);
    cam.updateProjectionMatrix();
  }
  function resize() { r.setSize(canvas.clientWidth, canvas.clientHeight, false); frame(); }
  resize();
  // compiled asynchronously, so building the stage never holds the page change (see work/gallery.ts)
  let compiled = false, gone = false;
  const ready = r.compileAsync(scene, cam).then(() => { compiled = true; }, () => { compiled = true; });

  return {
    pose, ready,
    seat(at, phone) { seat = { at, phone }; frame(); },
    render() {
      if (!compiled || gone) return;
      s.rotation.y = base + pose.turn;
      key.position.copy(K0).applyAxisAngle(Y, pose.light);
      r.render(scene, cam);
    },
    resize,
    dispose() { gone = true; ready.then(() => { disposeScene(scene); env.dispose(); r.dispose(); }); }, // not mid-compile: three would poll a freed program
  };
}
