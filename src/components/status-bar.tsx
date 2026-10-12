import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kbd } from "./kbd";

/**
 * The bottom bar. It holds the things you switch between (sheets, prefix or
 * leader) on the left and what the keyboard does on the right, lined up with
 * the page column instead of running edge to edge.
 */
export function StatusBar({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-line-strong bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-10 max-w-[1240px] items-stretch justify-between gap-4 px-4 text-xs text-muted pointer-coarse:h-12 sm:px-6">
        <div className="flex min-w-0 items-stretch gap-4">{left}</div>
        {right && <div className="flex shrink-0 items-center gap-4">{right}</div>}
      </div>
    </footer>
  );
}

export function StatusDivider() {
  return <span aria-hidden className="my-auto h-3.5 w-px shrink-0 bg-line-strong" />;
}

/** A key (or a few) followed by what it does. */
export function KeyHint({
  keys,
  label,
  className,
}: {
  keys: ReactNode[];
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("flex select-none items-center gap-1.5 whitespace-nowrap", className)}>
      <span className="flex gap-0.5">
        {keys.map((k, i) => (
          <Kbd key={i} size="sm">
            {k}
          </Kbd>
        ))}
      </span>
      <span>{label}</span>
    </span>
  );
}
