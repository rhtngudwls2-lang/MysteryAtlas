import { SearchView } from "@/components/SearchView";
import type { Locale } from "@/content/schema";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale as Locale; return pageMetadata(locale, "/search", locale === "en" ? "Search" : "검색"); }
export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  return <div className="page-shell"><header className="page-intro compact"><p className="kicker">SEARCH THE ARCHIVE</p><h1>{locale === "en" ? "Find the thread" : "단서를 찾으세요"}</h1><p>{locale === "en" ? "Titles, aliases, tags, people, places, dates and categories are indexed locally." : "제목, 별칭, 태그, 인물, 장소, 날짜, 카테고리를 기기에서 검색합니다."}</p></header><SearchView locale={locale}/></div>;
}
