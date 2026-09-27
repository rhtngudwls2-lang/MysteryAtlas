"use client";

import { useMemo, useState } from "react";
import type { CaseRecord, Locale, Localized } from "@/content/schema";
import { CaseCard } from "./CaseCard";
import { productizedItems } from "@/content/productized";

type Category = { id: string; name: Localized };

export function ExploreFilters({ records, categories, locale }: { records: CaseRecord[]; categories: Category[]; locale: Locale }) {
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [era, setEra] = useState("all");
  const [resolution, setResolution] = useState("all");
  const countries = useMemo(() => [...new Map(records.map((record) => [record.sourceModel?.canonical.countryKey ?? record.country.en, record.country[locale]])).entries()].sort((a, b) => a[1].localeCompare(b[1], locale)), [records, locale]);
  const regions = useMemo(() => [...new Set(productizedItems.flatMap((item) => item.regions))].sort((a, b) => a.localeCompare(b, locale)), [locale]);
  const eras = useMemo(() => [...new Set(productizedItems.map((item) => item.era))].sort((a, b) => a.localeCompare(b, locale)), [locale]);
  const byId = useMemo(() => new Map(productizedItems.map((item) => [item.canonicalId, item])), []);
  const filtered = records.filter((record) => {
    const item = byId.get(record.slug);
    const explicitlyOpen = item && /UNRESOLVED|UNDETERMINED|UNDECIPHERED|UNIDENTIFIED/.test(item.resolution);
    const explicitlyResolved = item && /FORENSICALLY_PROVEN|EXPLAINED_WITH|IDENTITY_STRONGLY_RESOLVED|CONFESSED_FRAUD|CLAIM_REJECTED|IDENTIFICATION_LARGELY_RESOLVED/.test(item.resolution);
    return (country === "all" || record.sourceModel?.canonical.countryKey === country)
      && (category === "all" || record.categories.includes(category))
      && (region === "all" || item?.regions.includes(region))
      && (era === "all" || item?.era === era)
      && (resolution === "all" || (resolution === "open" ? explicitlyOpen : explicitlyResolved));
  });
  return <>
    <div className="discovery-filters">
      <label>{locale === "en" ? "Country" : "국가"}<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="all">{locale === "en" ? "All countries" : "모든 국가"}</option>{countries.map(([key, label]) => <option key={key} value={key}>{label} ({records.filter((item) => item.sourceModel?.canonical.countryKey === key).length})</option>)}</select></label>
      <label>{locale === "en" ? "Category" : "카테고리"}<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{locale === "en" ? "All categories" : "모든 카테고리"}</option>{categories.filter((item) => records.some((record) => record.categories.includes(item.id))).map((item) => <option key={item.id} value={item.id}>{item.name[locale]}</option>)}</select></label>
      <label>{locale === "en" ? "Region" : "지역"}<select value={region} onChange={(event) => setRegion(event.target.value)}><option value="all">{locale === "en" ? "All regions" : "모든 지역"}</option>{regions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label>{locale === "en" ? "Era" : "시대"}<select value={era} onChange={(event) => setEra(event.target.value)}><option value="all">{locale === "en" ? "All eras" : "모든 시대"}</option>{eras.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label>{locale === "en" ? "Evidence status" : "해결 상태"}<select value={resolution} onChange={(event) => setResolution(event.target.value)}><option value="all">{locale === "en" ? "All statuses" : "전체"}</option><option value="open">{locale === "en" ? "Explicitly unresolved" : "명시적 미해결"}</option><option value="resolved">{locale === "en" ? "Evidence resolved" : "증거로 해결"}</option></select></label>
    </div>
    <p className="result-count" aria-live="polite">{filtered.length} {locale === "en" ? "case files" : "개 사건"}</p>
    <div className="case-grid">{filtered.map((record) => <CaseCard key={record.slug} record={record} locale={locale}/>)}</div>
  </>;
}
