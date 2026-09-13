"use client";

import Link from "next/link";
import type { CaseRecord, Locale, RelationType } from "@/content/schema";
import { trackEvent } from "@/lib/analytics";

const labels: Record<RelationType, { en: string; ko: string }> = {
  similar_case: { en: "Similar case", ko: "비슷한 사건" }, same_country: { en: "Same country", ko: "같은 나라" }, same_era: { en: "Same era", ko: "같은 시대" }, same_theme: { en: "Same theme", ko: "같은 주제" }, related_person: { en: "Related person", ko: "관련 인물" }, related_place: { en: "Related place", ko: "관련 장소" }, derived_conspiracy: { en: "Related conspiracy", ko: "관련 음모론" }, skeptical_explanation: { en: "Skeptical explanation", ko: "반대 설명·회의론" }, evidence_pattern: { en: "Evidence pattern", ko: "근거 패턴" }, question_based: { en: "Question connection", ko: "질문 연결" },
};

export function RabbitHole({ record, records, locale }: { record: CaseRecord; records: CaseRecord[]; locale: Locale }) {
  return <div className="rabbit-grid">{record.related.map((related) => {
    const target = records.find((item) => item.slug === related.slug);
    const type = related.relationType ?? "question_based";
    return target ? <Link key={`${type}-${related.slug}`} href={`/${locale}/cases/${related.slug}/`} onClick={() => trackEvent({ name: "rabbit_hole_click", caseId: record.slug, locale, value: `${type}:${related.slug}` })}>
      <small>{labels[type][locale]}</small><span>{related.question[locale]}</span>{related.context && <em>{related.context[locale]}</em>}<strong>{target.title} →</strong>
    </Link> : null;
  })}</div>;
}
