import Image from "next/image";
import { BROADSHEET } from "@/content/opening";
import { overlayArticle } from "@/lib/cms/articles";
import type { CmsArticle } from "@/lib/cms/types";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { START_PERFT } from "@/lib/chess/perft-table";
import { POSITIONING } from "@/lib/metrics";

export function Colophon({ article }: { article?: CmsArticle }) {
  const copy = article ?? overlayArticle("colophon", {});
  return (
    <section data-testid="colophon" className="border-2 border-ink p-4" aria-label={copy.kicker}>
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
        {copy.kicker}
      </p>
      <figure className="inventor-plate" data-testid="inventor-plate">
        <div className="halftone-plate-frame">
          <Image
            src={copy.plate || "/plates/plate-inventor.jpg"}
            alt={copy.plateAlt}
            width={1400}
            height={933}
            sizes={IMAGE_SIZES.inventor}
            className="halftone-plate-img"
          />
          <span className="halftone-plate-screen" aria-hidden="true" />
        </div>
        <figcaption>{copy.plateCaption}</figcaption>
      </figure>
      <p className="mt-4 font-lora text-[16px] leading-relaxed text-ink">{copy.body}</p>
      <p className="mt-4 font-mono text-[12px] leading-relaxed text-faded" data-testid="name-note">
        {POSITIONING.nameNote}
      </p>
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {copy.honestyKicker}
      </p>
      <p className="mt-2 font-display text-[16px] italic leading-snug text-ink">
        {copy.honesty}
      </p>
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {copy.witnessKicker}
      </p>
      <p className="mt-2 font-lora text-[16px] leading-relaxed text-ink">{copy.witnesses}</p>
      <p className="mt-4 clear-both font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.perftKicker}
      </p>
      <table className="mt-2 w-full font-mono text-[12px] text-ink">
        <thead>
          <tr className="text-left text-faded">
            <th className="font-normal">d</th>
            <th className="font-normal">nodes</th>
          </tr>
        </thead>
        <tbody>
          {START_PERFT.map((row) => (
            <tr key={row.depth}>
              <td>{row.depth}</td>
              <td data-perft-depth={row.depth}>{row.nodes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
