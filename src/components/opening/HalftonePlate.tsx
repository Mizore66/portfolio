import Image from "next/image";

export function HalftonePlate({
  src,
  caption,
  alt,
  inset,
}: {
  src: string;
  caption: string;
  alt: string;
  inset?: boolean;
}) {
  return (
    <figure
      className={inset ? "halftone-plate plate-inset" : "halftone-plate"}
      data-testid="halftone-plate"
      data-plate={src}
    >
      <div className="halftone-plate-frame">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={933}
          sizes={inset ? "(max-width: 639px) 280px, 200px" : "(max-width: 980px) 92vw, 480px"}
          className="halftone-plate-img"
        />
        <span className="halftone-plate-screen" aria-hidden="true" />
      </div>
      <figcaption className="mt-2 border-t border-ink pt-1 font-display text-[13px] italic text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}
