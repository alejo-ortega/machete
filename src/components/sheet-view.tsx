"use client";

import { Keyboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Sheet } from "@/data/types";
import { ALL, useSheetSearch, type Result } from "@/hooks/use-sheet-search";
import { copyText } from "@/lib/clipboard";
import { EmptyState } from "./empty-state";
import { EntryList } from "./entry-list";
import { copyTextOf, optionId } from "./entry-row";
import { arrows } from "./arrow-keys";
import { KeyLegend } from "./key-legend";
import { Logo } from "./logo";
import { PlaceholderToggle } from "./placeholder-toggle";
import { ScrollArea } from "./scroll-area";
import { SearchBar } from "./search-bar";
import { SectionRail, SectionStrip } from "./section-nav";
import { SheetTabs, type SheetLink } from "./sheet-tabs";
import { KeyHint, StatusBar, StatusDivider } from "./status-bar";
import { Toast, type ToastMessage } from "./toast";

const LIST_ID = "entries";
const COPIED_MS = 1400;
const PRESS_MS = 420;
const PAGE = 8;

// Don't summon the on-screen keyboard on touch devices.
const finePointer = () => window.matchMedia("(pointer: fine)").matches;

export function SheetView({ sheet, sheets }: { sheet: Sheet; sheets: SheetLink[] }) {
  const s = useSheetSearch(sheet);
  const { results, selected, setSelected, setQuery, setActiveCat, setPhValue, query, activeCat, ph, phValue } = s;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  const timers = useRef<{ toast?: ReturnType<typeof setTimeout>; press?: ReturnType<typeof setTimeout> }>({});
  const pointer = useRef({ x: -1, y: -1 });

  const sectionTitles = sheet.sections.map((sec) => sec.title);
  const phKey = ph ? `machete:${sheet.id}:${ph.name}` : null;

  const focusSearch = useCallback(() => {
    if (finePointer()) inputRef.current?.focus();
  }, []);

  // Restore what a reload or a shared link should bring back: the query and
  // section from the URL, the prefix / leader choice from this browser.
  const restore = useRef(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const section = params.get("s");
    if (q) setQuery(q);
    if (section && sheet.sections.some((sec) => sec.title === section)) setActiveCat(section);
    if (ph && phKey) {
      try {
        const saved = window.localStorage.getItem(phKey);
        if (saved && ph.values.includes(saved)) setPhValue(saved);
      } catch {
        // Storage unavailable (private mode): the default stands.
      }
    }
    setRestored(true);
  });
  useEffect(() => {
    const pending = timers.current;
    restore.current();
    focusSearch();
    return () => {
      clearTimeout(pending.toast);
      clearTimeout(pending.press);
    };
  }, [focusSearch]);

  useEffect(() => {
    if (!restored) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeCat !== ALL) params.set("s", activeCat);
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, [restored, query, activeCat]);

  const toTop = () => viewportRef.current?.scrollTo({ top: 0 });

  // A new query or section starts from the top of the list.
  const search = useCallback(
    (q: string) => {
      setQuery(q);
      toTop();
    },
    [setQuery],
  );
  const pickSection = useCallback(
    (title: string) => {
      setActiveCat(title);
      toTop();
    },
    [setActiveCat],
  );
  const pickPlaceholder = useCallback(
    (value: string) => {
      setPhValue(value);
      if (!phKey) return;
      try {
        window.localStorage.setItem(phKey, value);
      } catch {
        // Not persisted; the choice still applies to this visit.
      }
    },
    [setPhValue, phKey],
  );

  // Enter or click. A command is copied; a key binding has nothing to paste,
  // so its caps press down to answer the keystroke instead.
  const activate = useCallback(
    (entry: Result | undefined) => {
      // A click that ends a text selection is a selection, not an activation.
      if (!entry || window.getSelection()?.toString()) return;
      // Clicking a row blurs the search field; hand focus back so the arrow keys keep working.
      focusSearch();
      const text = copyTextOf(entry);
      if (!text) {
        setPressedId(entry.id);
        clearTimeout(timers.current.press);
        timers.current.press = setTimeout(() => setPressedId(null), PRESS_MS);
        return;
      }
      void copyText(text).then((ok) => {
        setCopiedId(ok ? entry.id : null);
        setToast({ key: Date.now(), text, ok });
        clearTimeout(timers.current.toast);
        timers.current.toast = setTimeout(() => {
          setToast(null);
          setCopiedId(null);
        }, COPIED_MS);
      });
    },
    [focusSearch],
  );

  // Scrolling slides rows under a resting pointer; only a real move selects.
  const hover = useCallback(
    (index: number, x: number, y: number) => {
      if (pointer.current.x === x && pointer.current.y === y) return;
      pointer.current = { x, y };
      setSelected(index);
    },
    [setSelected],
  );

  useEffect(() => {
    const move = (next: number) => {
      const clamped = Math.min(Math.max(next, 0), results.length - 1);
      setSelected(clamped);
      document.getElementById(optionId(clamped))?.scrollIntoView({ block: "nearest" });
    };
    // The entry sitting beside the selected one, wherever the layout put it:
    // nearest column in that direction, then the row closest in height.
    const beside = (dir: 1 | -1): number | null => {
      const from = document.getElementById(optionId(selected))?.getBoundingClientRect();
      if (!from) return null;
      const fromY = from.top + from.height / 2;
      let best: { index: number; dx: number; dy: number } | null = null;
      for (let index = 0; index < results.length; index++) {
        const r = document.getElementById(optionId(index))?.getBoundingClientRect();
        if (!r) continue;
        const dx = dir > 0 ? r.left - from.right : from.left - r.right;
        if (dx < -1) continue;
        const dy = Math.max(r.top - fromY, fromY - r.bottom, 0);
        if (!best || dx < best.dx - 1 || (dx <= best.dx + 1 && dy < best.dy)) best = { index, dx, dy };
      }
      return best ? best.index : null;
    };
    const cycle = <T,>(list: T[], current: T, dir: 1 | -1) =>
      list[(list.indexOf(current) + dir + list.length) % list.length];

    const onKeyDown = (e: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input) return;

      // Work from anywhere on the page.
      if ((e.ctrlKey || e.metaKey) && e.code === "Slash") {
        e.preventDefault();
        setLegendOpen((open) => !open);
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          pickSection(cycle([ALL, ...sectionTitles], activeCat, e.key === "ArrowDown" ? 1 : -1));
        } else if (e.code === "KeyP" && ph && phValue !== null) {
          e.preventDefault();
          pickPlaceholder(cycle(ph.values, phValue, 1));
        } else if ((e.code === "BracketRight" || e.code === "BracketLeft") && sheets.length > 1) {
          e.preventDefault();
          const ids = sheets.map((x) => x.id);
          router.push(`/cheatsheets/${cycle(ids, sheet.id, e.code === "BracketRight" ? 1 : -1)}`);
        }
        return;
      }
      if (e.key === "Escape" && legendOpen) {
        setLegendOpen(false);
        return;
      }

      if (document.activeElement !== input) {
        if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          input.focus();
        }
        return;
      }

      // Search has focus: these act on the list.
      const ctrl = e.ctrlKey && !e.metaKey && !e.shiftKey;
      if (e.key === "ArrowDown" || (ctrl && (e.key === "j" || e.key === "n"))) {
        e.preventDefault();
        move(selected + 1);
      } else if (e.key === "ArrowUp" || (ctrl && (e.key === "k" || e.key === "p"))) {
        e.preventDefault();
        move(selected - 1);
      } else if (e.key === "PageDown" || e.key === "PageUp") {
        e.preventDefault();
        move(selected + (e.key === "PageDown" ? PAGE : -PAGE));
      } else if ((e.key === "Home" || e.key === "End") && !query) {
        // With text in the field these keep moving the caret.
        e.preventDefault();
        move(e.key === "Home" ? 0 : results.length - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (e.shiftKey || e.metaKey || e.ctrlKey) return;
        // With nothing beside the selection the key keeps moving the text caret.
        const next = beside(e.key === "ArrowRight" ? 1 : -1);
        if (next === null) return;
        e.preventDefault();
        move(next);
      } else if (e.key === "Enter") {
        e.preventDefault();
        activate(results[selected]);
      } else if (e.key === "Escape") {
        // First the query, then the section.
        if (query) search("");
        else if (activeCat !== ALL) pickSection(ALL);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // sectionTitles and sheets are derived from props and stable per sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, selected, setSelected, search, pickSection, pickPlaceholder, activate, query, activeCat, ph, phValue, legendOpen, router, sheet.id]);

  const nav = {
    categories: s.categories,
    active: activeCat,
    searching: !!query.trim(),
    onChange: (title: string) => {
      pickSection(title);
      focusSearch();
    },
  };

  // The tally's denominator is whatever the list is drawn from right now.
  const scopeTotal =
    activeCat === ALL ? s.total : (sheet.sections.find((sec) => sec.title === activeCat)?.items.length ?? 0);
  const scopeLabel = activeCat === ALL ? "entries" : `in ${activeCat}`;
  const modes = [...new Set(sheet.sections.flatMap((sec) => sec.items.flatMap((item) => item.mode ?? [])))];

  return (
    <>
      {/* The page itself never scrolls; only the entry list does. */}
      <div className="mx-auto flex h-dvh w-full max-w-[1240px] flex-col overflow-hidden px-4 pb-10 pointer-coarse:pb-12 sm:px-6">
        <header className="shrink-0 pb-4 pt-5 short:pb-2 short:pt-3 sm:pt-7">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              aria-label="machete, all cheatsheets"
              className="group -ml-1 flex items-center gap-2 rounded-sm px-1 text-base text-muted transition-colors duration-150 hover:text-fg pointer-coarse:h-9"
            >
              <Logo className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              machete
            </Link>
            <span aria-hidden className="select-none text-base text-ghost">
              /
            </span>
            <h1 className="text-lg font-semibold tracking-tight text-fg">
              {sheet.name} <span className="font-normal text-muted">cheatsheet</span>
            </h1>
          </div>
          {sheet.tagline && <p className="mt-1.5 hidden max-w-[80ch] text-muted short:hidden sm:block">{sheet.tagline}</p>}
        </header>

        <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
          <main className="flex h-full min-h-0 min-w-0 flex-col">
            <div className="shrink-0">
              <SearchBar
                inputRef={inputRef}
                value={query}
                onChange={search}
                placeholder={sheet.searchPlaceholder || "fuzzy search…"}
                listId={results.length ? LIST_ID : undefined}
                activeId={results.length ? optionId(selected) : undefined}
                count={`${results.length} / ${scopeTotal}`}
              />
              <p aria-live="polite" className="sr-only">
                {results.length} of {scopeTotal} {scopeLabel}
                {query ? ` for “${query}”` : ""}
              </p>
              <div className="mt-3 lg:hidden">
                <SectionStrip {...nav} />
              </div>
            </div>

            <ScrollArea viewportRef={viewportRef} className="flex-1">
              {results.length ? (
                <EntryList
                  id={LIST_ID}
                  results={results}
                  grouped={s.grouped}
                  sections={sectionTitles}
                  flatTitle={activeCat === ALL ? "Results" : activeCat}
                  selected={selected}
                  copiedId={copiedId}
                  pressedId={pressedId}
                  onHover={hover}
                  onActivate={activate}
                />
              ) : (
                <EmptyState
                  query={query}
                  section={activeCat === ALL ? null : activeCat}
                  elsewhere={activeCat === ALL ? 0 : s.matchedTotal}
                  sections={sectionTitles}
                  onAllSections={() => {
                    pickSection(ALL);
                    focusSearch();
                  }}
                  onPickSection={(title) => {
                    search("");
                    pickSection(title);
                    focusSearch();
                  }}
                  onClear={() => {
                    search("");
                    pickSection(ALL);
                    focusSearch();
                  }}
                />
              )}
            </ScrollArea>
          </main>

          {/* After the list in source so Tab leaves search toward it and
              Shift+Tab reaches the way back; drawn first on wide screens. */}
          <aside className="no-scrollbar hidden overflow-y-auto pb-4 lg:order-first lg:block">
            <SectionRail {...nav} />
          </aside>
        </div>
      </div>

      <StatusBar
        left={
          <>
            <SheetTabs sheets={sheets} current={sheet.id} />
            {ph && (
              <>
                <StatusDivider />
                <PlaceholderToggle
                  placeholder={ph}
                  value={phValue}
                  onChange={(v) => {
                    pickPlaceholder(v);
                    focusSearch();
                  }}
                />
              </>
            )}
          </>
        }
        right={
          <>
            <KeyHint keys={[arrows.up, arrows.down]} label="move" className="hidden lg:flex pointer-coarse:hidden" />
            <KeyHint keys={["Enter"]} label="copy" className="hidden lg:flex pointer-coarse:hidden" />
            <KeyHint keys={["Esc"]} label="clear" className="hidden xl:flex pointer-coarse:hidden" />
            <button
              type="button"
              data-legend-toggle
              aria-expanded={legendOpen}
              aria-controls="key-legend"
              onClick={() => {
                setLegendOpen((open) => !open);
                focusSearch();
              }}
              className="-mr-2 flex h-7 items-center gap-2 rounded-sm px-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg aria-expanded:bg-white/[0.06] aria-expanded:text-fg pointer-coarse:h-9"
            >
              <Keyboard aria-hidden className="size-3.5" strokeWidth={2} />
              <span>keys</span>
            </button>
          </>
        }
      />
      <KeyLegend
        open={legendOpen}
        onClose={() => setLegendOpen(false)}
        placeholderName={ph?.name}
        modes={modes}
        multipleSheets={sheets.length > 1}
      />
      <Toast message={toast} />
    </>
  );
}
