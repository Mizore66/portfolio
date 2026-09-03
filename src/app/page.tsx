import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AboutBand } from "@/components/opening/AboutBand";
import { ContactBand } from "@/components/opening/ContactBand";
import { EducationBand } from "@/components/opening/EducationBand";
import { ExperienceList } from "@/components/opening/ExperienceList";
import { FooterStrip } from "@/components/opening/FooterStrip";
import { HeroEngine } from "@/components/opening/HeroEngine";
import { LabFilings, LabTeaser } from "@/components/opening/LabTeaser";
import { EditionKicker, HeroIdentity } from "@/components/opening/Masthead";
import { PreviewBanner } from "@/components/opening/PreviewBanner";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { SelectedWork } from "@/components/opening/SelectedWork";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";
import { workPathFromQuery } from "@/lib/metrics";
import { HOME_TITLE, isOpeningId } from "@/lib/opening/tree";

export const metadata: Metadata = {
  title: HOME_TITLE,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ move?: string; tape?: string; path?: string }>;
}) {
  const q = await searchParams;
  if (q.move || q.tape === "1") {
    const params = new URLSearchParams();
    if (q.move && isOpeningId(q.move)) params.set("move", q.move);
    if (q.tape === "1") params.set("tape", "1");
    const qs = params.toString();
    redirect(qs ? `${BROADSHEET.paperHref}?${qs}` : BROADSHEET.paperHref);
  }

  return (
    <div className="opening-shell min-h-screen text-ink">
      <a href="#work" className="skip-link">
        {BROADSHEET.skipLink}
      </a>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet sheet-page">
          <header>
            <PreviewBanner />
            <EditionKicker />
            <RecruiterNav />
          </header>
          <main>
            <div className="home-desk" data-testid="home-desk">
              <HeroIdentity />
              <SelectedWork path={workPathFromQuery(q.path)} />
              <HeroEngine staticBoard={<StickyBoardStatic planeId="hero-board" />} />
            </div>
            <ExperienceList />
            <EducationBand />
            <section id="lab" data-testid="lab-band" className="recruiter-band" aria-labelledby="lab-heading">
              <p className="band-kicker">{BROADSHEET.labKicker}</p>
              <h2 id="lab-heading" className="band-title">
                {BROADSHEET.labHeading}
              </h2>
              <p className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
                {BROADSHEET.labDek}
              </p>
              <LabTeaser />
              <LabFilings />
            </section>
            <AboutBand />
            <ContactBand />
          </main>
          <footer data-testid="home-footer" className="paper-footer">
            <FooterStrip />
          </footer>
        </div>
      </div>
    </div>
  );
}
