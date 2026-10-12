import type { Metadata } from "next";
import Link from "next/link";
import { Kbd } from "@/components/kbd";

export const metadata: Metadata = { title: "not found — machete" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Kbd>404</Kbd>
      <h1 className="mt-6 text-lg font-semibold tracking-tight">No such sheet</h1>
      <p className="mt-2 text-muted">That page isn&apos;t in the toolbox.</p>
      <Link
        href="/"
        className="mt-8 flex h-9 items-center rounded-sm border border-line-strong bg-raised px-4 text-xs shadow-panel transition-colors duration-150 hover:border-accent/40 hover:text-accent"
      >
        back to machete
      </Link>
    </main>
  );
}
