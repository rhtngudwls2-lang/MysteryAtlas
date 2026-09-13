import Link from "next/link";
import type { Locale } from "@/content/schema";
import { copy } from "@/lib/copy";
import { getMarket } from "@/config/market";

export function Footer({ locale }: { locale: Locale }) {
  const c = copy(locale);
  const market = getMarket(locale);
  return <footer className="site-footer"><div className="footer-inner">
    <div><strong>{market.publicDisplayName}</strong><p>{market.tagline}</p></div>
    <nav aria-label={locale === "en" ? "Information" : "정보"}>
      <Link href={`/${locale}/about/`}>{c.about}</Link>
      <Link href={`/${locale}/methodology/`}>{c.methodology}</Link>
      <Link href={`/${locale}/editorial-policy/`}>{c.editorial}</Link>
      <Link href={`/${locale}/privacy/`}>Privacy</Link>
      <Link href={`/${locale}/terms/`}>Terms</Link>
    </nav>
  </div></footer>;
}
