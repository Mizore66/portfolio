import type { Metadata } from "next";
import { Room } from "@/components/shell/Room";

export const metadata: Metadata = { title: "Roles" };

export default function Page() {
  return <Room id="roles" title="Roles" note="The hall: one table per role. Built in Phase 5, step 4." />;
}
