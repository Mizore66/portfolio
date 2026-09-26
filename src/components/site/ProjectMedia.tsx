import Image from "next/image";
import type { Media } from "@/content/site/types";

/** Owner-supplied screenshots. Portrait phone shots sit side by side; landscape shots take the full width. */
export function ProjectMedia({ media }: { media: readonly Media[] }) {
  const portrait = media.every((m) => m.height > m.width);
  return (
    <div className={portrait ? "media media-portrait" : "media"}>
      {media.map((m, i) => (
        <figure key={m.src}>
          <Image
            src={m.src}
            width={m.width}
            height={m.height}
            alt={m.alt}
            sizes={portrait ? "(min-width: 768px) 360px, 50vw" : "(min-width: 1024px) 896px, 100vw"}
            priority={i === 0}
          />
          <figcaption>{m.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
