import { PageTransition } from "@/components/shell/PageTransition";

/** The Roles segment's own template: it remounts between the hall and each table, so those changes sweep too. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition nested>{children}</PageTransition>;
}
