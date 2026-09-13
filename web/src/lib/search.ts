import { cases, categories } from "@/content";
import type { CaseRecord, Locale } from "@/content/schema";

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function searchCases(query: string, locale: Locale, records: CaseRecord[] = cases): CaseRecord[] {
  const needle = normalize(query);
  if (!needle) return records;
  return records.map((record) => {
    const categoryNames = categories.filter((category) => record.categories.includes(category.id)).flatMap((category) => [category.name.en, category.name.ko]);
    const exact = [record.title, ...record.aliases].map(normalize);
    const primary = [record.title, record.subtitle[locale], record.preview[locale], ...record.aliases].map(normalize);
    const metadata = [...record.tags, ...record.people, ...record.places, ...record.dates, record.year, ...categoryNames].map(normalize);
    const rank = exact.includes(needle) ? 0 : primary.some((value) => value.includes(needle)) ? 1 : metadata.some((value) => value.includes(needle)) ? 2 : -1;
    return { record, rank };
  }).filter((item) => item.rank >= 0).sort((a, b) => a.rank - b.rank || a.record.title.localeCompare(b.record.title)).map((item) => item.record);
}
