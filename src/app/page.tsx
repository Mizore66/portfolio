import type { Metadata } from "next";
import { ExperienceList } from "@/components/opening/ExperienceList";
import { Masthead } from "@/components/opening/Masthead";
import { NewspaperPieceSprite } from "@/components/opening/NewspaperPiece";
import { OpeningApp } from "@/components/opening/OpeningApp";
import { SelectedWork } from "@/components/opening/SelectedWork";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";
import { BRAND_TITLE, getNode, isOpeningId, selectionTitle } from "@/lib/opening/tree";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ move?: string }>;
}): Promise<Metadata> {
  const q = await searchParams;
  if (!q.move || !isOpeningId(q.move)) {
    return { title: BRAND_TITLE };
  }
  return { title: selectionTitle(getNode(q.move)) };
}

export default function Home() {
  return (
    <div className="opening-shell min-h-screen text-ink">
      <NewspaperPieceSprite />
      <a href="#work" className="skip-link">
        {BROADSHEET.skipLink}
      </a>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet w-full max-w-[1180px]">
          <Masthead />
          <OpeningApp staticBoard={<StickyBoardStatic />}>
            <SelectedWork />
            <ExperienceList />
          </OpeningApp>
        </div>
      </div>
    </div>
  );
}
