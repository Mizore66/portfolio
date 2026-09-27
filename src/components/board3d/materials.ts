import * as THREE from "three";
import { BORDER, MAT } from "./world";

/** Phase 1 palette (site.css mirrors it). Plastics are materials, not tokens. */
export const C = {
  paper: "#F1F2EC",
  ink: "#161B19",
  pencil: "#57605B",
  hairline: "#D2D6CE",
  green: "#3B6A4B",
  buff: "#E8E2C9",
  ivoryPlastic: "#E7E0CA",
  blackPlastic: "#1B1E1C",
} as const;

function fontFamily(): string {
  if (typeof document === "undefined") return "sans-serif";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-sans-src").trim();
  return v ? `${v}, sans-serif` : "sans-serif";
}

/** The printed face of the vinyl mat: squares, a keyline, coordinates read from both sides. */
function matTexture(px: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const s = px / MAT;
  const b = BORDER * s;
  g.fillStyle = C.buff;
  g.fillRect(0, 0, px, px);
  g.fillStyle = C.green;
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) if ((f + r) % 2 === 0) g.fillRect(b + f * s, b + (7 - r) * s, s, s);
  g.strokeStyle = C.green;
  g.lineWidth = s * 0.028;
  g.strokeRect(b - s * 0.06, b - s * 0.06, 8 * s + s * 0.12, 8 * s + s * 0.12);
  g.font = `500 ${Math.round(s * 0.26)}px ${fontFamily()}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const files = "abcdefgh";
  for (let i = 0; i < 8; i++) {
    const x = b + (i + 0.5) * s;
    g.fillText(files[i], x, px - b / 2);
    g.save(); g.translate(x, b / 2); g.rotate(Math.PI); g.fillText(files[i], 0, 0); g.restore();
    const y = b + (7 - i + 0.5) * s;
    g.fillText(String(i + 1), b / 2, y);
    g.save(); g.translate(px - b / 2, y); g.rotate(Math.PI); g.fillText(String(i + 1), 0, 0); g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Fine pebble grain of calendered vinyl, as a bump map. */
function grainTexture(px: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const img = g.createImageData(px, px);
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < px * px; i++) {
    const v = 118 + rnd() * 20;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

/**
 * The mat's classes for the engine view's ID pass: R encodes the class
 * (light square 1, dark square 2, border 3) in eighths.
 */
function matIdTexture(px: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const s = px / MAT;
  const b = BORDER * s;
  g.fillStyle = "rgb(96,0,0)";
  g.fillRect(0, 0, px, px);
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
    g.fillStyle = (f + r) % 2 === 0 ? "rgb(64,0,0)" : "rgb(32,0,0)";
    g.fillRect(b + f * s, b + (7 - r) * s, s, s);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}

export type Materials = {
  mat: THREE.MeshPhysicalMaterial;
  matId: THREE.MeshBasicMaterial;
  plastic: { w: THREE.MeshPhysicalMaterial; b: THREE.MeshPhysicalMaterial };
  slit: { w: THREE.MeshStandardMaterial; b: THREE.MeshStandardMaterial };
  felt: THREE.MeshStandardMaterial;
  pieceId: { w: THREE.ShaderMaterial; b: THREE.ShaderMaterial };
  arrow: THREE.MeshBasicMaterial;
  arrowStrong: THREE.MeshBasicMaterial;
  arrowId: THREE.MeshBasicMaterial;
  hover: THREE.MeshBasicMaterial;
};

let cache: Materials | null = null;

/** The mat's print at a size the screen can use: 2048 px only where the board can be that sharp. */
function matSize(): number {
  return window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1600 ? 2048 : 1024;
}

const tex: { map?: THREE.CanvasTexture; bump?: THREE.CanvasTexture; id?: THREE.CanvasTexture } = {};

/** Steps the loader runs a task at a time before the canvas mounts, so no one task blocks input for long. */
export const MATERIAL_STEPS: (() => void)[] = [
  () => void (tex.map ??= matTexture(matSize())),
  () => void (tex.bump ??= grainTexture(512)),
  () => void (tex.id ??= matIdTexture(512)),
  () => void materials(),
];

/** Piece classes for the ID pass: R = class (white 4, black 5), G = piece type, B = lambert shade. */
function pieceIdMaterial(cls: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uClass: { value: cls / 8 }, uType: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      void main() {
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uClass; uniform float uType;
      varying vec3 vN;
      void main() {
        float shade = clamp(dot(normalize(vN), normalize(vec3(-0.4, 0.8, 0.5))) * 0.5 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(uClass, uType, shade, 1.0);
      }`,
  });
}

export function materials(): Materials {
  if (cache) return cache;
  const plastic = (hex: string, roughness: number) =>
    new THREE.MeshPhysicalMaterial({ color: hex, roughness, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.28, specularIntensity: 0.6 });
  cache = {
    mat: new THREE.MeshPhysicalMaterial({
      map: (tex.map ??= matTexture(matSize())),
      bumpMap: (tex.bump ??= grainTexture(512)),
      bumpScale: 0.35,
      roughness: 0.58,
      metalness: 0,
      sheen: 0.15,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color("#ffffff"),
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
    }),
    matId: new THREE.MeshBasicMaterial({ map: (tex.id ??= matIdTexture(512)), toneMapped: false }),
    plastic: { w: plastic(C.ivoryPlastic, 0.42), b: plastic(C.blackPlastic, 0.32) },
    slit: { w: new THREE.MeshStandardMaterial({ color: "#8f8a7a", roughness: 0.6 }), b: new THREE.MeshStandardMaterial({ color: "#050606", roughness: 0.6 }) },
    felt: new THREE.MeshStandardMaterial({ color: C.green, roughness: 1 }),
    pieceId: { w: pieceIdMaterial(4), b: pieceIdMaterial(5) },
    arrow: new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.42, depthWrite: false, toneMapped: false }),
    arrowStrong: new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.78, depthWrite: false, toneMapped: false }),
    arrowId: new THREE.MeshBasicMaterial({ color: new THREE.Color(6 / 8, 0, 0), toneMapped: false }),
    hover: new THREE.MeshBasicMaterial({ color: C.buff, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }),
  };
  return cache;
}
