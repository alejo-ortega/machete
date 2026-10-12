import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SheetView } from "@/components/sheet-view";
import { getSheet, sheets } from "@/data";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return sheets.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sheet = getSheet((await params).id);
  if (!sheet) return {};
  return { title: `${sheet.name} cheatsheet — machete`, description: sheet.tagline };
}

export default async function SheetPage({ params }: Props) {
  const sheet = getSheet((await params).id);
  if (!sheet) notFound();
  return <SheetView sheet={sheet} sheets={sheets.map(({ id, name }) => ({ id, name }))} />;
}
