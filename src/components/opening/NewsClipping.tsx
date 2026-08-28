import Image from "next/image";

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
      <h3 className="news-clipping-hed">{headline}</h3>
      <p className="news-clipping-dateline">{dateline}</p>
      <div className={photoInset ? "news-clipping-photos mt-2" : "mt-2"}>
        <PhotoWell
          src={src}
          alt={alt}
          sizes={inset ? "(max-width: 639px) 280px, 200px" : "(max-width: 980px) 92vw, 480px"}
        />
        {photoInset ? (
          <div className="news-clipping-inset" data-testid="news-clipping-inset" data-clip={photoInset.src}>
            <PhotoWell
              src={photoInset.src}
              alt={photoInset.alt ?? photoInset.caption}
              sizes="(max-width: 639px) 140px, 120px"
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
