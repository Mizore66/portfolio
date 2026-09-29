// Spot lights as the shader sees them, made cheaper without changing a pixel.
import * as THREE from "three";

const START = "spotLight = spotLights[ i ];", DRAW = "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );";

/**
 * three's spot-light loop, with `pick` run after each spot is read (it may move the spot, as chapter 4's pools do)
 * and a spot whose colour is zero skipped. A light at intensity 0 adds nothing, but every pixel still paid for it:
 * the Other Projects sideboard keeps seven narrow lights at 0 until a row is read. The test is on a uniform, so a
 * frame's pixels all take the same branch and the skip costs next to nothing.
 */
export function spotChunk(pick = "") {
  const c = THREE.ShaderChunk.lights_fragment_begin, a = c.indexOf("#if ( NUM_SPOT_LIGHTS > 0 )"), b = c.indexOf("#pragma unroll_loop_end", a);
  const loop = c.slice(a, b).replace(START, `${START}\n\t\t${pick}\n\t\tif ( spotLight.color != vec3( 0.0 ) ) {`).replace(DRAW, `${DRAW}\n\t\t}`);
  if (!loop.includes("if ( spotLight.color") || !loop.includes(`${DRAW}\n\t\t}`)) throw new Error("three's spot-light chunk has changed");
  return c.slice(0, a) + loop + c.slice(b);
}

/** Every material in `scene` draws its spot lights through spotChunk(); `extra` adds uniforms and declarations. */
export function patchSpots(scene: THREE.Object3D, key: string, chunk = spotChunk(), extra?: (sh: THREE.WebGLProgramParametersWithUniforms) => void) {
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      m.onBeforeCompile = (sh) => { extra?.(sh); sh.fragmentShader = sh.fragmentShader.replace("#include <lights_fragment_begin>", chunk); };
      m.customProgramCacheKey = () => key;
    }
  });
}
