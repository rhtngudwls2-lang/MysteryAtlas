import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SavedProvider } from "@/components/SavedProvider";
import { locales } from "@/content";
import type { Locale } from "@/content/schema";
import { absoluteUrl } from "@/lib/site";
import { getMarket } from "@/config/market";

export const dynamicParams = false;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const market = getMarket(locale as Locale);
  return {
    title: { default: market.seoTitle, template: `%s · ${market.publicDisplayName}` },
    description: market.seoDescription,
    alternates: { canonical: absoluteUrl(`/${locale}/`), languages: { en: absoluteUrl("/en/"), ko: absoluteUrl("/ko/") } },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;
  return <SavedProvider><Header locale={locale}/><main id="main-content">{children}</main><Footer locale={locale}/></SavedProvider>;
}
