import Image from "next/image";

export function HalftonePlate({
  src,
  caption,
  alt,
  inset,
  block,
  priority,
}: {
  src: string;
  caption: string;
  alt: string;
  inset?: boolean;
  /** Centered, no wrap — for a parenthetical that has no text left to float into. */
  block?: boolean;
  priority?: boolean;
}) {
  return (
    <figure
      className={
        inset ? "halftone-plate plate-inset" : block ? "halftone-plate plate-block" : "halftone-plate"
      }
      data-testid="halftone-plate"
      data-plate={src}
      data-placement={inset ? "wrap" : block ? "block" : "full"}
    >
      <div className="halftone-plate-frame">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={933}
          sizes={inset ? "(max-width: 639px) 280px, 200px" : "(max-width: 980px) 92vw, 480px"}
          className="halftone-plate-img"
          priority={priority}
        />
        <span className="halftone-plate-screen" aria-hidden="true" />
      </div>
      <figcaption className="mt-2 border-t border-ink pt-2 font-display text-[12px] italic text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}
