import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SavedProvider } from "@/components/SavedProvider";
import { locales } from "@/content";
import type { Locale } from "@/content/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const isEn = locale === "en";
  return {
    title: { default: "Mystery Atlas", template: "%s · Mystery Atlas" },
    description: isEn ? "Mystery stories with evidence, counterevidence, and source boundaries." : "미스터리의 이야기와 근거, 반대 근거, 출처의 한계를 함께 읽습니다.",
    alternates: { canonical: absoluteUrl(`/${locale}/`), languages: { en: absoluteUrl("/en/"), ko: absoluteUrl("/ko/") } },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;
  return <SavedProvider><Header locale={locale}/><main id="main-content">{children}</main><Footer locale={locale}/></SavedProvider>;
}
