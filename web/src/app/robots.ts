import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { isPreview } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return isPreview ? { rules: { userAgent: "*", disallow: "/" } } : { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
