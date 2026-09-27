import type { Metadata } from "next";
import { BoardFollow } from "@/components/board/BoardFollow";
import { CareerGraph } from "@/components/game/CareerGraph";
import { FrontGame } from "@/components/game/FrontGame";
import { About } from "@/components/site/About";
import { BoardPane } from "@/components/site/BoardPane";
import { Education } from "@/components/site/Education";
import { Experience } from "@/components/site/Experience";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { Skills } from "@/components/site/Skills";
import { careerPoints } from "@/content/site/career";
import { IDENTITY } from "@/content/site/identity";
import { LATEST_MOVE } from "@/content/site/game";
import { ROLES } from "@/content/site/roles";
import { personSchema } from "@/content/site/schema";
import { BoardDiagram, LINE_TITLE, boardStops, mainlineMoves } from "@/lib/board/page";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About · Anas Qumhiyeh",
  description: IDENTITY.summary,
  alternates: { canonical: "/about" },
  openGraph: { title: "About · Anas Qumhiyeh", url: "/about", type: "profile" },
};

/** The profile (brief §6): the game so far, experience, skills, education and about, with the board following the role in view. */
export default function AboutPage() {
  const now = new Date();
  const nowYm = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return (
    <FrontGame stops={boardStops()} initial={LATEST_MOVE}>
      <div className="board-layout">
        <main id="main" className="reading">
          <h1 className="page-title">{IDENTITY.displayName}</h1>
          <p className="hero-status">{IDENTITY.availability}</p>
          <CareerGraph points={careerPoints()} from="2024-11" now={nowYm} />
          <Experience roles={ROLES} />
          <Skills />
          <Education />
          <About identity={IDENTITY} />
        </main>
        <BoardPane lineName={LINE_TITLE} boxId="about-board" initialNode={LATEST_MOVE} diagram={<BoardDiagram />} line={mainlineMoves()} />
      </div>
      <BoardFollow />
      <SiteJsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url: `${SITE_URL}/about`, mainEntity: personSchema() }} />
    </FrontGame>
  );
}
