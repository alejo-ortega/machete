"use client";

import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { memo } from "react";
import type { Result } from "@/hooks/use-sheet-search";
import { cn } from "@/lib/cn";
import { MODE_NAMES } from "@/lib/modes";
import { glide } from "@/lib/motion";
import { Highlight } from "./highlight";
import { KeySequences } from "./kbd";

export const optionId = (index: number) => `entry-${index}`;

/** What Enter/click puts on the clipboard, if anything. */
export const copyTextOf = (entry: Result) => entry.copy || entry.cmd || null;
export const isCopyable = (entry: Result) => copyTextOf(entry) !== null;

/** A literal command line, with `<argument>` placeholders dimmed. */
function CommandText({ text, set }: { text: string; set?: Set<number> }) {
  const parts: Array<{ text: string; offset: number; isArg: boolean }> = [];
  let offset = 0;
  for (const [i, part] of text.split(/(<[^>\s]+>)/).entries()) {
    if (part) parts.push({ text: part, offset, isArg: i % 2 === 1 });
    offset += part.length;
  }
  return (
    <>
      {parts.map((part) => (
        <span key={part.offset} className={part.isArg ? "text-faint" : undefined}>
          <Highlight text={part.text} set={set} offset={part.offset} />
        </span>
      ))}
    </>
  );
}

// "$" marks a shell command; "›" marks the filled-in example that gets copied.
function CodeLine({ glyph, tone, children }: { glyph: string; tone: "plain" | "example"; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span aria-hidden className="w-2 shrink-0 select-none text-center text-ghost">
        {glyph}
      </span>
      <code className={cn("min-w-0 break-words font-mono", tone === "example" ? "text-muted" : "text-fg")}>
        {children}
      </code>
    </div>
  );
}

export const EntryRow = memo(function EntryRow({
  entry,
  selected,
  copied,
  pressed,
  showSection,
  onHover,
  onActivate,
}: {
  entry: Result;
  selected: boolean;
  copied: boolean;
  /** Plays the keycap press, the feedback for activating a binding. */
  pressed: boolean;
  showSection: boolean;
  onHover: (index: number, x: number, y: number) => void;
  onActivate: (entry: Result) => void;
}) {
  const hl = entry.hl ?? {};
  const isCommand = entry.type === "command";
  const template = entry.built.display;
  // A command whose example equals its template needs only one line.
  const example = entry.cmd && !(isCommand && entry.cmd === template) ? entry.cmd : null;
  // Only commands are copyable; a key binding is something you press, not paste.
  const copyable = isCopyable(entry);
  const Icon = copied ? Check : Copy;

  return (
    <div
      id={optionId(entry.index)}
      role="option"
      aria-selected={selected}
      onMouseMove={selected ? undefined : (e) => onHover(entry.index, e.clientX, e.clientY)}
      onClick={() => onActivate(entry)}
      className={cn("relative scroll-my-4 rounded-sm px-3 py-2", copyable && "cursor-pointer")}
    >
      {selected && (
        <motion.div
          layoutId="row-selection"
          transition={glide}
          className="absolute inset-0 rounded-sm bg-accent/[0.07]"
        >
          <motion.span layout transition={glide} className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />
        </motion.div>
      )}

      <div className="relative flex items-start gap-3">
        {/* One line per row: the description clamps and the keys wrap inside
            their own share of the width, so keys never drop below the text. */}
        <div className="flex min-w-0 flex-1 items-start justify-between gap-x-4">
          <p
            title={entry.desc}
            className="min-w-[40%] flex-1 py-0.5"
          >
            <span className="line-clamp-2">
              <Highlight text={entry.desc} set={hl.desc} />
            </span>
          </p>
          {(showSection || entry.modes.length > 0 || !isCommand) && (
            <div className="flex min-h-6 min-w-0 items-start gap-2.5">
              {showSection && (
                <span className="hidden h-6 shrink-0 items-center whitespace-nowrap text-2xs uppercase tracking-[0.1em] text-faint sm:flex">{entry.cat}</span>
              )}
              {entry.modes.length > 0 && (
                <span className="flex h-6 shrink-0 select-none items-center gap-0.5" aria-label={`modes: ${entry.modes.map((m) => MODE_NAMES[m] ?? m).join(", ")}`}>
                  {entry.modes.map((m) => (
                    <span
                      key={m}
                      title={MODE_NAMES[m] ?? m}
                      className="flex h-4 min-w-4 items-center justify-center rounded-[4px] border border-line-strong px-1 text-[10px] leading-none text-muted"
                    >
                      {m}
                    </span>
                  ))}
                </span>
              )}
              {!isCommand && <KeySequences built={entry.built} hl={hl.keys} pressed={pressed || copied} className="min-w-0" />}
            </div>
          )}
        </div>
      </div>

      {(isCommand || example) && (
        <div className="relative mt-2 flex items-start gap-2 rounded-sm border border-line bg-black/40 py-1.5 pl-2.5 pr-1.5 text-xs leading-5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {isCommand && (
              <CodeLine glyph={template.startsWith(":") ? "" : "$"} tone="plain">
                <CommandText text={template} set={hl.keys} />
              </CodeLine>
            )}
            {example && (
              <CodeLine glyph="›" tone="example">
                <Highlight text={example} set={hl.cmd} />
              </CodeLine>
            )}
          </div>
          {copyable && (
            <span
              aria-hidden
              className={cn(
                "flex size-5 shrink-0 items-center justify-center transition-colors duration-150",
                copied ? "text-accent" : selected ? "text-fg" : "text-faint",
              )}
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </span>
          )}
        </div>
      )}
    </div>
  );
});
