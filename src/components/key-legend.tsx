"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { MODE_NAMES } from "@/lib/modes";
import { ease } from "@/lib/motion";
import { arrows } from "./arrow-keys";
import { Kbd } from "./kbd";

function Row({ keys, children }: { keys: ReactNode[][]; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <dt className="text-muted">{children}</dt>
      <dd className="flex shrink-0 select-none items-center gap-1.5">
        {keys.map((combo, i) => (
          <span key={i} className="flex items-center gap-0.5">
            {i > 0 && <span className="mr-1 text-2xs text-faint">or</span>}
            {combo.map((k, j) => (
              <Kbd key={j} size="sm">
                {k}
              </Kbd>
            ))}
          </span>
        ))}
      </dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <h3 className="mb-1 text-2xs font-medium uppercase tracking-[0.12em] text-faint">{title}</h3>
      <dl>{children}</dl>
    </section>
  );
}

/**
 * Every shortcut, the key notation and the mode badges in one place. A
 * popover rather than a modal: search keeps focus and keeps working under it.
 */
export function KeyLegend({
  open,
  onClose,
  placeholderName,
  modes,
  multipleSheets,
}: {
  open: boolean;
  onClose: () => void;
  placeholderName?: string;
  /** Mode letters this sheet actually uses. */
  modes: string[];
  multipleSheets: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (panel.current?.contains(target) || target.closest("[data-legend-toggle]")) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-12 z-40 pointer-coarse:bottom-14">
          <div className="mx-auto flex max-w-[1240px] justify-end px-4 sm:px-6">
            <motion.div
              ref={panel}
              id="key-legend"
              role="dialog"
              aria-label="Keys and notation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={ease}
              className="pointer-events-auto max-h-[calc(100dvh-7rem)] w-[340px] max-w-full divide-y divide-line overflow-y-auto rounded-lg border border-line-strong bg-raised p-4 text-xs shadow-float"
            >
              <Group title="Keys">
                <Row keys={[["/"]]}>focus search</Row>
                <Row keys={[[arrows.up, arrows.down], ["Ctrl", "j"], ["Ctrl", "k"]]}>move</Row>
                <Row keys={[[arrows.left, arrows.right]]}>entry beside</Row>
                <Row keys={[["PgUp"], ["PgDn"]]}>jump 8</Row>
                <Row keys={[["Enter"]]}>copy command</Row>
                <Row keys={[["Esc"]]}>clear search, then section</Row>
                <Row keys={[["Alt", arrows.up], ["Alt", arrows.down]]}>section</Row>
                {placeholderName && <Row keys={[["Alt", "p"]]}>switch {placeholderName}</Row>}
                {multipleSheets && <Row keys={[["Alt", "["], ["Alt", "]"]]}>sheet</Row>}
                <Row keys={[["Ctrl", "/"]]}>this panel</Row>
              </Group>
              <Group title="Notation">
                <Row keys={[["C-x"]]}>Ctrl + x</Row>
                <Row keys={[["M-x"]]}>Alt + x</Row>
                <Row keys={[["S-x"]]}>Shift + x</Row>
                <Row keys={[["<C-x>"]]}>the same, Vim style</Row>
              </Group>
              {modes.length > 0 && (
                <Group title="Modes">
                  {modes.map((m) => (
                    <div key={m} className="flex items-center justify-between gap-4 py-1">
                      <dt className="text-muted">{MODE_NAMES[m] ?? m}</dt>
                      <dd className="flex h-4 min-w-4 select-none items-center justify-center rounded-[4px] border border-line-strong px-1 text-[10px] leading-none text-muted">
                        {m}
                      </dd>
                    </div>
                  ))}
                </Group>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
