import { SavedView } from "@/components/SavedView";
import type { Locale } from "@/content/schema";
import { pageMetadata } from "@/lib/site";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale as Locale; return pageMetadata(locale, "/saved", locale === "en" ? "Saved" : "저장됨"); }
export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale as Locale; return <div className="page-shell"><header className="page-intro"><p className="kicker">YOUR CASE FILE</p><h1>{locale === "en" ? "Saved investigations" : "저장한 사건"}</h1><p>{locale === "en" ? "Stored only in this browser. No account or cloud sync." : "이 브라우저에만 저장됩니다. 계정이나 클라우드 동기화는 없습니다."}</p></header><SavedView locale={locale}/></div>; }
