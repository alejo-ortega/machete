"use client";

import { motion } from "motion/react";
import type { Category } from "@/hooks/use-sheet-search";
import { cn } from "@/lib/cn";
import { glide } from "@/lib/motion";

type Props = {
  categories: Category[];
  active: string;
  /** A query is typed: counts are matches, and sections without any recede. */
  searching: boolean;
  onChange: (title: string) => void;
};

/** Vertical section list for wide screens. */
export function SectionRail({ categories, active, searching, onChange }: Props) {
  return (
    <nav aria-label="Sections">
      <p className="flex h-11 items-center px-3 text-2xs uppercase tracking-[0.12em] text-faint">Sections</p>
      <ul className="flex flex-col gap-px">
        {categories.map((c) => {
          const on = c.title === active;
          return (
            <li key={c.title}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChange(c.title)}
                className={cn(
                  "group relative flex h-8 w-full items-center justify-between gap-3 rounded-sm px-3 text-left text-sm transition-colors duration-150",
                  on ? "text-fg" : "text-muted hover:text-fg",
                  searching && !on && c.count === 0 && "opacity-45",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="rail-active"
                    transition={glide}
                    className="absolute inset-0 rounded-sm bg-white/[0.045] ring-1 ring-inset ring-line"
                  >
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />
                  </motion.span>
                )}
                <span className="relative truncate">{c.title}</span>
                <span
                  className={cn(
                    "relative text-2xs transition-colors duration-150",
                    on ? "text-accent" : "text-faint group-hover:text-muted",
                  )}
                >
                  {c.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Horizontally scrolling chips for narrow screens. */
export function SectionStrip({ categories, active, searching, onChange }: Props) {
  return (
    <nav
      aria-label="Sections"
      className="no-scrollbar -mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-16px),transparent)] sm:-mx-6 sm:px-6"
    >
      <ul className="flex w-max gap-1.5">
        {categories.map((c) => {
          const on = c.title === active;
          return (
            <li key={c.title}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChange(c.title)}
                className={cn(
                  "relative flex h-8 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-xs transition-[color,opacity] duration-150 pointer-coarse:h-10 pointer-coarse:px-4",
                  on ? "border-transparent text-accent" : "border-line-strong text-muted",
                  searching && !on && c.count === 0 && "opacity-45",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="strip-active"
                    transition={glide}
                    className="absolute -inset-px rounded-full bg-accent/10 ring-1 ring-inset ring-accent/30"
                  />
                )}
                <span className="relative">{c.title}</span>
                <span className={cn("relative text-2xs", on ? "text-accent" : "text-faint")}>
                  {c.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
