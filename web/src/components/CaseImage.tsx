import Image from "next/image";
import type { CaseImage as ImageRecord, Locale } from "@/content/schema";

export function CaseImage({ image, locale, priority = false }: { image: ImageRecord; locale: Locale; priority?: boolean }) {
  if (!image.path) return <figure className="image-placeholder" aria-label={image.alt[locale]}>
    <div className="placeholder-mark" aria-hidden="true">?</div>
    <figcaption><strong>{locale === "en" ? "Verified image unavailable" : "검증된 이미지 없음"}</strong><span>{image.role} · {image.caption[locale]}</span></figcaption>
  </figure>;
  const label = image.type === "EDITORIAL_RECONSTRUCTION"
    ? locale === "ko" ? "편집 재구성 · 실제 증거 사진 아님" : "Editorial reconstruction · not evidence"
    : image.type === "HISTORICAL_MATERIAL"
      ? locale === "ko" ? "역사 자료" : "Historical material"
      : locale === "ko" ? "참고 이미지" : "Context image";
  return <figure className="case-image">
    <Image src={image.path} alt={image.alt[locale]} width={1200} height={800} sizes="(max-width: 760px) 100vw, 58vw" priority={priority} />
    <figcaption><span className="image-type">{label}</span><span>{image.caption[locale]}</span><details className="image-provenance"><summary>{locale === "ko" ? "이미지 정보" : "Image details"}</summary><small>{image.provenance[locale]}</small></details></figcaption>
  </figure>;
}
