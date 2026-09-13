import type { MetadataRoute } from "next";
import { cases, collections, locales } from "@/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/explore", "/search", "/collections", "/saved", "/about", "/methodology", "/editorial-policy", "/privacy", "/terms"];
  return locales.flatMap((locale) => [
    ...staticPaths.map((path) => ({ url: absoluteUrl(`/${locale}${path}/`), lastModified: "2026-09-13", changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.6 })),
    ...cases.map((record) => ({ url: absoluteUrl(`/${locale}/cases/${record.slug}/`), lastModified: record.verifiedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...collections.map((collection) => ({ url: absoluteUrl(`/${locale}/collections/${collection.slug}/`), lastModified: "2026-09-13", changeFrequency: "monthly" as const, priority: 0.7 })),
  ]);
}
