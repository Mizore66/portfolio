import { NewspaperPieceSprite } from "@/components/opening/NewspaperPiece";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";

export function GameTeaser() {
  return (
    <section
      id="the-game"
      data-testid="game-teaser"
      className="recruiter-band"
      aria-labelledby="teaser-heading"
    >
      <NewspaperPieceSprite />
      <p className="band-kicker">{BROADSHEET.gameKicker} — C50</p>
      <h2 id="teaser-heading" className="band-title">
        {BROADSHEET.gameKicker}
      </h2>
      <p data-testid="how-to-read" className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
        {BROADSHEET.howToRead}
      </p>
      <p className="mt-1 max-w-[68ch] font-display text-[16px] italic text-faded">{BROADSHEET.teaserDek}</p>
      <p
        data-testid="teaser-line"
        className="mt-4 font-mono text-[13px] leading-relaxed text-ink"
      >
        {BROADSHEET.teaserLine}
      </p>
      <div className="teaser-board mt-6 max-w-md">
        <StickyBoardStatic />
      </div>
      <p className="mt-6">
        <a
          href={BROADSHEET.paperHref}
          className="masthead-chip masthead-chip-primary"
          data-testid="read-the-paper"
        >
          {BROADSHEET.paperLink}
        </a>
      </p>
    </section>
  );
}
