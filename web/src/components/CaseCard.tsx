import Image from "next/image";
import Link from "next/link";
import type { CaseRecord, Locale } from "@/content/schema";
import { readingMinutes } from "@/lib/reading-time";

export function CaseCard({ record, locale, compact = false }: { record: CaseRecord; locale: Locale; compact?: boolean }) {
  const image = record.images.find((item) => item.role === "HERO");
  return <article className={`case-card${compact ? " compact" : ""}`} data-case={record.slug}>
    <Link className="card-image" href={`/${locale}/cases/${record.slug}/`} aria-label={record.title}>
      {image?.path ? <Image src={image.path} alt="" width={600} height={400} sizes="(max-width: 760px) 92vw, 30vw" /> : <div className="card-placeholder"><span>NO VERIFIED IMAGE</span></div>}
    </Link>
    <div className="card-body">
      <div className="eyebrow"><span>{record.country[locale]}</span><span>{record.year}</span><span>{readingMinutes(record, locale)} {locale === "en" ? "min" : "분"}</span></div>
      <h3><Link href={`/${locale}/cases/${record.slug}/`}>{record.title}</Link></h3>
      <p>{record.subtitle[locale]}</p>
      <span className="status-label">{record.status[locale]}</span>
    </div>
  </article>;
}
