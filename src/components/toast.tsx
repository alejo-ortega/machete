"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

export type ToastMessage = { key: number; text: string; ok: boolean };

export function Toast({ message }: { message: ToastMessage | null }) {
  const Icon = message?.ok === false ? X : Check;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-14 z-40 flex justify-center px-4 pointer-coarse:bottom-16"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.key}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.7 }}
            className="flex min-h-9 max-w-full items-center gap-2.5 rounded-[18px] border border-line-bright bg-overlay/95 py-1.5 pl-2 pr-4 text-xs shadow-float backdrop-blur"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                message.ok ? "bg-accent text-accent-ink" : "bg-fg text-bg",
              )}
            >
              <Icon aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {message.ok ? (
              <>
                <span className="shrink-0 text-muted">copied:</span>
                <span className="truncate text-fg">{message.text}</span>
              </>
            ) : (
              <span className="text-fg">Clipboard blocked. Select the command to copy it.</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
