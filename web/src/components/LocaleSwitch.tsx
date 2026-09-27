"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/content/schema";
import { localeHref } from "@/lib/base-path";

export function LocaleSwitch({ locale, article = false }: { locale: Locale; article?: boolean }) {
  const pathname = usePathname();
  const route = pathname.replace(/^\/(ko|en)(?=\/|$)/, "");

  function rememberPosition(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!article) return;
    const sections = [...document.querySelectorAll<HTMLElement>("[id^='block-']")];
    const current = sections.filter((section) => section.getBoundingClientRect().top <= 180).at(-1);
    if (current) event.currentTarget.href = `${event.currentTarget.href.split("#")[0]}#${current.id}`;
  }

  return <nav className={article ? "article-languages" : "site-languages"} aria-label={locale === "ko" ? "기사 언어" : "Article language"}>
    {(["ko", "en"] as Locale[]).map((choice) => <a key={choice} href={localeHref(`/${choice}${route || "/"}`)} hrefLang={choice} lang={choice} aria-current={choice === locale ? "page" : undefined} onClick={rememberPosition}>{choice === "ko" ? "한국어" : "English"}</a>)}
  </nav>;
}
