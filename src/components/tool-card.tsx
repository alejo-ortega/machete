"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type PointerEvent } from "react";
import type { BuiltKeys } from "@/lib/keys";
import { Kbd, KeySequences } from "./kbd";

export type ToolSummary = {
  id: string;
  name: string;
  tagline: string;
  entries: number;
  sections: number;
  /** A few representative bindings shown as a preview. */
  preview: BuiltKeys[];
};

function ToolCard({ tool, index }: { tool: ToolSummary; index: number }) {
  // Feed the pointer position to the CSS spotlight.
  const track = (e: PointerEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.06 + Math.min(index, 8) * 0.05 }}
    >
      <Link
        href={`/cheatsheets/${tool.id}`}
        data-tool
        onPointerMove={track}
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line-strong bg-surface p-5 shadow-panel transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-bright focus-visible:border-accent/60"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(280px_circle_at_var(--mx,50%)_var(--my,0%),rgb(163_230_53/0.05),transparent_70%)] group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <div className="relative flex items-center justify-between">
          {/* The number is the key that opens this sheet. */}
          {index < 9 ? (
            <Kbd size="sm" className="pointer-coarse:hidden">
              {index + 1}
            </Kbd>
          ) : (
            <span />
          )}
          <ArrowRight
            aria-hidden
            strokeWidth={2}
            className="size-4 text-faint transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-accent group-focus-visible:translate-x-0.5 group-focus-visible:text-accent"
          />
        </div>
        <h2 className="relative mt-5 text-lg font-semibold tracking-tight">{tool.name}</h2>
        <p className="relative mt-1.5 min-h-10 text-muted">{tool.tagline}</p>

        <div aria-hidden className="relative mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          {tool.preview.map((built, i) => (
            <KeySequences key={i} built={built} className="justify-start" />
          ))}
        </div>

        <p className="relative mt-auto pt-6 text-xs text-faint">
          <span className="text-fg">{tool.entries}</span> entries in {tool.sections} sections
        </p>
      </Link>
    </motion.li>
  );
}

/** The hub's sheet list. Number keys open a sheet; arrows and j/k walk the cards. */
export function ToolGrid({ tools }: { tools: ToolSummary[] }) {
  const router = useRouter();
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= Math.min(tools.length, 9)) {
        e.preventDefault();
        router.push(`/cheatsheets/${tools[n - 1].id}`);
        return;
      }
      const forward = ["ArrowDown", "ArrowRight", "j", "l"].includes(e.key);
      const back = ["ArrowUp", "ArrowLeft", "k", "h"].includes(e.key);
      if (!forward && !back) return;
      const cards = [...(list.current?.querySelectorAll<HTMLAnchorElement>("[data-tool]") ?? [])];
      if (!cards.length) return;
      e.preventDefault();
      const at = cards.indexOf(document.activeElement as HTMLAnchorElement);
      const next = at === -1 ? (forward ? 0 : cards.length - 1) : (at + (forward ? 1 : -1) + cards.length) % cards.length;
      cards[next].focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router, tools]);

  return (
    <ul ref={list} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, i) => (
        <ToolCard key={tool.id} tool={tool} index={i} />
      ))}
    </ul>
  );
}
