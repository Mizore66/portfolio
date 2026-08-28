import Image from "next/image";
import { BROADSHEET } from "@/content/opening";
import { START_PERFT } from "@/lib/chess/engine";

export function Colophon() {
  return (
    <section data-testid="colophon" className="border-2 border-ink p-3" aria-label={BROADSHEET.colophonKicker}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
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
      <p className="mt-2 font-lora text-[13px] leading-relaxed text-ink">{BROADSHEET.colophon}</p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.colophonHonestyKicker}
      </p>
      <p className="mt-1 font-display text-[13px] italic leading-snug text-ink">
        {BROADSHEET.colophonHonesty}
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.colophonWitnessKicker}
      </p>
      <p className="mt-1 font-lora text-[13px] leading-relaxed text-ink">{BROADSHEET.colophonWitnesses}</p>
      <p className="mt-3 clear-both font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        {BROADSHEET.perftKicker}
      </p>
      <table className="mt-1 w-full font-mono text-[11px] text-ink">
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
