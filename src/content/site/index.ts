import { CLAIMS } from "./claims";
import type { Claim } from "./types";

export function getClaim(id: string): Claim {
  const claim = CLAIMS.find((c) => c.id === id);
  if (!claim) throw new Error(`Unknown claim: ${id}`);
  return claim;
}
