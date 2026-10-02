"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/content/schema";
import { localeHref } from "@/lib/base-path";
import { pendingAnchorKey } from "./ReadingProgressTracker";

export function LocaleSwitch({ locale, article = false }: { locale: Locale; article?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const route = pathname.replace(/^\/(ko|en)(?=\/|$)/, "");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function rememberPosition(event: React.MouseEvent<HTMLAnchorElement>, choice: Locale) {
    if (!article) return;
    const sections = [...document.querySelectorAll<HTMLElement>("[id^='block-']")];
    // Keep the chapter the reader is actually looking at. If the reading line
    // falls inside an interleaved visual, use the nearest visible chapter
    // heading instead of relying on DOM order.
    const readingLine = 300;
    const measured = sections.map((section) => ({ section, rect: section.getBoundingClientRect() }));
    const current = measured.find(({ rect }) => rect.top <= readingLine && rect.bottom > readingLine)?.section
      ?? measured
        .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight)
        .sort((a, b) => Math.abs(a.rect.top - readingLine) - Math.abs(b.rect.top - readingLine))[0]?.section
      ?? measured
        .filter(({ rect }) => rect.top <= readingLine)
        .sort((a, b) => b.rect.top - a.rect.top)[0]?.section;

    if (current) {
      event.preventDefault();
      try { sessionStorage.setItem(pendingAnchorKey, current.id); } catch { /* Navigation still works without storage. */ }
      router.push(`/${choice}${route || "/"}#${current.id}`, { scroll: false });
    }
  }

  return <nav className={article ? "article-languages" : "site-languages"} aria-label={locale === "ko" ? "기사 언어" : "Article language"}>
    {(["ko", "en"] as Locale[]).map((choice) => <a key={choice} href={localeHref(`/${choice}${route || "/"}`)} hrefLang={choice} lang={choice} aria-current={choice === locale ? "page" : undefined} onClick={(event) => rememberPosition(event, choice)}>{choice === "ko" ? "한국어" : "English"}</a>)}
  </nav>;
}
