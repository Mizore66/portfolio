import { PageTransition } from "@/components/shell/PageTransition";

/** The Work segment's own template: it remounts between the index and each project, so those changes sweep too. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition nested>{children}</PageTransition>;
}
