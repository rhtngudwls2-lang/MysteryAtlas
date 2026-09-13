import { ExploreFilters } from "@/components/ExploreFilters";
import { cases, categories } from "@/content";
import type { Locale } from "@/content/schema";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale as Locale; return pageMetadata(locale, "/explore", locale === "en" ? "Explore" : "탐색"); }
export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  return <div className="page-shell"><header className="page-intro"><p className="kicker">THE INDEX / {cases.length} FILES</p><h1>{locale === "en" ? "Explore the unexplained" : "미해결의 기록을 탐색하세요"}</h1><p>{locale === "en" ? "Browse the current catalog by country or category. No popularity counters, fake live signals, or certainty scores." : "현재 카탈로그를 국가 또는 카테고리로 탐색하세요. 인기 수치, 가짜 실시간 표시, 신뢰도 점수를 만들지 않습니다."}</p></header><ExploreFilters records={cases} categories={categories} locale={locale}/></div>;
}
