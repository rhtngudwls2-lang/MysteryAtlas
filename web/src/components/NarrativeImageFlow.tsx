import type { CaseRecord, Locale } from "@/content/schema";

export function NarrativeImageFlow({ record, locale }: { record: CaseRecord; locale: Locale }) {
  const beats = (record.visualSequence ?? []).filter((_, index) => index % 3 === 0).slice(0, 5);
  if (beats.length < 2) return null;
  return <section className="visual-sequence" aria-labelledby="visual-flow-title">
    <p className="section-number">{locale === "en" ? "STORY THREAD" : "이야기의 흐름"}</p>
    <h2 id="visual-flow-title">{locale === "en" ? "How the case moves" : "사건이 전개되는 장면"}</h2>
    <ol>{beats.map((beat, index) => <li key={beat.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{beat.label[locale]}</strong></li>)}</ol>
  </section>;
}
