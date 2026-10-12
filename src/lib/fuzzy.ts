import type { BuiltKeys } from "./keys";

export type HighlightField = "keys" | "desc" | "cmd";
export type Highlights = Partial<Record<HighlightField, Set<number>>>;

export type Searchable = {
  built: BuiltKeys;
  desc: string;
  cmd?: string;
  cat: string;
  modeLabel?: string;
};

type Hit = { score: number; indices: number[] };

// Spoken modifier names for the notation the sheets use ("ctrl s" finds C-s).
const KEY_ALIASES: Record<string, string> = {
  ctrl: "c-",
  control: "c-",
  shift: "s-",
  alt: "m-",
  meta: "m-",
  option: "m-",
  return: "enter",
  escape: "esc",
};

const isWordChar = (c: string | undefined) => !!c && /[a-z0-9]/.test(c);

const range = (start: number, length: number) => Array.from({ length }, (_, i) => start + i);

/**
 * Score one query token against one piece of text, in tiers:
 * a whole word, the start of a word, a substring, then a tight subsequence.
 * Loose subsequences (letters scattered across the text) do not match at all.
 */
export function matchToken(token: string, text: string): Hit | null {
  const hay = text.toLowerCase();
  if (!token || !hay) return null;

  let best: Hit | null = null;
  for (let at = hay.indexOf(token); at !== -1; at = hay.indexOf(token, at + 1)) {
    const startsWord = !isWordChar(hay[at - 1]);
    const endsWord = !isWordChar(hay[at + token.length]);
    const tier = startsWord ? (endsWord ? 120 : 100) : 60;
    // Earlier hits rank slightly higher within a tier.
    const score = tier - Math.min(at, 40) * 0.25;
    if (!best || score > best.score) best = { score, indices: range(at, token.length) };
    if (startsWord && endsWord) break;
  }
  if (best) return best;

  // Subsequence, for typos and abbreviations ("splt", "kilsess").
  if (token.length < 3) return null;
  const indices: number[] = [];
  let ti = 0;
  for (let i = 0; i < hay.length && ti < token.length; i++) {
    if (hay[i] === token[ti]) {
      indices.push(i);
      ti++;
    }
  }
  if (ti < token.length) return null;
  const span = indices[indices.length - 1] - indices[0] + 1;
  if (span > token.length * 2) return null;
  return { score: 30 - (span - token.length), indices };
}

const squash = (s: string) => s.toLowerCase().replace(/[\s<>]/g, "");

/**
 * Every query token must match somewhere in the entry. Each token is
 * highlighted in the visible field where it scores best; the section title,
 * mode and placeholder name count toward the match but are not highlighted.
 */
export function matchItem(
  item: Searchable,
  query: string,
  phName: string | null,
): { score: number; hl: Highlights | null } | null {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { score: 0, hl: null };

  const keys = item.built.display;
  const visible: Array<[HighlightField, string, number]> = [
    ["keys", keys, 1],
    ["desc", item.desc, 1],
    ["cmd", item.cmd || "", 0.9],
  ];
  const hidden: Array<[string, number]> = [
    [item.cat, 0.85],
    [item.modeLabel || "", 0.5],
    [phName && item.built.usesPh ? phName : "", 0.5],
  ];

  let total = 0;
  const hl: Highlights = {};
  for (const tok of tokens) {
    let best: Hit | null = null;
    let bestField: HighlightField | null = null;
    for (const [field, text, weight] of visible) {
      let hit = matchToken(tok, text);
      const alias = field === "keys" ? KEY_ALIASES[tok] : undefined;
      if (alias) {
        const viaAlias = matchToken(alias, text);
        if (viaAlias && (!hit || viaAlias.score > hit.score)) hit = viaAlias;
      }
      if (hit && (!best || hit.score * weight > best.score)) {
        best = { score: hit.score * weight, indices: hit.indices };
        bestField = field;
      }
    }
    for (const [text, weight] of hidden) {
      const hit = matchToken(tok, text);
      if (hit && (!best || hit.score * weight > best.score)) {
        best = { score: hit.score * weight, indices: [] };
        bestField = null;
      }
    }
    if (!best) return null;
    total += best.score;
    if (bestField) {
      const set = (hl[bestField] ??= new Set<number>());
      best.indices.forEach((i) => set.add(i));
    }
  }

  // Typing the key sequence itself ("space w", "ctrl s", "C-b %") should put
  // that binding first, ahead of entries that merely mention the same words.
  const typed = squash(tokens.map((t) => KEY_ALIASES[t] ?? t).join(""));
  const sequences = item.built.seqs.map((seq) => squash(seq.join("")));
  if (sequences.some((s) => s === typed)) total += 300;
  else if (sequences.some((s) => s.startsWith(typed))) total += 80;

  return { score: total, hl };
}
