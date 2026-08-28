import Image from "next/image";
import { BROADSHEET } from "@/content/opening";
import { START_PERFT } from "@/lib/chess/engine";

export function Colophon() {
  return (
    <section data-testid="colophon" className="border-2 border-ink p-4" aria-label={BROADSHEET.colophonKicker}>
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
        {BROADSHEET.colophonKicker}
      </p>
      <figure className="inventor-plate" data-testid="inventor-plate">
        <div className="halftone-plate-frame">
          <Image
            src="/plates/plate-inventor.jpg"
            alt="The inventor"
            width={1400}
            height={933}
            sizes="148px"
            className="halftone-plate-img"
          />
          <span className="halftone-plate-screen" aria-hidden="true" />
        </div>
        <figcaption>The inventor, on the stair — file photo.</figcaption>
      </figure>
      <p className="mt-4 font-lora text-[16px] leading-relaxed text-ink">{BROADSHEET.colophon}</p>
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.colophonHonestyKicker}
      </p>
      <p className="mt-2 font-display text-[16px] italic leading-snug text-ink">
        {BROADSHEET.colophonHonesty}
      </p>
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.colophonWitnessKicker}
      </p>
      <p className="mt-2 font-lora text-[16px] leading-relaxed text-ink">{BROADSHEET.colophonWitnesses}</p>
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
