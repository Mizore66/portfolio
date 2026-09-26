import { describe, expect, it } from "vitest";
import { fromPieces, isLegalPly, searchMove } from "@/lib/chess/engine";
import { occupancyFen, positionAfter } from "@/lib/chess/replay";
import { careerPoints } from "./career";
import { CAREER_EVAL_NODES, CAREER_EVALS } from "./career-evals";
import { DEFAULT_MOVE, GAME } from "./game";
import {
  enginePliesTo,
  gameNode,
  mainline,
  mainlineSan,
  pathTo,
  replayPliesTo,
  resolveMove,
  sideToMoveAfter,
} from "./game-tree";
import { getClaim } from "./index";
import { LINE_SAN } from "./line";
import { PROJECTS } from "./projects";
import { ROLES } from "./roles";

const LEGACY_IDS = [
  "start", "e4", "alekhine", "e5", "nf3", "elephant", "philidor", "nc6", "bc4",
  "bc5", "oo", "nf6", "d4", "closed", "bb6", "exd4", "re1",
];

describe("the annotated line", () => {
  it("has unique ids and keeps every legacy id resolving", () => {
    const ids = GAME.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of LEGACY_IDS) expect(() => gameNode(id), id).not.toThrow();
    expect(resolveMove("nope")).toBe(DEFAULT_MOVE);
    expect(resolveMove(undefined)).toBe("d4");
  });

  it("plays only legal moves, checked by the vendored generator", () => {
    for (const n of GAME) {
      if (!n.uci) continue;
      const before = pathTo(n.id).slice(0, -1);
      const engine = before.flatMap((p) => (p.uci ? [p.uci] : []));
      const replay = replayPliesTo(n.parent!);
      const last = replay[replay.length - 1] ?? null;
      const pos = fromPieces(positionAfter(replay), sideToMoveAfter(engine.length), last);
      expect(isLegalPly(pos, { from: n.uci.slice(0, 2), to: n.uci.slice(2, 4) }), `${n.id} ${n.uci}`).toBe(true);
    }
  });

  it("gives each move the right side and number", () => {
    for (const n of GAME) {
      if (!n.uci) continue;
      const ply = enginePliesTo(n.id).length;
      expect(n.color, n.id).toBe(ply % 2 === 1 ? "w" : "b");
      expect(n.moveNumber, n.id).toBe(Math.ceil(ply / 2));
    }
  });

  it("has the D19 mainline, ending in the outlook", () => {
    expect(mainlineSan()).toBe(LINE_SAN);
    const ids = mainline().map((n) => n.id);
    expect(ids.slice(-6)).toEqual(["bb4-check", "bd2", "bxd2", "deriv", "faultline", "outlook"]);
    expect(ids).toContain("skribble-lab");
    expect(ids).toContain("e5-push");
  });

  it("shows the old castled boards at ?move=oo and ?move=re1", () => {
    const fen = (id: string) => occupancyFen(positionAfter(replayPliesTo(id)));
    expect(fen("oo")).toBe("r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1");
    expect(fen("re1")).toBe("r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/5N2/PPP2PPP/RNBQR1K1");
    expect(fen("bc5")).toBe("r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R");
  });

  it("maps the career as the owner confirmed (D23)", () => {
    const at = (id: string) => gameNode(id).career;
    expect(at("e5-push")).toEqual({ kind: "role", roleId: "monash-university" });
    expect(at("skribble-lab")).toEqual({ kind: "role", roleId: "skribble-lab" });
    expect(at("teleportal")).toEqual({ kind: "project", slug: "gemini-teleportal" });
    expect(at("graduation")).toEqual({ kind: "education" });
    expect(at("deriv")).toEqual({ kind: "role", roleId: "deriv" });
    expect(at("faultline")).toEqual({ kind: "project", slug: "faultline" });
    expect(at("d4")).toEqual({ kind: "project", slug: "veridian" });
  });

  it("references only real claims, roles and projects", () => {
    for (const n of GAME) {
      for (const id of n.claims ?? []) expect(() => getClaim(id), `${n.id}:${id}`).not.toThrow();
      if (n.career?.kind === "role") expect(ROLES.some((r) => r.id === (n.career as { roleId: string }).roleId)).toBe(true);
      if (n.career?.kind === "project") expect(PROJECTS.some((p) => p.slug === (n.career as { slug: string }).slug)).toBe(true);
    }
  });

  it("keeps facts roman and free of the dropped labels", () => {
    const text = JSON.stringify(GAME);
    expect(text).not.toMatch(/C50/);
    expect(text).not.toMatch(/2200/);
    expect(text).not.toMatch(/auto-rebalanc/i);
    expect(gameNode("d4").fact).not.toMatch(/Monash/);
  });

  it("puts the puzzle at 4…Nf6 with d4 as the answer", () => {
    expect(gameNode("nf6").puzzle?.target).toBe("d2d4");
    expect(gameNode("d4").uci).toBe("d2d4");
  });
});

describe("career eval graph", () => {
  const points = careerPoints();

  it("places every role and project that has a move", () => {
    const keys = points.map((p) => p.nodeId);
    for (const id of ["nf3", "nc6", "bc4", "e5-push", "skribble-lab", "deriv", "faultline", "teleportal", "d4", "graduation"])
      expect(keys, id).toContain(id);
  });

  it("uses real dates: roles as spans, projects as points, Deriv open-ended", () => {
    const deriv = points.find((p) => p.nodeId === "deriv")!;
    expect(deriv.start).toBe("2026-06");
    expect(deriv.end).toBeNull();
    const fl = points.find((p) => p.nodeId === "faultline")!;
    expect(fl.start).toBe("2026-07");
    expect(fl.end).toBe("2026-07");
  });

  it("plots the engine's own evaluation of each position", () => {
    for (const p of points) {
      expect(Number.isFinite(p.evalCp), p.nodeId).toBe(true);
      expect(Math.abs(p.evalCp), p.nodeId).toBeLessThan(600);
    }
  });

  it("stores exactly what the engine finds, so the page never searches at request time", () => {
    for (const p of points) {
      const engine = enginePliesTo(p.nodeId);
      const replay = replayPliesTo(p.nodeId);
      const pos = fromPieces(positionAfter(replay), sideToMoveAfter(engine.length), replay[replay.length - 1] ?? null);
      const cp = searchMove(pos, { nodes: CAREER_EVAL_NODES, evalMode: "handcrafted" }).score;
      expect(CAREER_EVALS[p.nodeId], p.nodeId).toBe(cp);
    }
    expect(Object.keys(CAREER_EVALS).sort()).toEqual(points.map((p) => p.nodeId).sort());
  });
});
