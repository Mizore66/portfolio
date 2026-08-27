import Image from "next/image";

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
    <figure className="artists-impression plate-inset" data-testid="artists-impression" data-plate={src}>
      <div className="artists-impression-frame">
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={933}
          sizes="(max-width: 639px) 280px, 200px"
          className="artists-impression-img"
        />
        <span className="artists-impression-screen" aria-hidden="true" />
      </div>
      <figcaption className="artists-impression-cutline">{caption}</figcaption>
    </figure>
  );
}
