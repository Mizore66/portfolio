import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";

export function ArtistsImpression({
  src,
  caption,
  alt,
}: {
  src: string;
  caption: string;
  alt: string;
}) {
  return (
    <figure className="artists-impression plate-inset" data-testid="artists-impression" data-plate={src} data-placement="wrap">
      <div className="artists-impression-frame">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={933}
          sizes={IMAGE_SIZES.projectPlate}
          className="artists-impression-img"
        />
        <span className="artists-impression-screen" aria-hidden="true" />
      </div>
      <figcaption className="artists-impression-cutline">{caption}</figcaption>
    </figure>
  );
}
