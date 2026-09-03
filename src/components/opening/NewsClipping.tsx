import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";

function PhotoWell({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  return (
    <div className="halftone-plate-frame">
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={933}
        sizes={sizes}
        className="halftone-plate-img"
      />
      <span className="halftone-plate-screen" aria-hidden="true" />
    </div>
  );
}

export function NewsClipping({
  kicker,
  headline,
  dateline,
  src,
  alt,
  caption,
  photoInset,
  inset,
}: {
  kicker: string;
  headline: string;
  dateline: string;
  src: string;
  alt: string;
  caption: string;
  photoInset?: { src: string; caption: string; alt?: string };
  inset?: boolean;
}) {
  return (
    <figure
      className={inset ? "news-clipping plate-inset" : "news-clipping"}
      data-testid="news-clipping"
      data-clip={src}
    >
      <p className="news-clipping-kicker">{kicker}</p>
      <p className="news-clipping-hed">{headline}</p>
      <p className="news-clipping-dateline">{dateline}</p>
      <div className={photoInset ? "news-clipping-photos mt-2" : "mt-2"}>
        <PhotoWell
          src={src}
          alt={alt}
          sizes={inset ? IMAGE_SIZES.rolePlate : IMAGE_SIZES.columnPlate}
        />
        {photoInset ? (
          <div className="news-clipping-inset" data-testid="news-clipping-inset" data-clip={photoInset.src}>
            <PhotoWell
              src={photoInset.src}
              alt={photoInset.alt ?? photoInset.caption}
              sizes={IMAGE_SIZES.clippingInset}
            />
          </div>
        ) : null}
      </div>
      <figcaption className="news-clipping-cutline">
        {caption}
        {photoInset ? ` ${photoInset.caption}` : ""}
      </figcaption>
    </figure>
  );
}
