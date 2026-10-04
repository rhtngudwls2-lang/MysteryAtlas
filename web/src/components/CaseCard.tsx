"use client";

import Image from "next/image";
import { isLaunchVisualExcluded } from "@/lib/launch-visual-exclusions";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CaseRecord, Locale } from "@/content/schema";
import { trackEvent } from "@/lib/analytics";
import { readingMinutes } from "@/lib/reading-time";
import { categories } from "@/content";
import { assetUrl } from "@/lib/base-path";
import { editorialPhoto, editorialPhotoRecord } from "@/content/editorial-media";
import recommendations from "../../../shared/editorial/home-recommendations.json";

export function CaseCard({ record, locale, compact = false }: { record: CaseRecord; locale: Locale; compact?: boolean }) {
  const photo = editorialPhotoRecord(record.slug, compact ? "RELATED" : "THUMBNAIL");
  const image = editorialPhoto(record.slug, compact ? "RELATED" : "THUMBNAIL") ?? record.images.find((item) => item.role === (compact ? "RELATED" : "THUMBNAIL")) ?? record.images.find((item) => item.role === "HERO");
  const imagePath = image?.type === "HISTORICAL_MATERIAL" || (photo && image?.type === "EXTERNAL_REVIEWED_PHOTOGRAPH") ? image?.localizedPaths?.[locale] ?? image?.path : undefined;
  const copy = recommendations.cards.find(item => item.caseId === record.slug);
  const displayTitle = locale === "ko" && copy ? copy.titleKo : record.displayTitle?.[locale] ?? record.title;
  const subtitle = locale === "ko" && copy ? copy.hookKo : record.subtitle[locale];
  const genre = locale === "ko" && copy ? copy.readerTopicKo : categories.find((category) => category.id === record.categories[0])?.name[locale];
  const country = locale === "ko" && /[A-Za-z]/.test(record.country[locale]) ? undefined : record.country[locale];
  const year = locale === "ko" && /[A-Za-z]/.test(record.year) ? undefined : record.year;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { trackEvent({ name: "card_impression", caseId: record.slug, locale }); observer.disconnect(); } }, { threshold: .45 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [record.slug, locale]);
  return <article ref={ref} className={`case-card${compact ? " compact" : ""}`} data-case={record.slug} data-media-slot={record.slug} data-cover-state={imagePath ? "available" : "awaiting-reviewed-photo"}>
    {imagePath && !isLaunchVisualExcluded(imagePath) && <figure className={photo?.derivative ? "card-photo" : undefined} data-asset-kind={photo?.assetKind} aria-describedby={photo?.derivative ? `photo-caption-${record.slug}` : undefined}>
      <Link className="card-image" href={`/${locale}/cases/${record.slug}/`} aria-label={displayTitle} onClick={() => trackEvent({ name: "case_open", caseId: record.slug, locale })}>
        <Image src={assetUrl(imagePath)} alt={photo?.alt[locale] ?? ""} width={photo?.width ?? 600} height={photo?.height ?? 400} sizes={compact ? "120px" : "(max-width: 760px) 92vw, 30vw"}/>
      </Link>

    </figure>}
    <div className="card-body">
      {!copy && <div className="eyebrow">{genre && <span>{genre}</span>}{!copy && country && <span>{country}</span>}{!copy && year && <span>{year}</span>}</div>}
      <h3><Link href={`/${locale}/cases/${record.slug}/`} onClick={() => trackEvent({ name: "case_open", caseId: record.slug, locale })}>{displayTitle}</Link></h3>
      <p>{subtitle}</p>
      {copy && genre && <div className="eyebrow"><span>{genre}</span></div>}
      <div className="card-footer-meta"><span>{readingMinutes(record, locale)} {locale === "en" ? "min read" : "분 읽기"}</span>{!compact && !copy && <span className="status-label">{record.status[locale]}</span>}</div>
    </div>
      {photo?.derivative && <div className="card-photo-meta" id={`photo-caption-${record.slug}`}><p>{photo.caption[locale]}</p><p className="photo-credit">{photo.rights.creditShort}</p><details className="card-photo-rights"><summary>{locale === "ko" ? "사진 출처" : "Photo source"}</summary>
        <p>{photo.notDepicted?.[locale]}</p><p>{photo.rights.credit}</p>
        <p>{photo.derivative.modificationNotice[locale]}</p>
        {photo.rights.shareAlikeRequired && <p>{locale === "ko" ? `이 파생 사진도 ${photo.derivative.license}로 제공합니다. 사진을 변형해 공유할 때 같은 ShareAlike 조건을 유지해야 합니다.` : `This derivative photograph is offered under ${photo.derivative.license}; adaptations must preserve its ShareAlike terms.`}</p>}
        {!photo.rights.shareAlikeRequired && <p>{locale === "ko" ? "기사 편집용 사진입니다. NASA의 후원·보증을 뜻하지 않으며 광고·상품·브랜드 홍보 허가를 포함하지 않습니다." : "Editorial use; this does not imply NASA endorsement or permission for advertising, merchandise or brand promotion."}</p>}
        <a href={photo.rights.sourcePage} target="_blank" rel="noreferrer">{locale === "ko" ? "원문과 저작자 기록" : "Source and author"} ↗</a>{" · "}
        <a href={photo.rights.licenseUrl} target="_blank" rel="noreferrer">{photo.rights.shareAlikeRequired ? photo.rights.license : locale === "ko" ? "NASA 사진 이용 안내" : "NASA media guidance"} ↗</a>
        {photo.rights.sourceRevisionPage && <p><a href={photo.rights.sourceRevisionPage} target="_blank" rel="noreferrer">{locale === "ko" ? "제공된 원문 판 기록" : "Supplied source revision"} ↗</a></p>}
      </details></div>}
  </article>;
}
