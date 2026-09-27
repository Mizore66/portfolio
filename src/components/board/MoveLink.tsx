"use client";

import Link from "next/link";
import { boardStore } from "@/lib/board/store";
import { T } from "@/lib/motion/tokens";

/**
 * A link to a project that plays the project's move first (brief §4): its
 * piece slides to its square, then the page changes; coming back takes the
 * move back. Only when the 3D board is live and on screen, and never under
 * reduced motion or with a modifier key; otherwise it is a plain link.
 * Hover and keyboard focus fan out the candidate arrows for the move.
 */
export function MoveLink({ href, nodeId, className, tabIndex, children, ...rest }: { href: string; nodeId?: string; className?: string; tabIndex?: number; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const focus = (on: boolean) => {
    if (nodeId) boardStore().getState().setFocus(on ? nodeId : null);
  };
  return (
    <Link
      {...rest}
      href={href}
      className={className}
      tabIndex={tabIndex}
      data-cursor="piece"
      onMouseEnter={() => focus(true)}
      onMouseLeave={() => focus(false)}
      onFocus={() => focus(true)}
      onBlur={() => focus(false)}
      onClick={(e) => {
        const a = e.currentTarget;
        // Second pass, after the move has played: let the link navigate as usual.
        if (a.dataset.played) {
          delete a.dataset.played;
          return;
        }
        const s = boardStore().getState();
        if (!nodeId || !s.live || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const onScreen = Object.values(s.boxes).some((b) => {
          const r = b.el.getBoundingClientRect();
          return b.binding.kind === "current" && r.bottom > 0 && r.top < window.innerHeight && s.ready[b.id];
        });
        if (!onScreen) return;
        e.preventDefault();
        s.playMove(nodeId);
        s.setTakeback(nodeId);
        setTimeout(() => {
          a.dataset.played = "1";
          a.click();
        }, T.lift + T.move + T.lift);
      }}
    >
      {children}
    </Link>
  );
}
