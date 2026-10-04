import { CommonArticleView } from "@/components/CommonArticleView";
import { editorialPhoto } from "@/content/editorial-media";
import type { Metadata } from "next";
import { isLaunchVisualExcluded } from "@/lib/launch-visual-exclusions";
import { notFound } from "next/navigation";
import { caseBySlug, cases, locales } from "@/content";
import type { Locale } from "@/content/schema";
import { absoluteUrl } from "@/lib/site";
import { getProductizedArticle, productizedIds } from "@/content/productized";
export const dynamicParams = false;
export function generateStaticParams() { return locales.flatMap((locale) => cases.map((record) => ({ locale, slug: record.slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const record = caseBySlug(slug);
  if (!record) return {};
  const productized = productizedIds.has(slug) ? await getProductizedArticle(slug) : undefined;
  const title = productized?.localizedCopy[locale].headline ?? record.title;
  const description = productized?.localizedCopy[locale].hook ?? record.preview[locale];
  const canonical = absoluteUrl(`/${locale}/cases/${slug}/`);
  const image = editorialPhoto(slug) ?? record.images.find((item) => item.role === "HERO" && item.path);
  const imagePath = image && ["HISTORICAL_MATERIAL", "EXTERNAL_REVIEWED_PHOTOGRAPH"].includes(image.type) ? image.localizedPaths?.[locale] ?? image.path : undefined;
  const socialImage = absoluteUrl(imagePath && !isLaunchVisualExcluded(imagePath) ? imagePath : "/og-preview.png");
  return {
    title,
    description,
    alternates: { canonical, languages: { en: absoluteUrl(`/en/cases/${slug}/`), ko: absoluteUrl(`/ko/cases/${slug}/`) } },
    openGraph: { title, description, url: canonical, type: "article", images: [{ url: socialImage, alt: imagePath && !isLaunchVisualExcluded(imagePath) ? image?.alt[locale] ?? "Mystery Atlas" : "Mystery Atlas" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default async function CasePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const record = caseBySlug(slug);
  if (!record) notFound();
  if (productizedIds.has(slug)) {
    const article = await getProductizedArticle(slug);
    if (!article) notFound();
    const structuredData = {
      "@context": "https://schema.org", "@type": "Article", inLanguage: locale,
      headline: article.localizedCopy[locale].headline,
      description: article.localizedCopy[locale].hook,
      mainEntityOfPage: absoluteUrl(`/${locale}/cases/${slug}/`),
      image: [absoluteUrl(editorialPhoto(slug)?.path ?? '/og-preview.png')],
      isAccessibleForFree: true,
    };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>{<CommonArticleView article={article} record={record} locale={locale}/>}</>;
  }
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Article', inLanguage: locale,
    headline: record.displayTitle?.[locale] ?? record.title,
    description: record.preview[locale],
    mainEntityOfPage: absoluteUrl(`/${locale}/cases/${slug}/`),
    image: [absoluteUrl(editorialPhoto(slug)?.path ?? '/og-preview.png')],
    isAccessibleForFree: true,
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,'\\u003c')}}/><CommonArticleView record={record} locale={locale}/></>;
}
