import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseCard } from "@/components/CaseCard";
import { caseBySlug, collectionBySlug, collections, locales } from "@/content";
import type { Locale } from "@/content/schema";
import { pageMetadata } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return locales.flatMap((locale) => collections.map((collection) => ({ locale, slug: collection.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale: raw, slug } = await params; const locale = raw as Locale; const item = collectionBySlug(slug); return item ? pageMetadata(locale, `/collections/${slug}`, item.title[locale], item.description[locale]) : {}; }
export default async function CollectionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params; const locale = raw as Locale; const collection = collectionBySlug(slug); if (!collection) notFound();
  const records = collection.caseSlugs.map(caseBySlug).filter(Boolean);
  return <div className="page-shell"><header className="page-intro"><p className="kicker">COLLECTION / {String(records.length).padStart(2, "0")} CASES</p><h1>{collection.title[locale]}</h1><p>{collection.description[locale]}</p></header><div className="case-grid">{records.map((record) => record && <CaseCard key={record.slug} record={record} locale={locale}/>)}</div></div>;
}
