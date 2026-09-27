import taxonomy from "../../../shared/taxonomy/taxonomy.json";
import type { Locale } from "./schema";

export function genreLabel(genre: string, locale: Locale): string {
  return locale === "ko" ? (taxonomy.genreLabelsKo as Record<string, string>)[genre] ?? genre : genre;
}

export function countryLabel(country: string, locale: Locale): string {
  if (locale === "en") return country;
  return (taxonomy.countryLabelsKo as Record<string, string>)[country] ?? country;
}
