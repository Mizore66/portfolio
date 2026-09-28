import { PageTransition } from "@/components/shell/PageTransition";

/** A template remounts on every navigation, which is what gives each page change its leaving snapshot. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
