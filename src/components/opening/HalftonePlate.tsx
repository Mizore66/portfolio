import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";

export function HalftonePlate({
  src,
  caption,
  alt,
  inset,
  block,
  priority,
  sizes,
}: {
  src: string;
  caption: string;
  alt: string;
  inset?: boolean;
  /** Centered, no wrap — for a parenthetical that has no text left to float into. */
  block?: boolean;
  priority?: boolean;
  sizes?: string;
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
          sizes={
            sizes ??
            (inset ? IMAGE_SIZES.projectPlate : block ? IMAGE_SIZES.rolePlate : IMAGE_SIZES.exhibitPlate)
          }
          className="halftone-plate-img"
          priority={priority}
          fetchPriority={priority ? "high" : "low"}
        />
        <span className="halftone-plate-screen" aria-hidden="true" />
      </div>
      <figcaption className="mt-4 border-t border-ink pt-2 font-display text-[12px] italic text-faded">
        {caption}
      </figcaption>
    </figure>
  );
}
