import Image from "next/image";
import type { CaseImage as ImageRecord, Locale } from "@/content/schema";

export function CaseImage({ image, locale, priority = false }: { image: ImageRecord; locale: Locale; priority?: boolean }) {
  if (!image.path) return <figure className="image-placeholder" aria-label={image.alt[locale]}>
    <div className="placeholder-mark" aria-hidden="true">?</div>
    <figcaption><strong>{locale === "en" ? "Verified image unavailable" : "검증된 이미지 없음"}</strong><span>{image.role} · {image.caption[locale]}</span></figcaption>
  </figure>;
  return <figure className="case-image">
    <Image src={image.path} alt={image.alt[locale]} width={1200} height={800} sizes="(max-width: 760px) 100vw, 58vw" priority={priority} />
    <figcaption><span className="image-type">{image.role} · {image.type.replaceAll("_", " ")}</span><span>{image.caption[locale]} <small>{image.provenance[locale]}</small></span></figcaption>
  </figure>;
}
