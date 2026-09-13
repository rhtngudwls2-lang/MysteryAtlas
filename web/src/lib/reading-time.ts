import type { CaseRecord, Locale } from "@/content/schema";

export function countContentUnits(record: CaseRecord, locale: Locale): number {
  const text = [record.preview[locale], ...record.narrative.flatMap((section) => [section.title[locale], section.body[locale]]), ...record.claims.flatMap((claim) => [claim.claim[locale], claim.reason[locale], claim.establishes[locale], claim.doesNotEstablish[locale], claim.counterEvidence[locale]])].join(" ");
  return locale === "ko" ? (text.match(/[가-힣A-Za-z0-9]+/g) ?? []).join("").length : (text.match(/\b[\w’'-]+\b/g) ?? []).length;
}

export function readingMinutes(record: CaseRecord, locale: Locale): number {
  const units = countContentUnits(record, locale);
  return Math.max(1, Math.ceil(units / (locale === "ko" ? 650 : 200)));
}
