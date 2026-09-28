import type { Metadata } from "next";
import { Room } from "@/components/shell/Room";

export const metadata: Metadata = { title: "Work" };

export default function Page() {
  return <Room id="work" title="Work" note="The gallery: FaultLine, Teleportal and CircuitMind. Built in Phase 5, step 4." />;
}
