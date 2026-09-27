"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CaseRecord, Locale } from "@/content/schema";
import { trackEvent } from "@/lib/analytics";
import { readingMinutes } from "@/lib/reading-time";
import { categories } from "@/content";

export function CaseCard({ record, locale, compact = false }: { record: CaseRecord; locale: Locale; compact?: boolean }) {
  const image = record.images.find((item) => item.role === (compact ? "RELATED" : "THUMBNAIL")) ?? record.images.find((item) => item.role === "HERO");
  const genre = categories.find((category) => category.id === record.categories[0])?.name[locale];
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { trackEvent({ name: "card_impression", caseId: record.slug, locale }); observer.disconnect(); } }, { threshold: .45 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [record.slug, locale]);
  return <article ref={ref} className={`case-card${compact ? " compact" : ""}`} data-case={record.slug}>
    {image?.path && <Link className="card-image" href={`/${locale}/cases/${record.slug}/`} aria-label={record.title} onClick={() => trackEvent({ name: "case_open", caseId: record.slug, locale })}>
      <Image src={image.path} alt="" width={600} height={400} sizes={compact ? "120px" : "(max-width: 760px) 92vw, 30vw"}/>
    </Link>}
    <div className="card-body">
      <div className="eyebrow">{genre && <span>{genre}</span>}<span>{record.country[locale]}</span><span>{record.year}</span></div>
      <h3><Link href={`/${locale}/cases/${record.slug}/`} onClick={() => trackEvent({ name: "case_open", caseId: record.slug, locale })}>{record.title}</Link></h3>
      <p>{record.subtitle[locale]}</p>
      <div className="card-footer-meta"><span>{readingMinutes(record, locale)} {locale === "en" ? "min read" : "분 읽기"}</span>{!compact && <span className="status-label">{record.status[locale]}</span>}</div>
    </div>
  </article>;
}
