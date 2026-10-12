"use client";

import { ChevronRight, X } from "lucide-react";
import type { RefObject } from "react";
import { Kbd } from "./kbd";

export function SearchBar({
  inputRef,
  value,
  onChange,
  placeholder,
  listId,
  activeId,
  count,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** The listbox this field controls, when there is one on screen. */
  listId?: string;
  activeId?: string;
  /** Short result tally shown inside the field, e.g. "3 / 62". */
  count: string;
}) {
  return (
    <div className="group relative">
      <ChevronRight
        aria-hidden
        strokeWidth={2.25}
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-faint transition-colors duration-200 group-focus-within:text-accent"
      />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search this cheatsheet"
        aria-expanded={!!listId}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-line-strong bg-surface pl-10 pr-28 text-[16px] text-fg caret-accent shadow-panel outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-faint focus:border-accent/60 focus:shadow-[0_0_0_3px_rgb(163_230_53/0.12)] sm:text-base"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <span aria-hidden className="select-none whitespace-nowrap pr-1.5 text-xs text-faint">
          {count}
        </span>
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            title="Clear (Esc)"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="flex size-7 items-center justify-center rounded-sm text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg pointer-coarse:size-9"
          >
            <X aria-hidden className="size-3.5" strokeWidth={2.25} />
          </button>
        ) : (
          <span aria-hidden className="mr-1 group-focus-within:hidden pointer-coarse:hidden">
            <Kbd size="sm">/</Kbd>
          </span>
        )}
      </div>
    </div>
  );
}
