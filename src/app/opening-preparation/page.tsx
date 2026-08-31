import type { Metadata } from "next";
import { Masthead } from "@/components/opening/Masthead";
import { NewspaperPieceSprite } from "@/components/opening/NewspaperPiece";
import { OpeningApp } from "@/components/opening/OpeningApp";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";
import { BRAND_TITLE, getNode, isOpeningId, selectionTitle } from "@/lib/opening/tree";
import { SITE_URL } from "@/lib/site";

const PAPER_META = {
  alternates: { canonical: BROADSHEET.paperHref },
  description:
    "The Opening Preparation scoresheet: jobs as moves, annotations as voice. The front page still holds the work.",
  openGraph: {
    url: `${SITE_URL}${BROADSHEET.paperHref}`,
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ move?: string }>;
}): Promise<Metadata> {
  const q = await searchParams;
  if (!q.move || !isOpeningId(q.move)) {
    return { title: BRAND_TITLE, ...PAPER_META };
  }
  return { title: selectionTitle(getNode(q.move)), ...PAPER_META };
}

export default function OpeningPreparationPage() {
  return (
    <div className="opening-shell min-h-screen text-ink">
      <NewspaperPieceSprite />
      <a href="#scoresheet" className="skip-link">
        {BROADSHEET.skipBoard}
      </a>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet sheet-page">
          <Masthead />
          <OpeningApp staticBoard={<StickyBoardStatic />} />
        </div>
      </div>
    </div>
  );
}
