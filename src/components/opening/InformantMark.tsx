import { informantTitle } from "@/lib/opening/informant";
import { cn } from "@/lib/utils";

export function InformantMark({
  sym,
  className,
}: {
  sym: string;
  className?: string;
}) {
  const title = informantTitle(sym);
  if (!title) {
    return <span className={className}>{sym}</span>;
  }
  return (
    <abbr
      className={cn("informant-mark", className)}
      title={title}
      data-informant={sym}
    >
      {sym}
    </abbr>
  );
}
