import { CopyLink } from "@/components/opening/CopyLink";

export function ExhibitSection({
  id,
  title,
  children,
  prominent = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  prominent?: boolean;
}) {
  return (
    <section
      id={id}
      className={prominent ? "exhibit-section exhibit-section-prominent mt-8" : "exhibit-section mt-8"}
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <h2
          id={`${id}-heading`}
          className={
            prominent
              ? "font-display text-[1.15rem] leading-snug text-ink"
              : "font-mono text-[13px] uppercase tracking-[0.22em] text-faded"
          }
        >
          {title}
        </h2>
        <CopyLink href={`#${id}`} label={`Copy link to ${title}`} />
      </div>
      {children}
    </section>
  );
}
