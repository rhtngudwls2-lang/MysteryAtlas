import Image from "next/image";
import Link from "next/link";
import { LocaleSwitch } from "./LocaleSwitch";
import { ReaderSettings } from "./ReaderSettings";
import { ShareButton } from "./ShareButton";
import { ReadingProgressTracker } from "./ReadingProgressTracker";
import { cases } from "@/content";
import { productizedItems, type ProductizedArticle, type ProductizedBlock, type ProductizedVisual } from "@/content/productized";
import type { Locale } from "@/content/schema";
import { assetUrl } from "@/lib/base-path";

function richText(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) => i % 2 ? <strong key={i}>{part}</strong> : part);
}

function paragraphs(text: string) {
  return text.split(/\n\s*\n/).filter(Boolean).map((part, i) => <p key={i}>{richText(part)}</p>);
}

function ProductVisual({ article, visual, locale, hero = false }: { article: ProductizedArticle; visual: ProductizedVisual; locale: Locale; hero?: boolean }) {
  const variant = visual.localizedFiles[locale];
  const src = assetUrl(`/media/${variant.fileName}`);
  const label = visual.isReconstruction
    ? locale === "ko" ? "자체 제작 재구성 · 증거 사진 아님" : "Project reconstruction · not an evidence photo"
    : locale === "ko" ? "자체 제작 맥락 그래픽 · 증거 사진 아님" : "Project original context graphic · not an evidence photo";
  const sources = article.sources.filter((source) => visual.sourceRefs.includes(source.sourceId));
  return <figure className={`case-image u2-visual${hero ? " u2-hero-visual" : ""}`} data-visual-role={visual.role}>
    <a href={src} target="_blank" rel="noreferrer" aria-label={locale === "ko" ? "이미지 크게 보기" : "Open larger image"}>
      <Image src={src} alt={locale === "ko" ? visual.altKo : visual.altEn} width={variant.width} height={variant.height} sizes={hero ? "(max-width: 780px) 100vw, 960px" : "(max-width: 780px) 100vw, 740px"} priority={hero}/>
    </a>
    <figcaption><span className="image-type">{label}</span><span>{locale === "ko" ? visual.captionKo : visual.captionEn}</span>
      <details className="image-provenance"><summary>{locale === "ko" ? "도표 근거 자료" : "Graphic source notes"}</summary>
        <small>{sources.map((source) => <span key={source.sourceId}>{source.publisher} · {source.title}<br/></span>)}</small>
      </details>
    </figcaption>
  </figure>;
}

const statusKo: Record<string, string> = {
  CONFIRMED: "확인됨", SUPPORTED: "자료로 뒷받침됨", DISPUTED: "논쟁 중", UNVERIFIED: "미확인",
  REFUTED: "반박됨", NOT_ESTABLISHED: "입증되지 않음", CLAIM: "주장", ALLEGED: "주장됨",
};

function ProductClaim({ claim, article, locale }: { claim: ProductizedArticle["claims"][number]; article: ProductizedArticle; locale: Locale }) {
  const sources = article.sources.filter((item) => claim.sourceRefs.includes(item.sourceId));
  return <article className="evidence-card" data-status={claim.status} id={`claim-${claim.claimId}`}>
    <header><span className="evidence-label">{locale === "ko" ? "근거 기록" : "Evidence note"}</span><span className="evidence-status">{locale === "ko" ? statusKo[claim.status] ?? claim.status : claim.status.replaceAll("_", " ")}</span></header>
    <h3>{locale === "ko" ? claim.statementKo : claim.statementEn}</h3>
    <details className="claim-detail"><summary>{locale === "ko" ? "연결된 원자료와 판단 범위" : "Linked sources and limits"}</summary>
      <p className="evidence-limit">{locale === "ko" ? "이 문서들이 확인하지 않는 범위와 반대 설명은 아래 ‘확인된 범위’와 반론 문단에서 따로 읽을 수 있습니다." : "Read the fact boundary and counterarguments separately for claims these sources do not settle."}</p>
      <ul>{sources.map((source) => <li key={source.sourceId}><a href={`#source-${source.sourceId}`}>{source.publisher} · {source.title}</a></li>)}</ul>
    </details>
  </article>;
}

function StoryBlock({ block, locale, label }: { block: ProductizedBlock; locale: Locale; label?: string }) {
  return <section className="narrative-chapter" id={`block-${block.blockId}`}>
    {label && <p className="section-number">{label}</p>}
    <h2>{locale === "ko" ? block.headingKo : block.headingEn}</h2>
    {paragraphs(locale === "ko" ? block.textKo : block.textEn)}
  </section>;
}

function RelatedStories({ article, locale }: { article: ProductizedArticle; locale: Locale }) {
  const known = new Set(cases.map((item) => item.slug));
  const supplied = article.metadata.relatedCases.filter((slug) => known.has(slug));
  const discovery = productizedItems.filter((item) => item.genre === article.metadata.primaryGenre && item.canonicalId !== article.canonicalId).map((item) => item.canonicalId);
  const slugs = [...new Set([...supplied, ...discovery])].slice(0, 3);
  return <div className="rabbit-grid">{slugs.map((slug) => {
    const item = cases.find((candidate) => candidate.slug === slug);
    return item ? <Link key={slug} href={`/${locale}/cases/${slug}/`}><small>{locale === "ko" ? "같은 주제의 다른 기록" : "Another story in this topic"}</small><span>{item.subtitle[locale]}</span><strong>{item.displayTitle?.[locale] ?? item.title} →</strong></Link> : null;
  })}</div>;
}

