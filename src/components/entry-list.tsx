"use client";

import type { ReactNode } from "react";
import type { Result } from "@/hooks/use-sheet-search";
import { EntryRow } from "./entry-row";

type RowHandlers = {
  selected: number;
  copiedId: string | null;
  pressedId: string | null;
  onHover: (index: number, x: number, y: number) => void;
  onActivate: (entry: Result) => void;
};

function Panel({
  title,
  count,
  labelId,
  children,
}: {
  title: string;
  count: number;
  labelId: string;
  children: ReactNode;
}) {
  return (
    <section
      role="group"
      aria-labelledby={labelId}
      className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-line bg-surface/80 shadow-panel last:mb-0"
    >
      <div role="presentation" className="flex h-10 items-center justify-between border-b border-line px-4">
        <h2 id={labelId} className="text-2xs font-medium uppercase tracking-[0.12em] text-muted">
          {title}
        </h2>
        <span aria-hidden className="text-2xs text-faint">
          {count}
        </span>
      </div>
      <div className="p-1">{children}</div>
    </section>
  );
}

export function EntryList({
  id,
  results,
  grouped,
  sections,
  flatTitle,
  ...rows
}: {
  id: string;
  results: Result[];
  grouped: boolean;
  /** Section titles, in sheet order. */
  sections: string[];
  /** Panel heading for the flat (searched / filtered) view. */
  flatTitle: string;
} & RowHandlers) {
  const row = (entry: Result, showSection: boolean) => (
    <EntryRow
      key={entry.id}
      entry={entry}
      selected={entry.index === rows.selected}
      copied={entry.id === rows.copiedId}
      pressed={entry.id === rows.pressedId}
      showSection={showSection}
      onHover={rows.onHover}
      onActivate={rows.onActivate}
    />
  );

  return (
    <div id={id} role="listbox" aria-label="Entries">
      {grouped ? (
        <div className="xl:columns-2 xl:gap-4">
          {sections.map((title, i) => {
            const items = results.filter((r) => r.cat === title);
            if (!items.length) return null;
            return (
              <Panel key={title} title={title} count={items.length} labelId={`${id}-s${i}`}>
                {items.map((r) => row(r, false))}
              </Panel>
            );
          })}
        </div>
      ) : (
        <Panel title={flatTitle} count={results.length} labelId={`${id}-flat`}>
          {results.map((r) => row(r, flatTitle === "Results"))}
        </Panel>
      )}
    </div>
  );
}
