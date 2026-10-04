"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/content/schema";
import { pendingAnchorKey, progressKey } from "./ReadingProgressTracker";

type Item = { canonicalId: string; title: { ko: string; en: string } };

export function ContinueReading({ locale, items }: { locale: Locale; items: Item[] }) {
  const [current, setCurrent] = useState<{ canonicalId: string; blockId: string; panel?: string } | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
      if (saved && items.some((item) => item.canonicalId === saved.canonicalId)) queueMicrotask(() => setCurrent(saved));
    } catch { /* Reading remains available without storage. */ }
  }, [items]);
  const item = items.find((candidate) => candidate.canonicalId === current?.canonicalId);

  function rememberAnchor() {
    if (!current?.blockId) return;
    try { sessionStorage.setItem(pendingAnchorKey, current.blockId); } catch { /* Link navigation remains available. */ }
  }

  return <section className={`page-section continue-reading${item ? " is-ready" : ""}`} aria-label={locale === "ko" ? "이어 읽기" : "Continue reading"}>
    {item && <><p className="kicker">{locale === "ko" ? "이어 읽기" : "CONTINUE READING"}</p><Link className="continue-link" href={`/${locale}/cases/${item.canonicalId}/${current?.panel && ['story','evidence','counterarguments','current','sources'].includes(current.panel) ? `?panel=${current.panel}` : ""}${current?.blockId ? `#${current.blockId}` : ""}`} scroll={false} onClick={rememberAnchor}>
      <span><strong>{item.title[locale]}</strong><small>{locale === "ko" ? "마지막으로 읽던 기록으로 돌아가기" : "Return to your last section"}</small></span><span aria-hidden="true">↗</span>
    </Link></>}
  </section>;
}
