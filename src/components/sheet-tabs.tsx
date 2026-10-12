import Link from "next/link";
import { cn } from "@/lib/cn";

export type SheetLink = { id: string; name: string };

/** Sheet switcher for the status bar. The current sheet carries the accent tick. */
export function SheetTabs({ sheets, current }: { sheets: SheetLink[]; current?: string }) {
  return (
    <nav aria-label="Sheets" className="no-scrollbar -ml-2.5 flex min-w-0 items-stretch overflow-x-auto">
      {sheets.map((s) => {
        const on = s.id === current;
        return (
          <Link
            key={s.id}
            href={`/cheatsheets/${s.id}`}
            aria-current={on ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center px-2.5 transition-colors duration-150 focus-visible:outline-offset-[-2px]",
              on ? "font-medium text-fg" : "hover:text-fg",
            )}
          >
            {on && <span aria-hidden className="absolute inset-x-2.5 -top-px h-0.5 rounded-full bg-accent" />}
            {s.name}
          </Link>
        );
      })}
    </nav>
  );
}
