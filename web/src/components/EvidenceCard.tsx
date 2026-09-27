"use client";

import type { EvidenceClaim, Locale } from "@/content/schema";
import { copy } from "@/lib/copy";
import { trackEvent } from "@/lib/analytics";

const statusKo: Record<EvidenceClaim["status"], string> = {
  CONFIRMED: "확인됨", SUPPORTED: "뒷받침됨", DISPUTED: "다툼", ALLEGED: "주장됨",
  UNVERIFIED: "미확인", DEBUNKED: "반박됨", OUTDATED: "갱신 필요", CLAIM: "주장",
};

export function EvidenceCard({ claim, locale, caseId }: { claim: EvidenceClaim; locale: Locale; caseId: string }) {
  const c = copy(locale);
  return <article className="evidence-card" id={claim.id} data-status={claim.status}>
    <header><span className="evidence-label">{locale === "en" ? "Evidence note" : "근거 기록"}</span><span className={`evidence-status status-${claim.status.toLowerCase()}`}>{claim.statusQualifier?.[locale] ?? (locale === "ko" ? statusKo[claim.status] : claim.status)}</span></header>
    <h3>{claim.claim[locale]}</h3>
    <p className="reason">{claim.reason[locale]}</p>
    <p className="evidence-limit"><strong>{c.notEstablish}</strong> {claim.doesNotEstablish[locale]}</p>
    <details className="claim-detail" onToggle={(event) => { if (event.currentTarget.open) trackEvent({ name: "evidence_interaction", caseId, locale, value: claim.id }); }}>
      <summary>{locale === "en" ? "Read the claim and sources" : "주장·반론·출처 자세히 보기"}</summary>
      <dl className="evidence-grid">
        <div><dt>{c.establishes}</dt><dd>{claim.establishes[locale]}</dd></div>
        <div><dt>{c.notEstablish}</dt><dd>{claim.doesNotEstablish[locale]}</dd></div>
        <div className="counter-cell"><dt>{c.counter}</dt><dd>{claim.counterEvidence[locale]}</dd></div>
      </dl>
      <div className="source-block">
        <div><span>{claim.sourceType[locale]}</span><span>{claim.sourceDate}</span></div>
        <a href={claim.source.url} rel="noreferrer" target="_blank" onClick={() => trackEvent({ name: "source_click", caseId, locale, value: claim.id })}>{claim.source.publisher && `${claim.source.publisher} · `}{claim.source.title} ↗</a>
        {claim.counterSource && <a href={claim.counterSource.url} rel="noreferrer" target="_blank" onClick={() => trackEvent({ name: "source_click", caseId, locale, value: `${claim.id}:counter` })}>{locale === "en" ? "Counter-source" : "반대 출처"}: {claim.counterSource.title} ↗</a>}
      </div>
      <footer><span>{c.verified}: {claim.lastVerified}</span><details><summary>{c.history}</summary>{claim.changeHistory.map((item) => <p key={`${item.date}-${item.note.en}`}>{item.date} — {item.note[locale]}</p>)}</details></footer>
    </details>
  </article>;
}
