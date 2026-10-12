"use client";

import { motion } from "motion/react";
import type { Placeholder } from "@/data/types";
import { cn } from "@/lib/cn";
import { glide } from "@/lib/motion";

/** Compact prefix / leader switch, sized for the status bar. */
export function PlaceholderToggle({
  placeholder,
  value,
  onChange,
}: {
  placeholder: Placeholder;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex shrink-0 select-none items-center gap-2">
      <span id="ph-label" className="text-faint">
        {placeholder.name}
      </span>
      <div role="group" aria-labelledby="ph-label" className="flex rounded-sm border border-line-strong p-px">
        {placeholder.values.map((v) => {
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(v)}
              className={cn(
                "relative h-6 min-w-8 rounded-[5px] px-2 font-medium transition-colors duration-150 pointer-coarse:h-9 pointer-coarse:min-w-11",
                active ? "text-accent" : "text-muted hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId="ph-pill"
                  transition={glide}
                  className="absolute inset-0 rounded-[5px] bg-accent/10"
                />
              )}
              <span className="relative">{v}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
