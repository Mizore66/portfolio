import Image from "next/image";

export function HalftonePlate({
  src,
  caption,
  alt,
}: {
  src: string;
  caption: string;
  alt: string;
}) {
  return (
    <figure className="halftone-plate" data-testid="halftone-plate">
      <div className="halftone-plate-frame">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={933}
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
