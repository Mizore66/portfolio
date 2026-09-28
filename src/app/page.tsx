import Link from "next/link";
import { content } from "@/content/site";

/** Phase 5 step 1: the skeleton. The hero and its opening arrive in step 2. */
export default function Home() {
  return (
    <main style={{ padding: "18vh 4.4vw", minHeight: "100vh" }}>
      <h1 className="display" style={{ fontSize: "min(21.5vw, 300px)" }}>{content.identity.displayName}</h1>
      <p style={{ marginTop: 32, fontSize: 20, fontWeight: 500 }}>{content.identity.heroHeadline}</p>
      <Link className="resume-link" href="/resume">Résumé</Link>
    </main>
  );
}
