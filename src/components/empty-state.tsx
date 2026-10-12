"use client";

import { SearchX } from "lucide-react";

const button =
  "h-8 rounded-sm border border-line-strong bg-raised px-3 text-xs text-fg shadow-panel transition-colors duration-150 hover:border-line-bright pointer-coarse:h-10";

export function EmptyState({
  query,
  section,
  elsewhere,
  sections,
  onAllSections,
  onPickSection,
  onClear,
}: {
  query: string;
  /** The active section, when the list is narrowed to one. */
  section: string | null;
  /** How many entries match the query across all sections. */
  elsewhere: number;
  sections: string[];
  onAllSections: () => void;
  onPickSection: (title: string) => void;
  onClear: () => void;
}) {
  const q = query.trim();
  // The query does match, just not in the section being looked at.
  const hiddenBySection = !!section && elsewhere > 0;

  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-14 text-center short:py-6">
      <span className="mb-4 flex size-10 items-center justify-center rounded-md border border-line-strong bg-raised text-muted shadow-panel short:hidden">
        <SearchX aria-hidden className="size-4" strokeWidth={2} />
      </span>
      <p className="text-fg">
        No matches{q ? <> for <span className="text-accent">&ldquo;{q}&rdquo;</span></> : null}
        {section ? <> in {section}</> : null}.
      </p>

      {hiddenBySection ? (
        <>
          <p className="mt-1 text-xs text-muted">
            {elsewhere} {elsewhere === 1 ? "match" : "matches"} in other sections.
          </p>
          <button type="button" onClick={onAllSections} className={`${button} mt-5`}>
            search all sections
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted">Nothing on this sheet matches. Browse a section instead:</p>
          <div className="mt-4 flex max-w-xl flex-wrap justify-center gap-1.5">
            {sections.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => onPickSection(title)}
                className="h-7 rounded-full border border-line-strong px-3 text-xs text-muted transition-colors duration-150 hover:border-accent/40 hover:text-accent pointer-coarse:h-9"
              >
                {title}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClear} className={`${button} mt-6`}>
            clear search
          </button>
        </>
      )}
    </div>
  );
}
