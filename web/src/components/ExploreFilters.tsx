"use client";

import { useMemo, useState } from "react";
import type { CaseRecord, Locale, Localized } from "@/content/schema";
import { CaseCard } from "./CaseCard";

type Category = { id: string; name: Localized };

export function ExploreFilters({ records, categories, locale }: { records: CaseRecord[]; categories: Category[]; locale: Locale }) {
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const countries = useMemo(() => [...new Map(records.map((record) => [record.sourceModel?.canonical.countryKey ?? record.country.en, record.country[locale]])).entries()].sort((a, b) => a[1].localeCompare(b[1], locale)), [records, locale]);
  const filtered = records.filter((record) => (country === "all" || record.sourceModel?.canonical.countryKey === country) && (category === "all" || record.categories.includes(category)));
  return <>
    <div className="discovery-filters">
      <label>{locale === "en" ? "Country" : "국가"}<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="all">{locale === "en" ? "All countries" : "모든 국가"}</option>{countries.map(([key, label]) => <option key={key} value={key}>{label} ({records.filter((item) => item.sourceModel?.canonical.countryKey === key).length})</option>)}</select></label>
      <label>{locale === "en" ? "Category" : "카테고리"}<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{locale === "en" ? "All categories" : "모든 카테고리"}</option>{categories.filter((item) => records.some((record) => record.categories.includes(item.id))).map((item) => <option key={item.id} value={item.id}>{item.name[locale]}</option>)}</select></label>
    </div>
    <p className="result-count" aria-live="polite">{filtered.length} {locale === "en" ? "case files" : "개 사건"}</p>
    <div className="case-grid">{filtered.map((record) => <CaseCard key={record.slug} record={record} locale={locale}/>)}</div>
  </>;
}
