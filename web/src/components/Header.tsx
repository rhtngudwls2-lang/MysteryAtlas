import Link from "next/link";
import type { Locale } from "@/content/schema";
import { copy } from "@/lib/copy";

export function Header({ locale }: { locale: Locale }) {
  const c = copy(locale);
  const other = locale === "en" ? "ko" : "en";
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href={`/${locale}/`} aria-label="Mystery Atlas home"><span className="brand-mark">M</span><span>MYSTERY ATLAS</span></Link>
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
