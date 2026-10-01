import { describe, expect, test } from "vitest";
import { run, sliced, staged, type Steps } from "./steps";

// a build of five parts, each spinning for `ms`, recording the order it ran in
function* parts(log: string[], ms = 0, wait?: Promise<void>): Steps<string> {
  for (let i = 0; i < 5; i++) {
    const t = performance.now(); while (performance.now() - t < ms);
    log.push(`part ${i}`);
    if (i === 2 && wait) yield wait;
    yield;
  }
  return log.join(",");
}

describe("scenes built in steps", () => {
  test("straight through and in slices, the same parts in the same order", async () => {
    const a: string[] = [], b: string[] = [];
    expect(await sliced(parts(b, 4), 5).done).toBe(run(parts(a, 0)));
    expect(b).toEqual(a);
  });
  test("slices give the thread back: no slice runs far past its budget", async () => {
    const gaps: number[] = []; let last = performance.now(), on = true;
    const tick = () => { const t = performance.now(); gaps.push(t - last); last = t; if (on) setTimeout(tick, 0); };
    setTimeout(tick, 0);
    await sliced(parts([], 6), 8).done; on = false;
    expect(Math.max(...gaps)).toBeLessThan(40);
  });
  test("finish() runs the rest at once, and the slices then have nothing left to do", async () => {
    const log: string[] = [], b = sliced(parts(log, 3), 4);
    expect(log).toEqual([]); // nothing runs before its first slice
    expect(b.finish()).toBe("part 0,part 1,part 2,part 3,part 4");
    expect(await b.done).toBe(b.finish());
  });
  test("a yielded promise holds the slices, and not a build run straight through", async () => {
    let open!: () => void; const wait = new Promise<void>((r) => { open = r; });
    const log: string[] = [], b = sliced(parts(log, 0, wait));
    await new Promise((r) => setTimeout(r, 20));
    expect(log).toEqual(["part 0", "part 1", "part 2"]);
    open(); await b.done; expect(log).toHaveLength(5);
    expect(run(parts([], 0, new Promise(() => {})))).toBe("part 0,part 1,part 2,part 3,part 4");
  });
  test("staged: adopts once, whether the slices or now() finish it, and reports a failure once", async () => {
    const got: string[] = [], s = staged(() => parts([], 1), (v) => got.push(v), () => got.push("failed"));
    s.start(); const v = s.now(); await new Promise((r) => setTimeout(r, 20));
    expect(got).toEqual([v]);
    const fails: string[] = [], f = staged(function* (): Steps<string> { yield; throw new Error("no WebGL"); }, () => fails.push("adopted"), () => fails.push("failed"));
    f.start(); expect(f.now()).toBeNull(); await new Promise((r) => setTimeout(r, 20));
    expect(fails).toEqual(["failed"]);
  });
});
