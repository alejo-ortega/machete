# machete

Fuzzy-findable cheatsheets for the tools I use. Static HTML/CSS/JS — no build,
no server. Open `index.html` directly or serve it from GitHub Pages.

## Structure

```
index.html               hub — lists every registered sheet
cheatsheets/<tool>.html  one thin page per tool
assets/styles.css        shared theme
assets/engine.js         generic fuzzy finder (reads a sheet at runtime)
assets/hub.js            hub renderer
data/<tool>.js           one data file per tool
```

## Adding a tool

1. Create `data/<tool>.js`:

   ```js
   window.MACHETE_SHEETS = window.MACHETE_SHEETS || {};
   window.MACHETE_SHEETS.myTool = {
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

2. Copy `cheatsheets/tmux.html` to `cheatsheets/myTool.html` and change
   `window.MACHETE_ID` to `"myTool"`.
3. Add `<script src="data/myTool.js"></script>` to `index.html`.

## Data schema

A sheet is `{ id, name, order, tagline, searchPlaceholder, placeholder?, sections }`.

| Field | Meaning |
|---|---|
| `sections[].title` | Category shown as a chip; drives grouping |
| `items[].keys` | A key sequence string, or an array of alternatives |
| `items[].desc` | Human description (required) |
| `items[].cmd` | Optional copyable command shown in the card |
| `items[].mode` | Optional mode tag(s), e.g. `"n"` or `["n","x"]` |
| `items[].copy` | Optional override for what Enter/click copies |

Details:

- `keys` is split on whitespace; each token renders as a `<kbd>`. Loose ends like
  `<leader>` are fine — write `"{leader} w"` for leader-then-`w`.
- `placeholder` adds the header toggle. `"{prefix}"` / `"{leader}"` in `keys` are
  replaced with the selected value. Searching the placeholder name (e.g.
  `"leader"`) matches only the bindings that use it.
- `<space>`, `<CR>`, `<Esc>`, `<Tab>`, `<S-Tab>` get friendly glyphs.
- Enter or clicking a card copies `copy` → `cmd` → the rendered keys.

## Publishing

GitHub Pages can serve the repo root as-is (`.nojekyll` is included). The repo
is `machete`, so the site lives at `https://alejo-ortega.github.io/machete/`.
