"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/content/schema";
import { searchCases } from "@/lib/search";
import { CaseCard } from "./CaseCard";
import { trackEvent } from "@/lib/analytics";

export function SearchView({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCases(query, locale), [query, locale]);
  return <div className="search-view">
    <label className="search-box"><span className="sr-only">{locale === "en" ? "Search cases" : "사건 검색"}</span><input autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); trackEvent({ name: "search", locale, value: event.target.value }); }} placeholder={locale === "en" ? "Search a case, person, place, date…" : "사건, 인물, 장소, 날짜 검색…"} data-testid="search-input"/><kbd>⌘ K</kbd></label>
    <p className="result-count" aria-live="polite">{results.length} {locale === "en" ? "cases" : "개 사건"}</p>
    <div className="case-grid">{results.map((record) => <CaseCard key={record.slug} record={record} locale={locale} />)}</div>
    {!results.length && <div className="empty-state">{locale === "en" ? "No matching cases. Try a title, person, place, date, or category." : "일치하는 사건이 없습니다. 제목, 인물, 장소, 날짜, 카테고리로 검색해 보세요."}</div>}
  </div>;
}
