import type { Item, Placeholder } from "@/data/types";

// Vim's angle-bracket names for keys that are spelled out everywhere else.
const KEY_DISPLAY: Record<string, string> = {
  "<space>": "Space",
  "<CR>": "Enter",
  "<Esc>": "Esc",
  "<Tab>": "Tab",
  "<S-Tab>": "S-Tab",
};

export type Cap = {
  text: string;
  /** Index of this cap's first character within `display`. */
  offset: number;
  /** First cap of an alternative sequence (preceded by "or"). */
  alt: boolean;
};

export type BuiltKeys = {
  /** Alternative sequences, each an array of display tokens. */
  seqs: string[][];
  /** Flat string used for searching, highlighting and copying. */
  display: string;
  /**
   * Keycaps to draw. Same characters as `display`, except that a placeholder
   * glued to other keys ("{leader}w") gets a cap of its own.
   */
  caps: Cap[];
  usesPh: boolean;
};

export function buildKeys(
  item: Pick<Item, "keys">,
  ph: Placeholder | null,
  phValue: string | null,
): BuiltKeys {
  const raw = Array.isArray(item.keys) ? item.keys : [item.keys];
  const marker = ph && phValue !== null ? `{${ph.name}}` : null;
  const seqs: string[][] = [];
  const caps: Cap[] = [];
  let cursor = 0;
  raw.forEach((k, si) => {
    if (si > 0) cursor += 4; // " or "
    const seq: string[] = [];
    k.trim().split(/\s+/).forEach((tok, ti) => {
      if (ti > 0) cursor += 1;
      const pieces = marker ? tok.split(marker) : [tok];
      const substituted = pieces.join(phValue ?? "");
      const shown = KEY_DISPLAY[substituted] ?? substituted;
      seq.push(shown);
      const parts =
        shown === substituted
          ? pieces.flatMap((piece, i) => (i > 0 ? [phValue ?? "", piece] : [piece]))
          : [shown];
      let offset = cursor;
      for (const text of parts) {
        if (text) caps.push({ text, offset, alt: si > 0 && ti === 0 && offset === cursor });
        offset += text.length;
      }
      cursor += shown.length;
    });
    seqs.push(seq);
  });
  const display = seqs.map((seq) => seq.join(" ")).join(" or ");
  const usesPh = !!ph && raw.some((k) => k.includes(`{${ph.name}}`));
  return { seqs, display, caps, usesPh };
}
