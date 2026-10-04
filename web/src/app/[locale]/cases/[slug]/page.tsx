import { RomanovArticleView } from "@/components/RomanovArticleView";
import { editorialPhoto } from "@/content/editorial-media";
import type { Metadata } from "next";
import { isLaunchVisualExcluded } from "@/lib/launch-visual-exclusions";
import { notFound } from "next/navigation";
import { CaseImage } from "@/components/CaseImage";
import { EvidenceCard } from "@/components/EvidenceCard";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { QuickPreview } from "@/components/QuickPreview";
import { ReactionControl } from "@/components/ReactionControl";
import { NarrativeImageFlow } from "@/components/NarrativeImageFlow";
import { RabbitHole } from "@/components/RabbitHole";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ReaderSettings } from "@/components/ReaderSettings";
import Link from "next/link";
import { caseBySlug, cases, categories, locales } from "@/content";
import type { Locale } from "@/content/schema";
import { readingMinutes } from "@/lib/reading-time";
import { absoluteUrl } from "@/lib/site";
import { getProductizedArticle, productizedIds } from "@/content/productized";
import { ProductizedArticleView } from "@/components/ProductizedArticleView";

export const dynamicParams = false;
export function generateStaticParams() { return locales.flatMap((locale) => cases.map((record) => ({ locale, slug: record.slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const record = caseBySlug(slug);
  if (!record) return {};
  const productized = productizedIds.has(slug) ? await getProductizedArticle(slug) : undefined;
  const title = productized?.localizedCopy[locale].headline ?? record.title;
  const description = productized?.localizedCopy[locale].hook ?? record.preview[locale];
  const canonical = absoluteUrl(`/${locale}/cases/${slug}/`);
  const image = editorialPhoto(slug) ?? record.images.find((item) => item.role === "HERO" && item.path);
  const imagePath = image?.localizedPaths?.[locale] ?? image?.path;
  const socialImage = absoluteUrl(imagePath && !isLaunchVisualExcluded(imagePath) ? imagePath : "/og-preview.png");
  return {
    title,
    description,
    alternates: { canonical, languages: { en: absoluteUrl(`/en/cases/${slug}/`), ko: absoluteUrl(`/ko/cases/${slug}/`) } },
    openGraph: { title, description, url: canonical, type: "article", images: [{ url: socialImage, alt: imagePath && !isLaunchVisualExcluded(imagePath) ? image?.alt[locale] ?? "Mystery Atlas" : "Mystery Atlas" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default async function CasePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const record = caseBySlug(slug);
  if (!record) notFound();
  if (productizedIds.has(slug)) {
    const article = await getProductizedArticle(slug);
    if (!article) notFound();
    const hero = article.visuals.find((visual) => visual.role === "HERO_CONTEXT") ?? article.visuals[0];
    const structuredData = {
      "@context": "https://schema.org", "@type": "Article", inLanguage: locale,
      headline: article.localizedCopy[locale].headline,
      description: article.localizedCopy[locale].hook,
      mainEntityOfPage: absoluteUrl(`/${locale}/cases/${slug}/`),
      image: editorialPhoto(slug)?.path ? [absoluteUrl(editorialPhoto(slug)!.path!)] : hero ? [absoluteUrl(`/media/${hero.localizedFiles[locale].fileName}`)] : [],
      isAccessibleForFree: true,
    };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>{slug === "romanov-remains-dna" ? <RomanovArticleView article={article} locale={locale}/> : <ProductizedArticleView article={article} locale={locale}/>}</>;
  }
  const hero = record.images.find((item) => item.role === "HERO")!;
  const genre = categories.find((item) => item.id === record.categories[0])?.name[locale];
  const structuredData = {
    "@context": "https://schema.org", "@type": "Article", inLanguage: locale,
    headline: record.title, description: record.preview[locale],
    mainEntityOfPage: absoluteUrl(`/${locale}/cases/${slug}/`),
    image: [absoluteUrl(hero.path ?? "/og-preview.png")],
    isAccessibleForFree: true,
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/><article className="case-page">
    <div className="article-toolbar"><div className="article-toolbar-inner">
      <Link className="article-back" href={`/${locale}/explore/`}>← <span>{locale === "en" ? "Explore" : "탐색"}</span></Link>
      <span className="article-toolbar-title" title={record.title}>{record.title}</span>
      <LocaleSwitch locale={locale} article/>
      <ReaderSettings locale={locale}/>
      <ShareButton locale={locale} title={record.title}/>
    </div></div>
    <header className="case-hero">
      <div className="case-hero-copy"><div className="eyebrow">{genre && <span>{genre}</span>}<span>{record.status[locale]}</span><span>{record.country[locale]}</span></div><h1>{record.title}</h1><p className="case-subtitle">{record.subtitle[locale]}</p><div className="verification-line"><span>{record.year}</span><span>{readingMinutes(record, locale)} {locale === "en" ? "min read" : "분 읽기"}</span><span>{locale === "en" ? "Last verified" : "마지막 검증"}: {record.verifiedAt}</span></div></div>
      {hero.path && <CaseImage image={hero} locale={locale} priority/>}
      <div className="hero-foot"><QuickPreview caseId={record.slug} locale={locale}><p className="case-preview">{record.preview[locale]}</p></QuickPreview><SaveButton slug={record.slug} locale={locale}/></div>
    </header>
    <div className="article-layout">
      <aside className="case-index"><span>{locale === "en" ? "IN THIS STORY" : "이야기의 흐름"}</span><a href="#narrative">{locale === "en" ? "Story" : "이야기"}</a><a href="#evidence">{locale === "en" ? "Evidence" : "근거"}</a><a href="#fact-boundary">{locale === "en" ? "Fact boundary" : "확인된 범위"}</a><a href="#sources">{locale === "en" ? "Sources" : "출처"}</a><a href="#rabbit-hole">Rabbit Hole</a></aside>
      <div className="article-main">
        <section id="narrative" className="narrative"><p className="section-number">01 / {locale === "en" ? "STORY" : "이야기"}</p>{record.narrative.map((section, position) => <section key={section.id} id={`block-${section.id}`} className="narrative-chapter"><h2>{section.title[locale]}</h2>{section.body[locale].split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.imageIds?.map((imageId) => { const image = record.images.find((item) => item.id === imageId && item.path); return image ? <CaseImage key={imageId} image={image} locale={locale}/> : null; })}{position === 3 && <NarrativeImageFlow record={record} locale={locale}/>}</section>)}</section>
        <section id="evidence" className="evidence-section"><div className="section-title"><p className="section-number">02 / {locale === "en" ? "EVIDENCE" : "근거"}</p><h2>{locale === "en" ? "What the record supports" : "기록이 뒷받침하는 범위"}</h2><p>{locale === "en" ? "Open a claim to inspect its context, counterevidence and sources." : "주장을 열어 그 배경과 반론, 출처를 확인할 수 있습니다."}</p></div>{record.claims.map((claim) => <EvidenceCard key={claim.id} claim={claim} locale={locale} caseId={record.slug}/>)}</section>
        <section id="fact-boundary" className="fact-boundary"><p className="section-number">03 / {locale === "en" ? "FACT BOUNDARY" : "확인된 범위"}</p><h2>{locale === "en" ? "What we can and cannot say" : "확인된 것과 남은 질문"}</h2><p>{locale === "en" ? "These boundaries refer to the cited records, not the case as a whole." : "아래 판단은 인용한 자료의 범위에 한정됩니다."}</p><div className="fact-columns"><div><h3>{locale === "en" ? "The records establish" : "자료가 확인하는 것"}</h3>{record.claims.slice(0, 2).map((claim) => <p key={claim.id}>{claim.establishes[locale]}</p>)}</div><div><h3>{locale === "en" ? "The records do not establish" : "자료만으로 확인할 수 없는 것"}</h3>{record.claims.slice(0, 2).map((claim) => <p key={claim.id}>{claim.doesNotEstablish[locale]}</p>)}</div></div></section>
        <section id="sources" className="sources-section"><p className="section-number">04 / {locale === "en" ? "SOURCES" : "출처"}</p><h2>{locale === "en" ? "Source notes" : "자료와 출처"}</h2><ol>{record.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><span>{source.publisher} · {locale === "en" ? "accessed" : "확인"} {source.accessedAt} ↗</span></a></li>)}</ol></section>
        <section id="rabbit-hole" className="rabbit-section"><p className="section-number">05 / RABBIT HOLE</p><h2>{locale === "en" ? "Follow the next question" : "다음 질문으로 이어가기"}</h2><RabbitHole record={record} records={cases} locale={locale}/></section>
        <ReactionControl caseId={record.slug} locale={locale}/>
      </div>
    </div>
  </article></>;
}
