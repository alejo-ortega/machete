"use client";

import { useCallback, useMemo, useState } from "react";
import type { Item, Sheet } from "@/data/types";
import { matchItem, type Highlights } from "@/lib/fuzzy";
import { buildKeys, type BuiltKeys } from "@/lib/keys";

export const ALL = "All";

export type Entry = Item & {
  id: string;
  cat: string;
  modes: string[];
  modeLabel?: string;
  built: BuiltKeys;
};

export type Result = Entry & { index: number; score: number; hl: Highlights | null };

export type Category = { title: string; count: number };

export function useSheetSearch(sheet: Sheet) {
  const ph = sheet.placeholder ?? null;
  const [query, setQueryState] = useState("");
  const [activeCat, setActiveCatState] = useState(ALL);
  const [phValue, setPhValue] = useState<string | null>(
    ph ? (ph.default ?? ph.values[0]) : null,
  );
  const [sel, setSel] = useState(0);

  const entries = useMemo<Entry[]>(
    () =>
      sheet.sections.flatMap((section, si) =>
        section.items.map((item, ii) => {
          const modes = item.mode ? (Array.isArray(item.mode) ? item.mode : [item.mode]) : [];
          return {
            ...item,
            id: `${si}-${ii}`,
            cat: section.title,
            modes,
            modeLabel: modes.length ? modes.join("/") : undefined,
            built: buildKeys(item, ph, phValue),
          };
        }),
      ),
    [sheet, ph, phValue],
  );

  // Everything the query matches, in every section, best first.
  const matched = useMemo(() => {
    const out: Array<Omit<Result, "index">> = [];
    for (const entry of entries) {
      const m = matchItem(entry, query, ph?.name ?? null);
      if (m) out.push({ ...entry, score: m.score, hl: m.hl });
    }
    if (query.trim()) out.sort((a, b) => b.score - a.score);
    return out;
  }, [entries, query, ph]);

  // Section counts follow the query, so the nav shows where the matches are.
  const categories = useMemo<Category[]>(
    () => [
      { title: ALL, count: matched.length },
      ...sheet.sections.map((s) => ({
        title: s.title,
        count: matched.filter((m) => m.cat === s.title).length,
      })),
    ],
    [sheet, matched],
  );

  const results = useMemo<Result[]>(
    () =>
      matched
        .filter((m) => activeCat === ALL || m.cat === activeCat)
        .map((r, index) => ({ ...r, index })),
    [matched, activeCat],
  );

  const selected = Math.min(sel, Math.max(0, results.length - 1));

  const setQuery = useCallback(
    (q: string) => {
      // A fresh search looks everywhere; a leftover section filter would hide matches.
      if (!query.trim() && q.trim()) setActiveCatState(ALL);
      setQueryState(q);
      setSel(0);
    },
    [query],
  );

  const setActiveCat = useCallback((c: string) => {
    setActiveCatState(c);
    setSel(0);
  }, []);

  return {
    ph,
    phValue,
    setPhValue,
    query,
    setQuery,
    activeCat,
    setActiveCat,
    categories,
    total: entries.length,
    /** Matches in all sections, regardless of the active one. */
    matchedTotal: matched.length,
    results,
    selected,
    setSelected: setSel,
    /** Sections are shown as separate panels only when nothing narrows the list. */
    grouped: !query.trim() && activeCat === ALL,
  };
}
