import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ExternalLink({
  href,
  children,
  className,
  rel = "noopener noreferrer",
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target"> & { href: string; children: ReactNode }) {
  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel={rel}
      className={cn("external-mark", className)}
    >
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
