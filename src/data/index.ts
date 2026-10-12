import type { Sheet } from "./types";
import { nvim } from "./nvim";
import { tmux } from "./tmux";

// Register a sheet by adding it to this list.
const registry: Sheet[] = [tmux, nvim];

export const sheets: Sheet[] = [...registry].sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99),
);

export function getSheet(id: string): Sheet | undefined {
  return sheets.find((s) => s.id === id);
}

export function countEntries(sheet: Sheet): number {
  return sheet.sections.reduce((acc, sec) => acc + sec.items.length, 0);
}

export type { Item, Placeholder, Section, Sheet } from "./types";
