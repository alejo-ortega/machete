import type { ReactNode } from "react";

/** Wraps the characters of `text` whose (offset) index is in `set` in <mark>. */
export function Highlight({
  text,
  set,
  offset = 0,
}: {
  text: string;
  set?: Set<number>;
  offset?: number;
}) {
  if (!set || !set.size) return text;
  const out: ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    const on = set.has(offset + i);
    let j = i + 1;
    while (j < text.length && set.has(offset + j) === on) j++;
    const run = text.slice(i, j);
    out.push(on ? <mark key={i}>{run}</mark> : run);
    i = j;
  }
  return <>{out}</>;
}
