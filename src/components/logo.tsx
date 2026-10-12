import { cn } from "@/lib/cn";

/** The blade: a single slanted stroke in a keycap-like tile. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cn("size-5 shrink-0", className)}>
      <rect x="0.5" y="0.5" width="19" height="19" rx="5.5" fill="#151515" stroke="rgb(255 255 255 / 0.12)" />
      <path d="M12.1 4.5h2.7L9 15.5H6.3z" fill="var(--color-accent)" />
    </svg>
  );
}
