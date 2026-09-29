import { describe, it, expect } from "vitest";
import { roomFor, sides, intersect, PROJECT_CP } from "./seam";
import { entries } from "@/content/work";
import { plan } from "./sweep";

describe("resting seams", () => {
  it("come from the approved key frames", () => {
    expect(roomFor("/")!.at).toBeCloseTo(0.5586, 4); // share(+0.64)
    expect(roomFor("/work")).toMatchObject({ at: 0.015, atPhone: 0 });
    expect(roomFor("/roles")).toMatchObject({ at: 1, atPhone: 1 }); // the paper floods
    expect(roomFor("/roles/deriv")).toMatchObject({ at: 1, atPhone: 1 });
    expect(roomFor("/lab")).toMatchObject({ at: 0.305, dark: "var(--search)" });
    expect(roomFor("/contact")!.at).toBeCloseTo(roomFor("/")!.at);
    expect(roomFor("/resume")).toBeNull();
  });
  it("rest each project page at its own move's eval", () => {
    for (const f of entries) expect(PROJECT_CP[f.slug]).toBe(f.cp);
    expect(roomFor("/work/faultline")!.at).toBeCloseTo(0.5586, 4); // 10…Bg4 +0.64, proj-a
    expect(roomFor("/work/gemini-teleportal")!.at).toBeCloseTo(0.4834, 4); // 7…Ne4 −0.18
    expect(roomFor("/work/circuitmindai")!.at).toBeCloseTo(0.545, 3); // 3…Bc5 +0.49
  });
});

describe("the sweep", () => {
  it("hero to Work is the storyboard's: 1.15 s, leaning 13 degrees against its travel", () => {
    const p = plan("/", "/work", roomFor("/")!.at, 0.015, false);
    expect(p.dur).toBeCloseTo(1.15);
    expect(p.tilt).toBe(-13);
    expect(p.typeAt).toBeCloseTo(0.73);
    expect(p.rise).toBeCloseTo(1.13);
  });
  it("leans the other way, less, over a shorter travel (Lab to Contact, about 7 degrees)", () => {
    const p = plan("/lab", "/contact", 0.305, roomFor("/contact")!.at, false);
    expect(p.tilt).toBeGreaterThan(0);
    expect(p.tilt).toBeCloseTo(7.5, 0);
    expect(p.dur).toBeLessThan(1.15);
  });
  it("cuts what is left when going from Work into a project, and only then", () => {
    const into = plan("/work", "/work/faultline", 0.015, 0.559, false);
    expect(into.cut).toBe(true);
    expect(into.total).toBeLessThan(plan("/", "/lab", 0.559, 0.305, false).total + 1);
    expect(into.total).toBeGreaterThan(into.dur); // the old lines still leave
    expect(plan("/work/faultline", "/work", 0.559, 0.015, false).cut).toBe(false);
    expect(plan("/", "/work", 0.559, 0.015, false).cut).toBe(false);
  });
  it("cuts into a role page from the hall, where sitting down has already framed it", () => {
    const sit = plan("/roles", "/roles/deriv", 1, 1, false);
    expect(sit.cut).toBe(true);
    expect(sit.rise).toBeLessThan(0.2); // the title arrives as the camera lands
    expect(plan("/roles/deriv", "/roles", 1, 1, false).cut).toBe(false);
    expect(plan("/roles/deriv", "/roles/education", 1, 1, false).cut).toBe(false);
  });
  it("uses 8 degrees on phones", () => {
    expect(plan("/", "/work", 0.559, 0, true).tilt).toBe(-8);
  });
  it("with nothing to travel, lifts the old page away instead", () => {
    const p = plan("/", "/contact", 0.559, 0.559, false);
    expect(p.dur).toBe(0);
    expect(p.tilt).toBe(0);
    expect(p.liftAt).toBeGreaterThan(0);
    expect(p.total).toBeGreaterThan(p.liftAt + p.liftDur - 1e-9);
  });
});

describe("seam geometry", () => {
  it("splits the viewport into two sides that meet on the seam", () => {
    const { light, dark } = sides(0.5, 0, 1000, 800, false);
    expect(light[1]).toEqual([500, 0]);
    expect(dark[0]).toEqual([500, 0]);
  });
  it("tilts about the centre", () => {
    const { light } = sides(0.5, 45, 1000, 800, false);
    expect(light[1][0]).toBeCloseTo(100); // top of the seam: 500 - 400
    expect(light[2][0]).toBeCloseTo(900); // bottom: 500 + 400
  });
  it("intersects convex polygons, either winding", () => {
    const sq = (x: number, y: number, s: number): [number, number][] => [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
    const area = (p: [number, number][]) => Math.abs(p.reduce((a, q, i) => { const r = p[(i + 1) % p.length]; return a + q[0] * r[1] - r[0] * q[1]; }, 0)) / 2;
    expect(area(intersect(sq(0, 0, 10), sq(5, 5, 10)))).toBeCloseTo(25);
    expect(area(intersect(sq(0, 0, 10), [...sq(5, 5, 10)].reverse()))).toBeCloseTo(25);
    expect(intersect(sq(0, 0, 10), sq(20, 20, 5))).toHaveLength(0);
  });
});
