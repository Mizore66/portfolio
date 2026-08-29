import type { Color } from "@/lib/chess/replay";

export function numberPv(pv: string[], side: Color, moveNumber: number): string {
  const parts: string[] = [];
  let s = side;
  let n = moveNumber;
  for (const san of pv) {
    if (s === "w") parts.push(`${n}. ${san}`);
    else parts.push(parts.length === 0 ? `${n}…${san}` : san);
    if (s === "b") n += 1;
    s = s === "w" ? "b" : "w";
  }
  return parts.join(" ");
}
