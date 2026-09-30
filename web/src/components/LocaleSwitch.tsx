"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/content/schema";
import { localeHref } from "@/lib/base-path";

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
    const current = sections.filter((section) => section.getBoundingClientRect().top <= 300).at(-1);
    if (current) {
      event.preventDefault();
      router.push(`/${choice}${route || "/"}#${current.id}`, { scroll: false });
    }
  }

  return <nav className={article ? "article-languages" : "site-languages"} aria-label={locale === "ko" ? "기사 언어" : "Article language"}>
    {(["ko", "en"] as Locale[]).map((choice) => <a key={choice} href={localeHref(`/${choice}${route || "/"}`)} hrefLang={choice} lang={choice} aria-current={choice === locale ? "page" : undefined} onClick={(event) => rememberPosition(event, choice)}>{choice === "ko" ? "한국어" : "English"}</a>)}
  </nav>;
}
