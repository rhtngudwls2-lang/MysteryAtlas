import Link from "next/link";
import { collections } from "@/content";
import type { Locale } from "@/content/schema";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale as Locale; return pageMetadata(locale, "/collections", locale === "en" ? "Collections" : "컬렉션"); }
export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  return <div className="page-shell"><header className="page-intro"><p className="kicker">CURATED PATHS</p><h1>{locale === "en" ? "Collections built around a question" : "질문을 중심으로 엮은 컬렉션"}</h1><p>{locale === "en" ? "Move between cases by the kind of evidence problem they share—not by a claim of common cause." : "공통 원인을 주장하지 않고, 사건들이 공유하는 근거 문제를 따라 이동합니다."}</p></header><div className="collection-list">{collections.map((collection, index) => <Link key={collection.slug} href={`/${locale}/collections/${collection.slug}/`}><span className="collection-no">0{index + 1}</span><div><h2>{collection.title[locale]}</h2><p>{collection.description[locale]}</p></div><b>{collection.caseSlugs.length}<small>{locale === "en" ? "cases" : "사건"}</small></b></Link>)}</div></div>;
}
