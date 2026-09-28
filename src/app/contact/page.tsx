import type { Metadata } from "next";
import { Room } from "@/components/shell/Room";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <Room id="contact" title="Contact" note="11. Your move. Built in Phase 5, step 4." />;
}
