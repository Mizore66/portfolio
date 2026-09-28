import type { Metadata } from "next";
import { Room } from "@/components/shell/Room";

export const metadata: Metadata = { title: "Lab" };

export default function Page() {
  return <Room id="lab" title="Lab" note="The engine from the inside. Built in Phase 5, step 4." />;
}
