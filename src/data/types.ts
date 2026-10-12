export type Placeholder = {
  /** Token name; `{name}` in `keys` is replaced by the selected value. */
  name: string;
  values: string[];
  default?: string;
};

export type Item = {
  /** A key sequence, or an array of alternative sequences. */
  keys: string | string[];
  desc: string;
  /** Optional copyable command shown under the entry. */
  cmd?: string;
  /** Mode tag(s), e.g. "n" or ["n", "x"]. */
  mode?: string | string[];
  /** Overrides what Enter/click copies. */
  copy?: string;
  /** "command": `keys` is a literal command line, rendered as code rather than keycaps. */
  type?: "command";
};

export type Section = { title: string; items: Item[] };

export type Sheet = {
  id: string;
  name: string;
  /** Hub sort order. */
  order?: number;
  tagline?: string;
  searchPlaceholder?: string;
  placeholder?: Placeholder;
  sections: Section[];
};
