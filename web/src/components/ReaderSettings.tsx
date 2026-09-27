"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/content/schema";

type Size = "16" | "17" | "18";
type Leading = "normal" | "relaxed";
type Tone = "dark" | "dim" | "warm";
const key = "mystery-atlas-reader-v1";

export function ReaderSettings({ locale }: { locale: Locale }) {
  const [size, setSize] = useState<Size>("17");
  const [leading, setLeading] = useState<Leading>("normal");
  const [tone, setTone] = useState<Tone>("dark");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      queueMicrotask(() => {
        if (["16", "17", "18"].includes(saved.size)) setSize(saved.size);
        if (["normal", "relaxed"].includes(saved.leading)) setLeading(saved.leading);
        if (["dark", "dim", "warm"].includes(saved.tone)) setTone(saved.tone);
      });
    } catch { /* Readable defaults remain in place if storage is unavailable. */ }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.readerSize = size;
    root.dataset.readerLeading = leading;
    root.dataset.readerTone = tone;
    try { localStorage.setItem(key, JSON.stringify({ size, leading, tone })); } catch { /* Reader settings still work for this visit. */ }
  }, [size, leading, tone]);

  return <details className="reader-settings">
    <summary aria-label={locale === "ko" ? "읽기 설정" : "Reading settings"}>Aa</summary>
    <div className="reader-settings-panel">
      <strong>{locale === "ko" ? "읽기 설정" : "Reading settings"}</strong>
      <div role="group" aria-label={locale === "ko" ? "글자 크기" : "Text size"}><span>{locale === "ko" ? "글자" : "Text"}</span>{(["16", "17", "18"] as Size[]).map((value) => <button type="button" key={value} aria-pressed={size === value} onClick={() => setSize(value)}>{value}</button>)}</div>
      <div role="group" aria-label={locale === "ko" ? "줄 간격" : "Line spacing"}><span>{locale === "ko" ? "줄 간격" : "Spacing"}</span>{(["normal", "relaxed"] as Leading[]).map((value) => <button type="button" key={value} aria-pressed={leading === value} onClick={() => setLeading(value)}>{value === "normal" ? locale === "ko" ? "기본" : "Normal" : locale === "ko" ? "넓게" : "Relaxed"}</button>)}</div>
      <div role="group" aria-label={locale === "ko" ? "화면 색" : "Theme"}><span>{locale === "ko" ? "화면" : "Theme"}</span>{(["dark", "dim", "warm"] as Tone[]).map((value) => <button type="button" key={value} aria-pressed={tone === value} onClick={() => setTone(value)}>{value === "dark" ? "Dark" : value === "dim" ? "Dim" : locale === "ko" ? "따뜻하게" : "Warm"}</button>)}</div>
    </div>
  </details>;
}
