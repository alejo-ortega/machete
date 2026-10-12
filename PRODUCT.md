# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the author: a developer who lives in the terminal and uses
tmux and Neovim daily. They open machete in a browser tab for two equally common
reasons: a mid-task lookup (forgot a binding, need the answer in seconds, then
back to work) and unhurried review (reading through a section to learn or
re-memorise bindings).

The secondary audience is strangers who land on it from the author's GitHub or
dotfiles. It should read well for them, but it is not built around their setups.

## Product Purpose

machete is a set of fuzzy-findable cheatsheets, one per tool, listing key
bindings and commands. It exists so the author can find a binding or command
faster than by searching docs or grepping config. Success is: the right entry is
on screen within a few keystrokes, and a section can be scanned top to bottom
without friction.

## Positioning

The content mirrors the author's actual configuration (their tmux prefix, their
Neovim leader, their plugins and keymaps), not the generic defaults of each
tool. A generic cheatsheet site cannot say that.

## Operating Context

- Used alongside a terminal and editor, usually in a browser tab or a narrow
  side window; widths range from a phone-sized sliver to a full desktop.
- A hub page lists every sheet; each sheet has search, section navigation, a
  placeholder toggle (tmux prefix, nvim leader) and the entry list.
- Keyboard flow on a sheet: `/` focuses search, arrow keys move the selection
  (up/down through the list, left/right to the entry beside it), `Enter` copies
  a command, `Esc` clears.
- Content is authored as one typed data file per tool (`src/data/<tool>.ts`) and
  registered in `src/data/index.ts`. The Neovim sheet is curated from the
  author's dotfiles.

## Capabilities and Constraints

- **Static only.** A fully static site (Next.js static export). No server,
  accounts or backend.
- **Keyboard-first.** Everything important must be doable without the mouse.
- **Mirrors the dotfiles.** Entries reflect the author's real config; do not
  pad sheets with generic defaults.
- **More tools are coming.** Today there are two sheets (tmux, nvim). Adding a
  tool must stay a small data-only change, and the hub and sheet UI must scale
  past two sheets.
- Entries are either key bindings or commands. Only commands (`cmd` / `copy`)
  are copyable; a plain key binding has no copy action.
- Key labels are never text-selectable, so selecting a region of the page does
  not pick them up. Descriptions and commands select normally.
- On a sheet page only the entry list scrolls; the page itself does not.
- Terminology: "sheet" (one tool's cheatsheet), "section" (a group of entries),
  "entry" (one binding or command), "placeholder" (prefix / leader toggle).
- Undecided: deployment. The site was previously served by GitHub Pages from
  the repo root; no deploy is wired up for the static export yet.

## Brand Commitments

- Name: machete, always lowercase.
- Copy is terse and lowercase-leaning, in the register of a CLI tool.

## Evidence on Hand

- Real content: 62 tmux entries in 6 sections (`src/data/tmux.ts`) and 58 nvim
  entries in 9 sections (`src/data/nvim.ts`).
- No users, testimonials, metrics or press exist; future work must not invent
  any.

## Product Principles

1. Speed to answer beats everything: the entry you need should be reachable in
   a few keystrokes.
2. The author's real setup is the source of truth, not the tool's defaults.
3. Hands stay on the keyboard.
4. Adding a tool is a data change, never a UI project.
5. It is a reference, not a tutorial: show the binding, skip the explanation.
