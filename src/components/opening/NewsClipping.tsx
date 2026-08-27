import Image from "next/image";

export function NewsClipping({
  kicker,
  headline,
  dateline,
  src,
  alt,
  inset,
}: {
  kicker: string;
  headline: string;
  dateline: string;
  src: string;
  alt: string;
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
      <div className="halftone-plate-frame mt-2">
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
    </figure>
  );
}
