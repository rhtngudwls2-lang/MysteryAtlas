"use client";

import { useEffect } from "react";
import type { Locale } from "@/content/schema";

export const progressKey = "mystery-atlas-reading-v1";

export function ReadingProgressTracker({ canonicalId, locale }: { canonicalId: string; locale: Locale }) {
  useEffect(() => {
    let ticking = false;
    const record = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const blocks = [...document.querySelectorAll<HTMLElement>("[id^='block-']")];
        const current = blocks.filter((block) => block.getBoundingClientRect().top < 180).at(-1);
        try { localStorage.setItem(progressKey, JSON.stringify({ canonicalId, locale, blockId: current?.id ?? "", updatedAt: Date.now() })); } catch { /* Keep reading if storage is disabled. */ }
        ticking = false;
      });
    };
    record();
    window.addEventListener("scroll", record, { passive: true });
    return () => window.removeEventListener("scroll", record);
  }, [canonicalId, locale]);
  return null;
}
