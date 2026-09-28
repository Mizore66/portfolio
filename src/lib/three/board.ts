// A plain tournament board and a position on it, for the day hall and the role pages.
// Ported from design/keyframes/_shared/chess3d.js (board, position). One square = 1 unit, as in pieces.ts.
import * as THREE from "three";
import { piece, sq, MAT, type PieceType } from "./pieces";

export interface BoardColours { light: number; dark: number; frame: number; move: number }
/** the hall's maple and walnut, paler than the gallery's (hall.js) */
export const HALL: BoardColours = { light: 0xe6dcc7, dark: 0xa38c6f, frame: 0xbfa888, move: 0xe8a33d };
/** the role page's set (role-a): the key frames' default board */
export const ROLE: BoardColours = { light: 0xe2d6bf, dark: 0x9c8468, frame: 0xb79e7c, move: 0xe8a33d };

export interface Board {
  group: THREE.Group;
  /** light these squares in amber (the last move); the rest go back to plain */
  light(squares: string[]): void;
  dispose(): void;
}

export function board(c: BoardColours): Board {
  const g = new THREE.Group();
  const lm = new THREE.MeshStandardMaterial({ color: c.light, roughness: 0.55 }), dm = new THREE.MeshStandardMaterial({ color: c.dark, roughness: 0.5 });
  const hm = new THREE.MeshStandardMaterial({ color: new THREE.Color(c.light).lerp(new THREE.Color(c.move), 0.55), roughness: 0.5 });
  const hd = new THREE.MeshStandardMaterial({ color: new THREE.Color(c.dark).lerp(new THREE.Color(c.move), 0.5), roughness: 0.5 });
  const geo = new THREE.BoxGeometry(1, 0.08, 1), cells: Record<string, THREE.Mesh> = {};
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
    const name = "abcdefgh"[f] + (r + 1), m = new THREE.Mesh(geo, (f + r) % 2 === 0 ? dm : lm);
    const p = sq(name); m.position.set(p.x, -0.04, p.z); m.receiveShadow = true; g.add(m); cells[name] = m;
  }
  const fr = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.14, 8.9), new THREE.MeshStandardMaterial({ color: c.frame, roughness: 0.5 }));
  fr.position.y = -0.1; fr.receiveShadow = fr.castShadow = true; g.add(fr);
  let lit: string[] = [];
  return {
    group: g,
    light(squares) {
      for (const s of lit) { const [f, r] = [s.charCodeAt(0) - 97, +s[1] - 1]; cells[s].material = (f + r) % 2 === 0 ? dm : lm; }
      for (const s of squares) { const [f, r] = [s.charCodeAt(0) - 97, +s[1] - 1]; cells[s].material = (f + r) % 2 === 0 ? hd : hm; }
      lit = squares;
    },
    dispose() { geo.dispose(); fr.geometry.dispose(); for (const m of [lm, dm, hm, hd, fr.material as THREE.Material]) m.dispose(); },
  };
}

/** Where each piece stands in a position written as board rows ("rnbqkbnr/pppppppp/......../…", "." for empty). */
export function squares(rows: string): Record<string, string> {
  const out: Record<string, string> = {};
  rows.replace(/\d/g, (d) => ".".repeat(+d)).split("/").forEach((row, i) => [...row].forEach((ch, f) => { if (ch !== ".") out["abcdefgh"[f] + (8 - i)] = ch; }));
  return out;
}

/** A position as a group of pieces, each knowing its square (userData.square). Materials are shared across the set. */
export function position(rows: string, mats = { white: MAT.ivory(), black: MAT.ebony() }, { lod = false } = {}): THREE.Group {
  const g = new THREE.Group();
  for (const [name, ch] of Object.entries(squares(rows))) {
    const w = ch === ch.toUpperCase(), t = ch.toUpperCase() as PieceType, p = piece(t, w ? mats.white : mats.black, { lod });
    const s = sq(name); p.position.set(s.x, 0, s.z);
    if (t === "N") p.rotation.y = w ? Math.PI / 2 : -Math.PI / 2;
    p.userData.square = name; p.userData.white = w; g.add(p);
  }
  return g;
}
