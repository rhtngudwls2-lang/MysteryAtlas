import Image from "next/image";
import Link from "next/link";
import draft from "../../../shared/editorial/romanov-reader.json";
import anchors from "../../../shared/editorial/romanov-anchors.json";
import { photoRecord } from "@/content/editorial-media";
import type { ProductizedArticle } from "@/content/productized";
import type { Locale } from "@/content/schema";
import { assetUrl } from "@/lib/base-path";
import { ArticleToolbar, ArticleContents, ArticleEnd } from "./ArticleNavigation";
import { ReadingProgressTracker } from "./ReadingProgressTracker";
import { ProductClaim } from "./ProductizedArticleView";

const mapping = anchors.old_to_new_block_anchors as Record<string, string>;
const textParagraphs = (text: string) => text.split(/\n\s*\n/).filter(Boolean).map((text, i) => <p key={i}>{text.replaceAll("**", "")}</p>);

export function RomanovArticleView({ article, locale }: { article: ProductizedArticle; locale: Locale }) {
  const original = article.localizedCopy[locale].blocks;
  const title = locale === "ko" ? draft.title : "Where were the two missing children?";
  const english = (id: string) => original.filter((block) => mapping[block.blockId] === id);
  const aliases = (id: string) => Object.entries(mapping).filter(([, target]) => target === id).map(([old]) => <span key={old} id={`block-${old}`} data-anchor-alias={id} className="anchor-alias"/>);
  const heading = (id: string, ko: string) => locale === "ko" ? ko : english(id)[0]?.headingEn ?? ko;
  const body = (id: string, ko: string) => locale === "ko" ? ko : english(id).map((block) => block.textEn).join("\n\n");
  const methodIds = new Set(Object.keys(mapping).filter((id) => mapping[id] === "methods-optional"));
  return <article className="case-page productized-page abc-reader" data-canonical-id={article.canonicalId}>
    <ReadingProgressTracker canonicalId={article.canonicalId} locale={locale}/>
    <ArticleToolbar id={article.canonicalId} title={title} locale={locale}/>
    <header className="abc-article-header"><p className="kicker">{locale === "ko" ? "역사 · 로마노프 가족" : "HISTORY · ROMANOV FAMILY"}</p><h1>{title}</h1>
      <p className="abc-read-meta">{locale === "ko" ? "DNA가 확인한 가족관계와 남은 역사적 질문" : "What DNA establishes, and what it leaves open"}</p>
    </header>
    <figure className="abc-article-photo"><Image src={assetUrl(`/editorial-media/${photoRecord.fileName}`)} alt={photoRecord.alt[locale]} width={photoRecord.width} height={photoRecord.height} sizes="(max-width: 780px) 100vw, 840px" priority/><figcaption>{photoRecord.caption[locale]}<details><summary>{locale === "ko" ? "사진 출처와 권리" : "Photo source and rights"}</summary><p>{photoRecord.rights.credit}</p><p>{locale === "ko" ? "Commons 파일 페이지의 러시아·미국 public domain 표기를 기록했습니다. 다른 지역의 적용은 확인하지 않았습니다." : "The Commons file page records public-domain status in Russia and the United States. Other jurisdictions have not been assessed."}</p><a href={photoRecord.rights.sourcePage} target="_blank" rel="noreferrer">Wikimedia Commons ↗</a></details></figcaption></figure>
    <div className="abc-article-intro"><p className="abc-deck">{locale === "ko" ? draft.subtitle : "A second grave, seventy metres away, changed the story of the Romanov family."}</p></div>
    <div className="abc-common-layout"><ArticleContents locale={locale}/><div className="abc-reading-column">
      <section id="narrative" className="narrative"><section id="block-intro" className="narrative-chapter abc-intro">{aliases("intro")}{textParagraphs(body("intro", draft.intro))}</section>
        {draft.sections.map((section) => <section key={section.id} id={`block-${section.id}`} className="narrative-chapter">{aliases(section.id)}<h2>{heading(section.id, section.title)}</h2>{textParagraphs(body(section.id, section.text))}</section>)}
      </section>
      <details id="methods-optional" className="abc-methods"><summary>{locale === "ko" ? draft.optionalMethods.label : "How did the DNA identification work?"}</summary><div id="block-methods-optional">{aliases("methods-optional")}{textParagraphs(body("methods-optional", draft.optionalMethods.text))}
        <details><summary>{locale === "ko" ? "기존 상세 검사 설명과 도표" : "Original detailed methods and graphics"}</summary>{original.filter((block) => methodIds.has(block.blockId)).map((block) => <section key={block.blockId}><h3>{locale === "ko" ? block.headingKo : block.headingEn}</h3>{textParagraphs(locale === "ko" ? block.textKo : block.textEn)}</section>)}
          {article.visuals.filter(visual => !["HERO_CONTEXT", "SOURCE_CONTEXT", "SOURCE_MAP"].includes(visual.role)).map((visual) => <figure key={visual.assetId}><Image src={assetUrl(`/media/${visual.localizedFiles[locale].fileName}`)} alt={locale === "ko" ? visual.altKo ?? visual.captionKo : visual.altEn ?? visual.captionEn} width={visual.localizedFiles[locale].width} height={visual.localizedFiles[locale].height}/><figcaption>{locale === "ko" ? visual.captionKo : visual.captionEn} · {locale === "ko" ? "자체 제작 설명 도표" : "Original explanatory graphic"}</figcaption></figure>)}
        </details></div></details>
      <section id="fact-boundary" className="abc-boundary"><div id="block-fact-boundary">{aliases("fact-boundary")}<h2>{locale === "ko" ? "확인된 것과 남은 질문" : "What is established, and what remains open"}</h2><h3>{locale === "ko" ? "확인된 것" : "Established"}</h3>{textParagraphs(locale === "ko" ? draft.factBoundary.established : article.localizedCopy.en.factBoundary?.established ?? body("fact-boundary", ""))}<h3>{locale === "ko" ? "확인되지 않은 것" : "Not established"}</h3>{textParagraphs(locale === "ko" ? draft.factBoundary.notEstablished : article.localizedCopy.en.factBoundary?.notEstablished ?? "See the original fact boundary above.")}</div></section>
      <details id="evidence" className="abc-methods evidence-section"><summary>{locale === "ko" ? "자세한 근거 펼치기" : "Detailed evidence"}</summary>{article.claims.map((claim) => <ProductClaim key={claim.claimId} claim={claim} article={article} locale={locale}/>)}</details>
      <details id="sources" className="abc-methods sources-section"><summary>{locale === "ko" ? "자료와 출처 펼치기" : "Sources"}</summary><ol>{article.sources.map((source) => <li key={source.sourceId} id={`source-${source.sourceId}`}><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><span>{source.publisher} ↗</span></a></li>)}</ol></details>
      <ArticleEnd locale={locale}><p>{locale === "ko" ? draft.nextStory.reason : "A different royal disappearance raises a different set of questions."}</p><Link href={`/${locale}/cases/${draft.nextStory.slug}/`}>{locale === "ko" ? draft.nextStory.label : "Read about the princes in the Tower"} →</Link></ArticleEnd>
    </div></div>
  </article>;
}
