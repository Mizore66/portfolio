import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PaperMasthead } from "@/components/opening/Masthead";
import { NewspaperPieceSprite } from "@/components/opening/NewspaperPiece";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";
import { chessDisplayNotes } from "@/lib/cms/chess-notes";
import { getRenderableDocument } from "@/lib/cms/store";
import { BRAND_TITLE, getNode, isOpeningId, selectionTitle } from "@/lib/opening/tree";
import { SITE_URL } from "@/lib/site";

const OpeningApp = dynamic(
  () => import("@/components/opening/OpeningApp").then((mod) => mod.OpeningApp),
  { ssr: true },
);

const PAPER_META = {
  alternates: { canonical: BROADSHEET.paperHref },
  description:
    "The career, annotated move by move — with a live engine and the patents for each project.",
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

export default async function OpeningPreparationPage() {
  const doc = await getRenderableDocument();
  const chessNotes = chessDisplayNotes(doc);
  return (
    <div className="opening-shell min-h-screen text-ink">
      <NewspaperPieceSprite />
      <a href="#scoresheet" className="skip-link">
        {BROADSHEET.skipBoard}
      </a>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet sheet-page">
          <PaperMasthead />
          <OpeningApp staticBoard={<StickyBoardStatic />} chessNotes={chessNotes} />
        </div>
      </div>
    </div>
  );
}
