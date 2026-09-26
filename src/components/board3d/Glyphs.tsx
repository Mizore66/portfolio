"use client";

/* eslint-disable react-hooks/immutability -- three.js objects (scene, renderer, uniforms) are mutated imperatively by design in R3F; they are not React state. */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { C } from "./materials";

/**
 * The engine view (brief §4, from Revelatio's character screen): the board
 * redrawn as characters, the way an engine prints it. An ID pass renders each
 * object's class into a low-resolution target, one texel per character cell;
 * a full-view quad then draws the matching chess character. The set is chess
 * notation only: `.` and `:` for light and dark squares, `KQRBNP` for White,
 * `kqrbnp` for Black, `+` for the engine's line and its search.
 */

const GLYPHS = " .:+KQRBNPkqrbnp";
const CELL_W = 9;
const CELL_H = 15;

function atlas(): THREE.CanvasTexture {
  const n = GLYPHS.length;
  const w = 48;
  const h = 80;
  const c = document.createElement("canvas");
  c.width = w * n;
  c.height = h;
  const g = c.getContext("2d")!;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono-src").trim() || "monospace";
  g.fillStyle = "#fff";
  g.font = `400 ${Math.round(h * 0.78)}px ${mono}, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let i = 0; i < n; i++) g.fillText(GLYPHS[i], w * i + w / 2, h * 0.54);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

const col = (hex: string) => new THREE.Color(hex);

export function Glyphs({ on, searching }: { on: boolean; searching: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const quad = useRef<THREE.Mesh>(null);
  const cols = Math.max(8, Math.floor(size.width / CELL_W));
  const rows = Math.max(8, Math.floor(size.height / CELL_H));

  const target = useMemo(() => {
    const t = new THREE.WebGLRenderTarget(cols, rows, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
    t.texture.colorSpace = THREE.NoColorSpace;
    return t;
  }, [cols, rows]);
  useEffect(() => () => target.dispose(), [target]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        transparent: false,
        toneMapped: false,
        uniforms: {
          tId: { value: null },
          tAtlas: { value: null },
          uCells: { value: new THREE.Vector2(cols, rows) },
          uTime: { value: 0 },
          uSearch: { value: 0 },
          uPaper: { value: col(C.paper) },
          uInk: { value: col(C.ink) },
          uPencil: { value: col(C.pencil) },
          uHair: { value: col(C.hairline) },
          uGreen: { value: col(C.green) },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D tId; uniform sampler2D tAtlas;
          uniform vec2 uCells; uniform float uTime; uniform float uSearch;
          uniform vec3 uPaper; uniform vec3 uInk; uniform vec3 uPencil; uniform vec3 uHair; uniform vec3 uGreen;
          varying vec2 vUv;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main() {
            vec2 cell = floor(vUv * uCells);
            vec2 local = fract(vUv * uCells);
            vec4 id = texture2D(tId, (cell + 0.5) / uCells);
            float cls = floor(id.r * 8.0 + 0.5);
            float type = floor(id.g * 8.0 + 0.5);
            float glyph = 0.0; vec3 ink = uPencil;
            if (cls == 1.0) { glyph = 1.0; ink = uHair; }
            else if (cls == 2.0) { glyph = 2.0; ink = uGreen; }
            else if (cls == 4.0) { glyph = 3.0 + type; ink = mix(uPencil, uInk, smoothstep(0.2, 0.7, id.b)); }
            else if (cls == 5.0) { glyph = 9.0 + type; ink = uInk; }
            else if (cls == 6.0) { glyph = 3.0; ink = uGreen; }
            // The search: a sparse, shifting scatter of + over the squares while the engine thinks.
            if (uSearch > 0.0 && (cls == 1.0 || cls == 2.0)) {
              float h = hash(cell + floor(uTime * 12.0));
              if (h > 1.0 - 0.035 * uSearch) { glyph = 3.0; ink = uGreen; }
            }
            float a = 0.0;
            if (glyph > 0.0) a = texture2D(tAtlas, vec2((glyph + local.x) / ${GLYPHS.length}.0, local.y)).r;
            gl_FragColor = vec4(mix(uPaper, ink, a), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => {
    material.uniforms.tAtlas.value = atlas();
    return () => {
      (material.uniforms.tAtlas.value as THREE.Texture | null)?.dispose();
      material.dispose();
    };
  }, [material]);
  useEffect(() => {
    material.uniforms.uCells.value.set(cols, rows);
    material.uniforms.tId.value = target.texture;
  }, [cols, rows, target, material]);

  const swapped = useRef<{ obj: THREE.Mesh; mat: THREE.Material | THREE.Material[]; vis: boolean }[]>([]);

  // Priority 0 runs before drei's View container draws the scene.
  useFrame((state) => {
    const q = quad.current;
    if (!q) return;
    q.visible = on;
    if (!on) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uSearch.value = searching ? 1 : 0;
    const list = swapped.current;
    list.length = 0;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (o === q) return;
      if (o.userData.hideInIdPass) {
        list.push({ obj: mesh, mat: mesh.material, vis: o.visible });
        o.visible = false;
      } else if (mesh.isMesh && o.userData.idMaterial) {
        list.push({ obj: mesh, mat: mesh.material, vis: o.visible });
        mesh.material = o.userData.idMaterial as THREE.Material;
      }
    });
    q.visible = false;
    const prevTarget = gl.getRenderTarget();
    const prevScissor = gl.getScissorTest();
    const prevClear = new THREE.Color();
    gl.getClearColor(prevClear);
    const prevAlpha = gl.getClearAlpha();
    const prevShadow = gl.shadowMap.enabled;
    gl.shadowMap.enabled = false;
    gl.setScissorTest(false);
    gl.setRenderTarget(target);
    gl.setClearColor(0x000000, 1);
    gl.clear(true, true, false);
    gl.render(scene, camera);
    gl.setRenderTarget(prevTarget);
    gl.setScissorTest(prevScissor);
    gl.setClearColor(prevClear, prevAlpha);
    gl.shadowMap.enabled = prevShadow;
    for (const s of list) {
      s.obj.material = s.mat as THREE.Material;
      s.obj.visible = s.vis;
    }
    q.visible = true;
    if (searching) invalidate();
  }, 0);

  return (
    <mesh ref={quad} material={material} frustumCulled={false} renderOrder={1000} visible={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
