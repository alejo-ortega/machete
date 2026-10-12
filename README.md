# machete

Fuzzy-findable cheatsheets for the tools I use. Next.js (static export) +
React + TypeScript + Tailwind CSS + Motion.

## Develop

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static site in out/
pnpm preview    # serve out/ locally
pnpm lint && pnpm typecheck
```

## Structure

```
src/app/page.tsx                    hub — lists every registered sheet
src/app/cheatsheets/[id]/page.tsx   one static page per sheet
src/app/globals.css                 design tokens (@theme) and the keycap style
src/data/<tool>.ts                  one data file per tool
src/data/index.ts                   sheet registry
src/lib/fuzzy.ts                    fuzzy matcher and scoring
src/lib/keys.ts                     key-sequence parsing, placeholder substitution
src/hooks/use-sheet-search.ts       query / section / placeholder / selection state
src/components/                     UI (sheet view, entry rows, keycaps, nav, …)
```

## Adding a tool

1. Create `src/data/<tool>.ts`:

   ```ts
   import type { Sheet } from "./types";

   export const myTool: Sheet = {
     id: "myTool",
     name: "My Tool",
     order: 3,                       // hub sort order
     tagline: "One-line description",
     searchPlaceholder: 'try "save"',
     placeholder: { name: "prefix", values: ["C-b", "C-a"], default: "C-b" }, // optional
     sections: [
       { title: "Editing", items: [
         { keys: "{prefix} s", desc: "Save", cmd: "my-tool save" },
       ]},
     ],
   };
   ```

2. Add it to the `registry` array in `src/data/index.ts`.

The page at `/cheatsheets/myTool` and its hub card are generated from that.

## Data schema

A sheet is `{ id, name, order, tagline, searchPlaceholder, placeholder?, sections }`
(typed in `src/data/types.ts`).

| Field | Meaning |
|---|---|
| `sections[].title` | Section name; drives grouping and the section nav |
| `items[].keys` | A key sequence string, or an array of alternatives |
| `items[].desc` | Human description (required) |
| `items[].cmd` | Optional command shown under the entry; makes it copyable |
| `items[].mode` | Optional mode tag(s), e.g. `"n"` or `["n","x"]` |
| `items[].copy` | Optional override for what Enter/click copies |
| `items[].type` | Optional `"command"`: `keys` is a literal command line |

Details:

- `keys` is split on whitespace; each token renders as a keycap. Loose ends like
  `<leader>` are fine — write `"{leader} w"` for leader-then-`w`.
- `placeholder` adds the header toggle. `"{prefix}"` / `"{leader}"` in `keys` are
  replaced with the selected value and drawn as their own keycap. Searching the
  placeholder name (e.g. `"leader"`) matches only the bindings that use it.
- `<space>`, `<CR>`, `<Esc>`, `<Tab>`, `<S-Tab>` are spelled out (`Space`,
  `Enter`, …) so they read like every other key.
- `type: "command"` entries (`tmux ls`, `:Mason`) render as a code line instead
  of keycaps, with `<argument>` placeholders dimmed.
- Enter or clicking an entry copies its `copy` or `cmd` value. Entries with
  neither (plain key bindings) have no copy action.
- Keycaps are not text-selectable, so selecting and copying a region of the
  page never picks up key labels. Descriptions and commands select normally.

## Search

Every word of the query must match the entry's keys, description, command,
section, mode or placeholder name. Whole words rank above word starts, then
substrings, then tight typos (`splt`); scattered letters do not match. Typing
the key sequence itself (`space w`, `ctrl s`, `C-b %`) puts that binding first.

A query searches every section. Picking a section narrows the results, and the
section list shows how many matches each one holds. The query and section live
in the URL (`?q=git&s=Git`), so a lookup can be bookmarked; the prefix / leader
choice is remembered per sheet in the browser.

## Keyboard

On a sheet (`Ctrl` `/` shows this list in the app):

| Key | Action |
|---|---|
| `/` | focus search |
| `↑` `↓`, `Ctrl` `j` / `k`, `Ctrl` `n` / `p` | move the selection |
| `←` `→` | jump to the entry beside the selected one |
| `PgUp` `PgDn` | move 8 entries |
| `Home` `End` | first / last entry (when the search box is empty) |
| `Enter` | copy the selected command |
| `Esc` | clear the search, then the section |
| `Alt` `↑` / `↓` | previous / next section |
| `Alt` `p` | switch prefix / leader |
| `Alt` `[` / `]` | previous / next sheet |

On the hub, `1`–`9` open a sheet and the arrow keys or `j` / `k` move between
them. Browsers reserve some combinations (`Ctrl` `n` in Chrome), which is why
each action has more than one key.

## Publishing

`pnpm build` writes a fully static site to `out/` (including
`cheatsheets/<id>.html`). No deploy is wired up yet. To host under a sub-path
such as GitHub Pages' `/machete`, build with `NEXT_PUBLIC_BASE_PATH=/machete`
and publish `out/`.
