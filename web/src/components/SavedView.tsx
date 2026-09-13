"use client";

import { cases } from "@/content";
import type { Locale } from "@/content/schema";
import { CaseCard } from "./CaseCard";
import { useSaved } from "./SavedProvider";

export function SavedView({ locale }: { locale: Locale }) {
  const { ready, saved } = useSaved();
  const records = cases.filter((item) => saved.includes(item.slug));
  if (!ready) return <div className="empty-state">{locale === "en" ? "Loading saved cases…" : "저장한 사건을 불러오는 중…"}</div>;
  if (!records.length) return <div className="empty-state"><strong>{locale === "en" ? "Your file is empty." : "저장한 사건이 없습니다."}</strong><p>{locale === "en" ? "Save a case to keep its evidence file close." : "사건을 저장하면 근거 파일을 다시 찾기 쉽습니다."}</p></div>;
  return <div className="case-grid">{records.map((record) => <CaseCard key={record.slug} record={record} locale={locale} />)}</div>;
}
