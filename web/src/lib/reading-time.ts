import type { CaseRecord, Locale } from "@/content/schema";

export interface ReadingStrategy {
  count(text: string): number;
  unitsPerMinute: number;
}

export const readingStrategies: Record<Locale, ReadingStrategy> = {
  en: { count: (text) => (text.match(/\b[\w’'-]+\b/g) ?? []).length, unitsPerMinute: 200 },
  ko: { count: (text) => (text.match(/[가-힣A-Za-z0-9]+/g) ?? []).join("").length, unitsPerMinute: 650 },
};

export function countContentUnits(record: CaseRecord, locale: Locale): number {
  const text = [record.preview[locale], ...record.narrative.flatMap((section) => [section.title[locale], section.body[locale]]), ...record.claims.flatMap((claim) => [claim.claim[locale], claim.reason[locale], claim.establishes[locale], claim.doesNotEstablish[locale], claim.counterEvidence[locale]])].join(" ");
  return readingStrategies[locale].count(text);
}

export function readingMinutes(record: CaseRecord, locale: Locale): number {
  const units = countContentUnits(record, locale);
  return Math.max(1, Math.ceil(units / readingStrategies[locale].unitsPerMinute));
}
