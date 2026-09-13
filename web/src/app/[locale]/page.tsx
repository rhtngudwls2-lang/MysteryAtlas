import Link from "next/link";
import { CaseCard } from "@/components/CaseCard";
import { cases, collections } from "@/content";
import type { Locale } from "@/content/schema";
import { readingMinutes } from "@/lib/reading-time";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const lead = cases.find((item) => item.slug === "cooper")!;
  const picks = ["rendlesham", "loch-ness", "voynich"].map((slug) => cases.find((item) => item.slug === slug)!);
  return <>
    <section className="home-hero">
      <div className="hero-copy"><p className="kicker">CASE FILE 01 / VERIFIED {lead.verifiedAt}</p><h1>{lead.title}</h1><p className="hero-question">{lead.subtitle[locale]}</p><p>{lead.preview[locale]}</p><div className="hero-meta"><span>{lead.country[locale]}</span><span>{lead.year}</span><span>{readingMinutes(lead, locale)} {locale === "en" ? "min read" : "분 읽기"}</span></div><Link className="primary-link" href={`/${locale}/cases/${lead.slug}/`}>{locale === "en" ? "Open the case" : "사건 열기"} <span>↗</span></Link></div>
      <div className="hero-art" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,9,12,.92), rgba(7,9,12,.05)), url(${lead.images[0].path})` }}><div className="hero-stamp">EDITORIAL<br/>RECONSTRUCTION<br/><small>NOT EVIDENCE</small></div></div>
    </section>
    <section className="page-section"><div className="section-heading"><div><p className="kicker">OPEN QUESTIONS</p><h2>{locale === "en" ? "Start with the evidence gap" : "근거가 비어 있는 지점에서 시작하세요"}</h2></div><Link href={`/${locale}/explore/`}>{locale === "en" ? "Explore all 9 cases" : "9개 사건 모두 보기"} →</Link></div><div className="case-grid">{picks.map((record) => <CaseCard key={record.slug} record={record} locale={locale}/>)}</div></section>
    <section className="page-section collection-strip"><p className="kicker">CURATED PATHS</p><div className="collection-grid">{collections.map((collection, index) => <Link key={collection.slug} href={`/${locale}/collections/${collection.slug}/`} className="collection-card"><span>0{index + 1}</span><h3>{collection.title[locale]}</h3><p>{collection.description[locale]}</p><b>{collection.caseSlugs.length} {locale === "en" ? "case files" : "개 사건"} →</b></Link>)}</div></section>
  </>;
}
