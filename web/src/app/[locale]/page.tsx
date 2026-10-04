import Image from "next/image";
import { photoRecord } from "@/content/editorial-media";
import draft from "../../../../shared/editorial/romanov-reader.json";
import recommendations from "../../../../shared/editorial/home-recommendations.json";
import Link from "next/link";
import { CaseCard } from "@/components/CaseCard";
import { cases, collections } from "@/content";
import type { Locale } from "@/content/schema";
import { readingMinutes } from "@/lib/reading-time";
import { getMarket } from "@/config/market";
import { assetUrl } from "@/lib/base-path";
import { ContinueReading } from "@/components/ContinueReading";
import { productizedItems } from "@/content/productized";

const readerCollections: Record<string, Record<Locale, { title: string; description: string }>> = {
  "documents-under-pressure": { ko: { title: "기록 속으로 한 걸음 더", description: "남겨진 기록을 따라 사건의 이야기를 읽어보세요." }, en: { title: "Stories behind the records", description: "Follow the records into the story." } },
  "evidence-changes-the-story": { ko: { title: "단서가 바꾼 이야기", description: "새로운 단서와 함께 달라진 이야기를 만나보세요." }, en: { title: "Clues that changed the story", description: "Read stories that changed as new clues emerged." } },
  "identity-without-an-answer": { ko: { title: "이름을 찾는 이야기", description: "오래 남은 물음과 그 뒤의 사람들을 만나보세요." }, en: { title: "The search for a name", description: "Meet the people behind lingering questions." } },
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const market = getMarket(locale);
  const lead = cases.find((item) => item.slug === "romanov-remains-dna") ?? cases[0];
  const picks = recommendations.caseIds.map((slug) => cases.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <>
    <ContinueReading locale={locale} items={productizedItems}/>
    <section className="home-hero">
      <div className="hero-copy">
        <p className="kicker">{locale === "en" ? "FEATURED STORY · PREVIEW" : `${recommendations.homeCopy.featuredLabelKo} · ${recommendations.homeCopy.previewStatus.textKo}`}</p>
        <h1>{locale === "ko" ? draft.cardTitle : "Why were two children missing from the Romanov grave?"}</h1>
        <p className="hero-question">{locale === "ko" ? draft.cardHook : "A second grave changed the family’s story. What did DNA reveal?"}</p>
        <div className="hero-meta"><span>{lead.country[locale]}</span><span>{lead.year}</span><span>{readingMinutes(lead, locale)} {locale === "en" ? "min read" : "분 읽기"}</span></div>
        <Link className="primary-link" href={`/${locale}/cases/${lead.slug}/`}>{locale === "en" ? "Read the story" : "이야기 읽기"} <span>↗</span></Link>
      </div>
      <figure className="hero-art abc-featured-photo"><Image src={assetUrl(`/editorial-media/${photoRecord.fileName}`)} alt={photoRecord.alt[locale]} width={photoRecord.width} height={photoRecord.height} sizes="(max-width: 780px) 100vw, 600px" priority/><figcaption>{locale === "ko" ? "1913년 가족사진 · 사건 이전의 역사 자료" : "The family in 1913 · a historical portrait before the killings"}</figcaption></figure>
    </section>
    <section className="page-section abc-home-content">
      <div className="section-heading"><div><p className="kicker">{locale === "en" ? "READ NEXT" : recommendations.homeCopy.recommendationSection.eyebrowKo}</p><h2>{locale === "en" ? "Which story will you read next?" : recommendations.homeCopy.recommendationSection.titleKo}</h2></div><Link href={`/${locale}/explore/`}>{locale === "en" ? `Explore all ${cases.length} stories` : recommendations.homeCopy.recommendationSection.browseAllKo} →</Link></div>
      <div className="case-grid">{picks.map((record) => <CaseCard key={record.slug} record={record} locale={locale}/>)}</div>
    </section>
    <section className="page-section collection-strip abc-home-collections">
      <p className="kicker">{locale === "en" ? "MORE STORIES TO EXPLORE" : recommendations.homeCopy.collections.sectionTitleKo}</p>
      <div className="collection-grid">{collections.filter((collection) => market.featuredCollections.includes(collection.slug)).map((collection, index) => {
        const provided = recommendations.homeCopy.collections.items.find(item => item.slug === collection.slug);
        const copy = locale === "ko" && provided ? { title: provided.titleKo, description: provided.descriptionKo } : readerCollections[collection.slug]?.[locale];
        return <Link key={collection.slug} href={`/${locale}/collections/${collection.slug}/`} className="collection-card"><span>0{index + 1}</span><h3>{copy?.title ?? collection.title[locale]}</h3><p>{copy?.description ?? collection.description[locale]}</p><b>{collection.caseSlugs.length} {locale === "en" ? "stories" : "개 이야기"} →</b></Link>;
      })}</div>
    </section>
  </>;
}
