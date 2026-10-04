import taxonomy from "../../../shared/taxonomy/taxonomy.json";
import type { Locale } from "./schema";

export function genreLabel(genre: string, locale: Locale): string {
  return locale === "ko" ? (taxonomy.genreLabelsKo as Record<string, string>)[genre] ?? "기타 이야기" : genre;
}

export function countryLabel(country: string, locale: Locale): string {
  if (locale === "en") return country;
  return (taxonomy.countryLabelsKo as Record<string, string>)[country] ?? "지역 정보 확인 중";
}
