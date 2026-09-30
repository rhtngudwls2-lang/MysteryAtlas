"use client";

import { useEffect } from "react";
import type { Locale } from "@/content/schema";

export const progressKey = "mystery-atlas-reading-v1";

export function ReadingProgressTracker({ canonicalId, locale }: { canonicalId: string; locale: Locale }) {
  useEffect(() => {
    let ticking = false;
    let listening = false;
    let disposed = false;
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const imageCleanups: Array<() => void> = [];

    document.documentElement.lang = locale;

    const record = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (disposed) return;
        const blocks = [...document.querySelectorAll<HTMLElement>("[id^='block-']")];
        const current = blocks.filter((block) => block.getBoundingClientRect().top < 300).at(-1);
        try {
          const previous = JSON.parse(localStorage.getItem(progressKey) ?? "null");
          // Route transitions can scroll the departing page to the top before
          // this listener is removed. Keep the last chapter for this article.
          const blockId = current?.id ?? (previous?.canonicalId === canonicalId ? previous.blockId : "") ?? "";
          localStorage.setItem(progressKey, JSON.stringify({ canonicalId, locale, blockId, updatedAt: Date.now() }));
        } catch { /* Keep reading if storage is disabled. */ }
        ticking = false;
      });
    };

    const beginTracking = () => {
      if (disposed || listening) return;
      listening = true;
      record();
      window.addEventListener("scroll", record, { passive: true });
    };

    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    const target = hash.startsWith("block-") ? document.getElementById(hash) : null;
    if (!target) {
      beginTracking();
      return () => {
        disposed = true;
        if (listening) window.removeEventListener("scroll", record);
      };
    }

    const settleAtHash = () => {
      if (disposed || settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      void document.fonts.ready.catch(() => undefined).then(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (disposed) return;
          const currentTarget = document.getElementById(hash);
          if (currentTarget) {
            currentTarget.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
            const toolbar = document.querySelector<HTMLElement>(".article-toolbar");
            const offset = Math.max(96, Math.ceil(toolbar?.getBoundingClientRect().height ?? 0) + 24);
            window.scrollBy({ top: -offset, left: 0, behavior: "auto" });
          }
          beginTracking();
        }));
      });
    };

    const pendingImages = [...document.querySelectorAll<HTMLImageElement>(".productized-page img")].filter((image) => !image.complete);
    if (pendingImages.length === 0) {
      settleAtHash();
    } else {
      let remaining = pendingImages.length;
      const done = () => {
        remaining -= 1;
        if (remaining <= 0) settleAtHash();
      };
      for (const image of pendingImages) {
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
        imageCleanups.push(() => {
          image.removeEventListener("load", done);
          image.removeEventListener("error", done);
        });
      }
      timeout = setTimeout(settleAtHash, 5000);
    }

    return () => {
      disposed = true;
      if (timeout) clearTimeout(timeout);
      if (listening) window.removeEventListener("scroll", record);
      for (const cleanup of imageCleanups) cleanup();
    };
  }, [canonicalId, locale]);
  return null;
}
