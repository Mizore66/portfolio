export function EmptyFrame({ caption }: { caption: string }) {
  return (
    <figure className="empty-frame" data-testid="empty-frame">
      <div className="empty-frame-mat" aria-hidden="true" />
      <figcaption className="mt-2 border-t border-ink pt-1 font-display text-[13px] italic text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}
