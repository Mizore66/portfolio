/**
 * Every 3D scene the one page shows, behind one dynamic import (code.ts). Imported from each section on its own,
 * every scene's chunk carried its own copy of three.js (340 KB each); behind one import it comes down once. The
 * Lab's other chapters (only on /lab) are imported from here, so they share it too.
 */
import type { ChapterFactory } from "@/components/lab/kit";
import { chapter7 } from "@/components/lab/ch7";

export { madeDuring } from "./env";
export { stageSteps } from "@/components/hero/stage";
export { hallSteps } from "@/components/roles/hall";
export { gallerySteps } from "@/components/work/gallery";
export { sideboardSteps } from "@/components/work/sideboard";
export { warm } from "@/components/lab/kit";

export function chapter(id: number): Promise<ChapterFactory> {
  switch (id) {
    case 1: return import("@/components/lab/ch1").then((m) => m.chapter1);
    case 2: return import("@/components/lab/ch2").then((m) => m.chapter2);
    case 3: return import("@/components/lab/ch3").then((m) => m.chapter3);
    case 4: return import("@/components/lab/ch4").then((m) => m.chapter4);
    case 5: return import("@/components/lab/ch5").then((m) => m.chapter5);
    case 6: return import("@/components/lab/ch6").then((m) => m.chapter6);
    default: return Promise.resolve(chapter7);
  }
}