export function ProductizedArticleView({ article, locale }: { article: ProductizedArticle; locale: Locale }) {
  const title = locale === "ko" ? article.identity.canonicalTitleKo : article.identity.canonicalTitleEn;
  const copy = article.localizedCopy[locale];
  const hero = article.visuals.find((v) => v.role === "HERO_CONTEXT") ?? article.visuals[0];
  const inlines = article.visuals.filter((v) => v !== hero);
  const story = copy.blocks.filter((block) => block.type !== "FACT_BOUNDARY" && block.type !== "AFTERMATH");
  const boundary = copy.blocks.filter((block) => block.type === "FACT_BOUNDARY");
  const aftermath = copy.blocks.filter((block) => block.type === "AFTERMATH");
  const visualSlots = inlines.map((_, i) => Math.max(0, Math.min(story.length - 1, Math.floor((i + 1) * story.length / (inlines.length + 1)))));
  const country = article.metadata.countries.join(", ");
  return <article className="case-page productized-page" data-canonical-id={article.canonicalId}>
    <ReadingProgressTracker canonicalId={article.canonicalId} locale={locale}/>
    <div className="article-toolbar"><div className="article-toolbar-inner">
      <Link className="article-back" href={`/${locale}/explore/`}>← <span>{locale === "ko" ? "탐색" : "Explore"}</span></Link>
      <span className="article-toolbar-title" title={title}>{title}</span><LocaleSwitch locale={locale} article/><ReaderSettings locale={locale}/><ShareButton locale={locale} title={copy.headline}/>
    </div></div>
    <header className="case-hero">
      <div className="case-hero-copy">
        <p className="kicker">{locale === "ko" ? "연구 미리보기 · 출시 전 검증 중" : "Research preview · release review pending"}</p>
        <div className="eyebrow"><span>{article.metadata.primaryGenre}</span><span>{country}</span><span>{article.metadata.era}</span></div>
        <p className="u2-case-title">{title}</p><h1>{copy.headline}</h1><p className="case-subtitle">{copy.hook}</p>
        <div className="verification-line"><span>{article.metadata.dateRange.start ?? article.metadata.era}</span><span>{locale === "ko" ? "근거와 출처 포함" : "Evidence and sources included"}</span></div>
      </div>
      <ProductVisual article={article} visual={hero} locale={locale} hero/>
    </header>
    <div className="article-layout">
      <aside className="case-index"><span>{locale === "ko" ? "이야기의 흐름" : "IN THIS STORY"}</span><a href="#narrative">{locale === "ko" ? "이야기" : "Story"}</a><a href="#evidence">{locale === "ko" ? "근거" : "Evidence"}</a><a href="#fact-boundary">{locale === "ko" ? "확인된 범위" : "Fact boundary"}</a><a href="#sources">{locale === "ko" ? "출처" : "Sources"}</a><a href="#rabbit-hole">Rabbit Hole</a></aside>
      <div className="article-main">
        <section id="narrative" className="narrative"><p className="section-number">01 / {locale === "ko" ? "이야기" : "STORY"}</p>
          {story.map((block, i) => <div key={block.blockId}><StoryBlock block={block} locale={locale}/>
            {inlines.map((visual, j) => visualSlots[j] === i ? <ProductVisual key={`${visual.assetId}-${j}`} article={article} visual={visual} locale={locale}/> : null)}
          </div>)}
        </section>
        <section id="evidence" className="evidence-section"><div className="section-title"><p className="section-number">02 / {locale === "ko" ? "근거" : "EVIDENCE"}</p>
          <h2>{locale === "ko" ? "기록이 뒷받침하는 주장" : "Claims the sources can support"}</h2>
          <p>{locale === "ko" ? "자료를 열어 주장과 연결된 출처를 확인하세요." : "Open each note to inspect its linked sources."}</p>
        </div>{article.claims.map((claim) => <ProductClaim key={claim.claimId} claim={claim} article={article} locale={locale}/>)}</section>
        <section id="fact-boundary" className="fact-boundary"><p className="section-number">03 / {locale === "ko" ? "확인된 범위" : "FACT BOUNDARY"}</p>
          <h2>{locale === "ko" ? "확인된 것과 남은 질문" : "What the record does and does not establish"}</h2>
          <div className="fact-columns"><div><h3>{locale === "ko" ? "자료가 확인하는 것" : "What the record establishes"}</h3>{paragraphs(copy.factBoundary.established)}</div><div><h3>{locale === "ko" ? "자료만으로 확인할 수 없는 것" : "What the record does not establish"}</h3>{paragraphs(copy.factBoundary.notEstablished)}</div></div>
          {boundary.map((block) => <div key={block.blockId} className="u2-fact-block"><StoryBlock block={block} locale={locale}/></div>)}
        </section>
        {aftermath.length > 0 && <section className="narrative u2-aftermath"><p className="section-number">04 / {locale === "ko" ? "그 후" : "AFTERMATH"}</p>{aftermath.map((block) => <StoryBlock key={block.blockId} block={block} locale={locale}/>)}</section>}
        <section id="sources" className="sources-section"><p className="section-number">05 / {locale === "ko" ? "출처" : "SOURCES"}</p><h2>{locale === "ko" ? "자료와 출처" : "Source notes"}</h2>
          <ol>{article.sources.map((source) => <li id={`source-${source.sourceId}`} key={source.sourceId}><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><span>{source.publisher} · {source.sourceType.replaceAll("_", " ")} ↗</span></a></li>)}</ol>
        </section>
        <section id="rabbit-hole" className="rabbit-section"><p className="section-number">06 / RABBIT HOLE</p><h2>{locale === "ko" ? "다음 질문으로 이어가기" : "Follow the next question"}</h2><RelatedStories article={article} locale={locale}/></section>
      </div>
    </div>
  </article>;
}
