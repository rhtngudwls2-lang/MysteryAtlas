import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseImage } from "@/components/CaseImage";
import { EvidenceCard } from "@/components/EvidenceCard";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { QuickPreview } from "@/components/QuickPreview";
import { ReactionControl } from "@/components/ReactionControl";
import { NarrativeImageFlow } from "@/components/NarrativeImageFlow";
import { RabbitHole } from "@/components/RabbitHole";
import { caseBySlug, cases, locales } from "@/content";
import type { Locale } from "@/content/schema";
import { readingMinutes } from "@/lib/reading-time";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return locales.flatMap((locale) => cases.map((record) => ({ locale, slug: record.slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const record = caseBySlug(slug);
  if (!record) return {};
  const canonical = absoluteUrl(`/${locale}/cases/${slug}/`);
  const image = record.images.find((item) => item.role === "HERO" && item.path);
  return {
    title: record.title,
    description: record.preview[locale],
    alternates: { canonical, languages: { en: absoluteUrl(`/en/cases/${slug}/`), ko: absoluteUrl(`/ko/cases/${slug}/`) } },
    openGraph: { title: record.title, description: record.preview[locale], url: canonical, type: "article", images: image?.path ? [{ url: absoluteUrl(image.path), alt: image.alt[locale] }] : [] },
  };
}

export default async function CasePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const record = caseBySlug(slug);
  if (!record) notFound();
  const hero = record.images.find((item) => item.role === "HERO")!;
  return <article className="case-page">
    <header className="case-hero">
      <div className="case-hero-copy"><div className="eyebrow"><span>{record.country[locale]}</span><span>{record.year}</span><span>{record.status[locale]}</span></div><h1>{record.title}</h1><p className="case-subtitle">{record.subtitle[locale]}</p><QuickPreview caseId={record.slug} locale={locale}><p className="case-preview">{record.preview[locale]}</p></QuickPreview><div className="case-actions"><SaveButton slug={record.slug} locale={locale}/><ShareButton locale={locale} title={record.title}/></div><div className="verification-line"><span>{readingMinutes(record, locale)} {locale === "en" ? "min read" : "분 읽기"}</span><span>{locale === "en" ? "Last verified" : "마지막 검증"}: {record.verifiedAt}</span></div></div>
      <CaseImage image={hero} locale={locale} priority/>
    </header>
    <div className="article-layout">
      <aside className="case-index"><span>{locale === "en" ? "IN THIS FILE" : "이 파일에서"}</span><a href="#narrative">{locale === "en" ? "Narrative" : "이야기"}</a><a href="#evidence">{locale === "en" ? `Evidence (${record.claims.length})` : `근거 (${record.claims.length})`}</a><a href="#sources">{locale === "en" ? "Sources" : "출처"}</a><a href="#rabbit-hole">Rabbit Hole</a></aside>
      <div className="article-main">
        <section id="narrative" className="narrative"><p className="section-number">01 / NARRATIVE</p>{record.narrative.map((section) => <section key={section.id}><h2>{section.title[locale]}</h2>{section.body[locale].split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>)}<NarrativeImageFlow record={record} locale={locale}/></section>
        <section id="evidence" className="evidence-section"><div className="section-title"><p className="section-number">02 / EVIDENCE FILE</p><h2>{locale === "en" ? "What the record supports" : "기록이 뒷받침하는 범위"}</h2><p>{locale === "en" ? "Statuses describe a scoped editorial judgment. They are not a single confidence ladder." : "상태는 범위를 한정한 편집 판단입니다. 하나의 신뢰도 서열이 아닙니다."}</p></div>{record.claims.map((claim) => <EvidenceCard key={claim.id} claim={claim} locale={locale} caseId={record.slug}/>)}</section>
        <section id="sources" className="sources-section"><p className="section-number">03 / SOURCES</p><h2>{locale === "en" ? "Source ledger" : "출처 원장"}</h2><ol>{record.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><span>{source.publisher} · {locale === "en" ? "accessed" : "확인"} {source.accessedAt} ↗</span></a></li>)}</ol></section>
        <section id="rabbit-hole" className="rabbit-section"><p className="section-number">04 / RABBIT HOLE</p><h2>{locale === "en" ? "Follow the question, not just the category" : "카테고리가 아니라 질문을 따라가세요"}</h2><RabbitHole record={record} records={cases} locale={locale}/></section>
        <ReactionControl caseId={record.slug} locale={locale}/>
      </div>
    </div>
  </article>;
}
