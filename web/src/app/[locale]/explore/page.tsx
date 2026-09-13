import { CaseCard } from "@/components/CaseCard";
import { cases, categories } from "@/content";
import type { Locale } from "@/content/schema";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale as Locale; return pageMetadata(locale, "/explore", locale === "en" ? "Explore" : "탐색"); }
export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  return <div className="page-shell"><header className="page-intro"><p className="kicker">THE INDEX / 09 FILES</p><h1>{locale === "en" ? "Explore the unexplained" : "미해결의 기록을 탐색하세요"}</h1><p>{locale === "en" ? "Nine curated cases. No popularity counters, fake live signals, or certainty scores." : "엄선된 9개 사건. 인기 수치, 가짜 실시간 표시, 신뢰도 점수를 만들지 않습니다."}</p></header><div className="category-row" aria-label={locale === "en" ? "Available categories" : "카테고리"}>{categories.map((category) => <span key={category.id}>{category.name[locale]}</span>)}</div><div className="case-grid">{cases.map((record) => <CaseCard key={record.slug} record={record} locale={locale}/>)}</div></div>;
}
