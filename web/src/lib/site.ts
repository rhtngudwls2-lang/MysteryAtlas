import type { Locale } from "@/content/schema";
import type { Metadata } from "next";

export const siteName = "Mystery Atlas";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mystery-atlas.example";
export const localePath = (locale: Locale, path = "") => `/${locale}${path}`;
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

export function pageMetadata(locale: Locale, path: string, title: string, description?: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}${path}/`),
      languages: { en: absoluteUrl(`/en${path}/`), ko: absoluteUrl(`/ko${path}/`) },
    },
  };
}
