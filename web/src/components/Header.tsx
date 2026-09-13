import Link from "next/link";
import type { Locale } from "@/content/schema";
import { copy } from "@/lib/copy";
import { getMarket } from "@/config/market";

export function Header({ locale }: { locale: Locale }) {
  const c = copy(locale);
  const market = getMarket(locale);
  const other = locale === "en" ? "ko" : "en";
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href={`/${locale}/`} aria-label={`${market.publicDisplayName} home`}><span className="brand-mark">{market.shortName.slice(0, 1)}</span><span>{market.publicDisplayName}</span></Link>
      <nav className="main-nav" aria-label={locale === "en" ? "Primary" : "주요 메뉴"}>
        <Link href={`/${locale}/explore/`}>{c.explore}</Link>
        <Link href={`/${locale}/collections/`}>{c.collections}</Link>
        <Link href={`/${locale}/search/`}>{c.search}</Link>
        <Link href={`/${locale}/saved/`}>{c.saved}</Link>
      </nav>
      <Link className="locale-switch" href={`/${other}/`} hrefLang={other}>{other.toUpperCase()}</Link>
    </div>
  </header>;
}
