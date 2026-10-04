"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/schema";
import { normalizeReaderTone, readerTones, type ReaderTone } from "@/lib/reader-preferences";
type Size = "16" | "17" | "18";
type Leading = "compact" | "normal" | "relaxed";
const key = "mystery-atlas-reader-v1";
export function ReaderSettings({ locale }: { locale: Locale }) {
  const [size, setSize] = useState<Size>("17");
  const [leading, setLeading] = useState<Leading>("normal");
  const [tone, setTone] = useState<ReaderTone>("ivory");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let saved: Record<string, unknown> = {};
    try { const value: unknown = JSON.parse(localStorage.getItem(key) || "{}"); if (value && typeof value === "object" && !Array.isArray(value)) saved = value as Record<string, unknown>; } catch { /* Use readable defaults. */ }
    queueMicrotask(() => {
      if (["16", "17", "18"].includes(String(saved.size))) setSize(saved.size as Size);
      if (["compact", "normal", "relaxed"].includes(String(saved.leading))) setLeading(saved.leading as Leading);
      setTone(normalizeReaderTone(saved.tone)); setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.readerSize = size; root.dataset.readerLeading = leading; root.dataset.readerTone = tone;
    try { localStorage.setItem(key, JSON.stringify({ size, leading, tone })); } catch { /* Settings remain available for this visit. */ }
  }, [size, leading, tone, ready]);
  const label = (value: typeof readerTones[number]) => ({ ivory: locale === "ko" ? "아이보리" : "Ivory", warmgray: locale === "ko" ? "웜그레이" : "Warm gray", midnight: locale === "ko" ? "미드나이트" : "Midnight" })[value];
  return <details className="reader-settings"><summary aria-label={locale === "ko" ? "읽기 설정" : "Reading settings"}>Aa</summary><div className="reader-settings-panel">
    <strong>{locale === "ko" ? "읽기 설정" : "Reading settings"}</strong>
    <div role="group" aria-label={locale === "ko" ? "글자 크기" : "Text size"}><span>{locale === "ko" ? "글자" : "Text"}</span>{(["16", "17", "18"] as Size[]).map((value) => <button type="button" key={value} aria-pressed={size === value} onClick={() => setSize(value)}>{value}</button>)}</div>
    <div role="group" aria-label={locale === "ko" ? "줄 간격" : "Line spacing"}><span>{locale === "ko" ? "줄 간격" : "Spacing"}</span>{(["compact", "normal", "relaxed"] as Leading[]).map((value) => <button type="button" key={value} aria-pressed={leading === value} onClick={() => setLeading(value)}>{value === "compact" ? locale === "ko" ? "좁게" : "Compact" : value === "normal" ? locale === "ko" ? "기본" : "Comfortable" : locale === "ko" ? "넓게" : "Relaxed"}</button>)}</div>
    <div role="group" aria-label={locale === "ko" ? "화면 색" : "Theme"}><span>{locale === "ko" ? "화면" : "Theme"}</span>{readerTones.map((value) => <button type="button" key={value} aria-pressed={tone === value} onClick={() => setTone(value)}>{label(value)}</button>)}</div>
    {!(readerTones as readonly string[]).includes(tone) && <p>{locale === "ko" ? "이전 테마 선택을 유지하고 있습니다." : "Your previous theme is retained."}</p>}
  </div></details>;
}
