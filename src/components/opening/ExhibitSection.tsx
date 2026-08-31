import { CopyLink } from "@/components/opening/CopyLink";

export function ExhibitSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-8" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-wrap items-baseline gap-3">
        <h2
          id={`${id}-heading`}
          className="font-mono text-[13px] uppercase tracking-[0.22em] text-faded"
        >
          {title}
        </h2>
        <CopyLink href={`#${id}`} label={`Copy link to ${title}`} />
      </div>
      {children}
    </section>
  );
}
