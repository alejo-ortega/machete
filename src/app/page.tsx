import { arrows } from "@/components/arrow-keys";
import { Logo } from "@/components/logo";
import { KeyHint, StatusBar } from "@/components/status-bar";
import { ToolGrid, type ToolSummary } from "@/components/tool-card";
import { countEntries, sheets } from "@/data";
import { buildKeys } from "@/lib/keys";

const SOURCE_URL = "https://github.com/alejo-ortega/machete";

export default function HubPage() {
  const tools: ToolSummary[] = sheets.map((sheet) => {
    const ph = sheet.placeholder ?? null;
    const phValue = ph ? (ph.default ?? ph.values[0]) : null;
    return {
      id: sheet.id,
      name: sheet.name,
      tagline: sheet.tagline ?? "",
      entries: countEntries(sheet),
      sections: sheet.sections.length,
      // First key binding of each of the first three sections.
      preview: sheet.sections
        .map((sec) => sec.items.find((item) => item.type !== "command"))
        .filter((item) => item !== undefined)
        .slice(0, 3)
        .map((item) => buildKeys({ keys: Array.isArray(item.keys) ? item.keys[0] : item.keys }, ph, phValue)),
    };
  });
  const total = tools.reduce((acc, t) => acc + t.entries, 0);

  return (
    <>
      <div className="mx-auto w-full max-w-[1240px] px-4 pb-24 sm:px-6">
        <header className="pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="flex items-center gap-3">
            <Logo className="size-7" />
            <h1 className="flex items-center text-xl font-semibold tracking-tight">
              machete
              <span aria-hidden className="ml-1.5 inline-block h-7 w-3 animate-caret bg-accent" />
            </h1>
          </div>
          <p className="mt-5 max-w-[62ch] text-pretty text-base text-muted">
            Cheatsheets for the tools I use, written from my own config. Pick one and start typing.
          </p>
        </header>

        <main>
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3 text-xs text-faint">
            <h2 className="font-normal">
              <span aria-hidden className="mr-2 select-none text-ghost">
                $
              </span>
              ls cheatsheets
            </h2>
            <span>
              {tools.length} sheets, {total} entries
            </span>
          </div>
          <ToolGrid tools={tools} />
        </main>
      </div>

      <StatusBar
        left={
          <span className="flex items-center gap-4">
            <KeyHint keys={tools.length > 1 ? ["1", `${Math.min(tools.length, 9)}`] : ["1"]} label="open a sheet" className="pointer-coarse:hidden" />
            <KeyHint keys={[arrows.up, arrows.down]} label="move" className="hidden sm:flex pointer-coarse:hidden" />
            <span className="hidden pointer-coarse:inline">tap a sheet to open it</span>
          </span>
        }
        right={
          <a
            href={SOURCE_URL}
            className="-mr-2 flex h-7 items-center rounded-sm px-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg pointer-coarse:h-9"
          >
            source
          </a>
        }
      />
    </>
  );
}
