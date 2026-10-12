import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { BuiltKeys } from "@/lib/keys";
import { Highlight } from "./highlight";

export function Kbd({
  children,
  size = "md",
  className,
  style,
}: {
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <kbd draggable={false} className={cn("kbd", size === "sm" && "kbd-sm", className)} style={style}>
      {children}
    </kbd>
  );
}

/**
 * One entry's key sequences as keycaps. The whole group is unselectable and
 * exposed to assistive tech through a single readable label.
 */
export function KeySequences({
  built,
  hl,
  pressed = false,
  className,
}: {
  built: BuiltKeys;
  hl?: Set<number>;
  /** Plays the press animation across the caps, in order. */
  pressed?: boolean;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={built.display}
      className={cn("inline-flex select-none flex-wrap items-center justify-end gap-1", className)}
    >
      {built.caps.map((cap, order) => (
        <span key={order} className="contents">
          {cap.alt && (
            <span aria-hidden className="px-1 text-2xs text-faint">
              or
            </span>
          )}
          <Kbd
            className={pressed ? "animate-keypress" : undefined}
            style={pressed ? { animationDelay: `${order * 45}ms` } : undefined}
          >
            <Highlight text={cap.text} set={hl} offset={cap.offset} />
          </Kbd>
        </span>
      ))}
    </span>
  );
}
