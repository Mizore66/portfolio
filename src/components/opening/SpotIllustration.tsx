function Trail() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 40h20l3-8-6-3-4 2-5-18H12l-4 19 2 8z" />
      <path d="M14 22h10" />
      <path d="M12 28h16" />
      <path d="M8 36h22" />
      <path d="M18 13c2-4 8-6 12-3" />
    </g>
  );
}

function Clock() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="14" width="36" height="22" />
      <circle cx="17" cy="25" r="7" />
      <circle cx="31" cy="25" r="7" />
      <path d="M17 25v-4M17 25h3" />
      <path d="M31 25v-3.5M31 25h2.5" />
      <path d="M14 14V10h6v4M28 14V10h6v4" />
    </g>
  );
}

export function SpotIllustration({
  mark,
  compact,
}: {
  mark: "trail" | "clock";
  compact?: boolean;
}) {
  return (
    <span
      data-testid="spot-illustration"
      data-spot={mark}
      className={compact ? "spot-engraving-inline" : "spot-engraving"}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="h-full w-full text-ink">
        {mark === "trail" ? <Trail /> : <Clock />}
      </svg>
    </span>
  );
}
