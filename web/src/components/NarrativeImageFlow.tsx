import type { CaseRecord, Locale } from "@/content/schema";

export function NarrativeImageFlow({ record, locale }: { record: CaseRecord; locale: Locale }) {
  const beats = record.visualSequence ?? [];
  return <section className="visual-sequence" aria-labelledby="visual-flow-title">
    <p className="section-number">VISUAL NARRATIVE PLAN</p>
    <h2 id="visual-flow-title">{locale === "en" ? "How the case moves" : "사건이 전개되는 장면"}</h2>
    <ol>{beats.map((beat) => { const image = record.images.find((item) => item.id === beat.imageId); return <li key={beat.id}><span>{String(beat.sequence).padStart(2, "0")}</span><div><b>{beat.role}</b><strong>{beat.label[locale]}</strong><small>{image?.path ? image.caption[locale] : locale === "en" ? "Image slot — verified material unavailable" : "이미지 슬롯 — 검증된 자료 없음"}</small></div></li>; })}</ol>
  </section>;
}
