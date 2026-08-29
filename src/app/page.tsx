import { Masthead } from "@/components/opening/Masthead";
import { NewspaperPieceSprite } from "@/components/opening/NewspaperPiece";
import { OpeningApp } from "@/components/opening/OpeningApp";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";

export default function Home() {
  return (
    <div className="opening-shell min-h-screen text-ink">
      <NewspaperPieceSprite />
      <a href="#the-game" className="skip-link">
        {BROADSHEET.skipLink}
      </a>
      <div className="relative z-[1] flex justify-center px-2 py-3 sm:px-3">
        <div data-testid="newspaper-spread" className="sheet w-full max-w-[1180px]">
          <Masthead />
          <OpeningApp staticBoard={<StickyBoardStatic />} />
        </div>
      </div>
    </div>
  );
}
