import type { EvidenceClaim, Locale } from "@/content/schema";
import { copy } from "@/lib/copy";

export function EvidenceCard({ claim, locale }: { claim: EvidenceClaim; locale: Locale }) {
  const c = copy(locale);
  return <article className="evidence-card" id={claim.id} data-status={claim.status}>
    <header><span className="claim-id">{claim.id}</span><span className={`evidence-status status-${claim.status.toLowerCase()}`}>{claim.status}</span></header>
    {claim.statusQualifier && <p className="qualifier">{claim.statusQualifier[locale]}</p>}
    <h3>{claim.claim[locale]}</h3>
    <p className="reason">{claim.reason[locale]}</p>
    <dl className="evidence-grid">
      <div><dt>{c.establishes}</dt><dd>{claim.establishes[locale]}</dd></div>
      <div><dt>{c.notEstablish}</dt><dd>{claim.doesNotEstablish[locale]}</dd></div>
      <div className="counter-cell"><dt>{c.counter}</dt><dd>{claim.counterEvidence[locale]}</dd></div>
    </dl>
    <div className="source-block">
      <div><span>{claim.sourceType[locale]}</span><span>{claim.sourceDate}</span></div>
      <a href={claim.source.url} rel="noreferrer" target="_blank">{claim.source.title} ↗</a>
      {claim.counterSource && <a href={claim.counterSource.url} rel="noreferrer" target="_blank">{locale === "en" ? "Counter-source" : "반대 출처"}: {claim.counterSource.title} ↗</a>}
    </div>
    <footer><span>{c.verified}: {claim.lastVerified}</span><details><summary>{c.history}</summary>{claim.changeHistory.map((item) => <p key={`${item.date}-${item.note.en}`}>{item.date} — {item.note[locale]}</p>)}</details></footer>
  </article>;
}
