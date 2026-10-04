"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content/schema";
import { copy } from "@/lib/copy";
import { getMarket } from "@/config/market";
import { LocaleSwitch } from "./LocaleSwitch";

export function Header({ locale }: { locale: Locale }) {
  const c = copy(locale);
  const market = getMarket(locale);
  const reading = usePathname().startsWith(`/${locale}/cases/`);
  return <header className={`site-header${reading ? " is-reading" : ""}`}>
    <div className="header-inner">
      <Link className="brand" href={`/${locale}/`} aria-label={`${market.publicDisplayName} home`}><span className="brand-mark">{market.shortName.slice(0, 1)}</span><span>{market.publicDisplayName}</span></Link>
      <nav className="main-nav" aria-label={locale === "en" ? "Primary" : "주요 메뉴"}>
        <Link className="nav-home" href={`/${locale}/`}>{locale === "ko" ? "홈" : "Home"}</Link>
        <Link href={`/${locale}/explore/`}>{c.explore}</Link>
        <Link className="nav-collections" href={`/${locale}/collections/`}>{c.collections}</Link>
        <Link href={`/${locale}/search/`}>{c.search}</Link>
        <Link href={`/${locale}/saved/`}>{c.saved}</Link>
      </nav>
      {!reading && <LocaleSwitch locale={locale}/>}
    </div>
  </header>;
}
