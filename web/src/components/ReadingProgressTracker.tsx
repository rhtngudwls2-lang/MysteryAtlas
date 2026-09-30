"use client";

import { useEffect } from "react";
import type { Locale } from "@/content/schema";

export const progressKey = "mystery-atlas-reading-v1";
export const pendingAnchorKey = "mystery-atlas-pending-anchor-v1";

export function ReadingProgressTracker({ canonicalId, locale }: { canonicalId: string; locale: Locale }) {
  useEffect(() => {
    let ticking = false;
    let listening = false;
    let disposed = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const imageCleanups = new Set<() => void>();

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

    const positionAt = (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
      const toolbar = document.querySelector<HTMLElement>(".article-toolbar");
      const offset = Math.max(96, Math.ceil(toolbar?.getBoundingClientRect().height ?? 0) + 24);
      window.scrollBy({ top: -offset, left: 0, behavior: "auto" });
    };

    const finishRestore = (id: string) => {
      if (disposed) return;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (disposed) return;
        positionAt(id);
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (disposed) return;
          positionAt(id);
          try {
            if (sessionStorage.getItem(pendingAnchorKey) === id) sessionStorage.removeItem(pendingAnchorKey);
          } catch { /* Ignore unavailable storage. */ }
          beginTracking();
        }, 180);
        timers.add(timer);
      }));
    };

    const restore = (id: string) => {
      if (!id.startsWith("block-") || !document.getElementById(id)) {
        beginTracking();
        return;
      }

      const pendingImages = [...document.querySelectorAll<HTMLImageElement>(".productized-page img")].filter((image) => !image.complete);
      let finished = false;
      let timeout: ReturnType<typeof setTimeout> | undefined;

      const ready = () => {
        if (finished || disposed) return;
        finished = true;
        if (timeout) {
          clearTimeout(timeout);
          timers.delete(timeout);
        }
        void Promise.resolve(document.fonts.ready).catch(() => undefined).then(() => finishRestore(id));
      };

      if (pendingImages.length === 0) {
        ready();
        return;
      }

      let remaining = pendingImages.length;
      const done = () => {
        remaining -= 1;
        if (remaining <= 0) ready();
      };
      for (const image of pendingImages) {
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
        const cleanup = () => {
          image.removeEventListener("load", done);
          image.removeEventListener("error", done);
        };
        imageCleanups.add(cleanup);
      }
      timeout = setTimeout(ready, 5000);
      timers.add(timeout);
    };

    let pending = "";
    try { pending = sessionStorage.getItem(pendingAnchorKey) ?? ""; } catch { /* Ignore unavailable storage. */ }
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    const initial = pending.startsWith("block-") ? pending : hash;
    if (initial.startsWith("block-")) restore(initial);
    else beginTracking();

    const onHashChange = () => {
      const next = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (next.startsWith("block-")) restore(next);
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      disposed = true;
      window.removeEventListener("hashchange", onHashChange);
      if (listening) window.removeEventListener("scroll", record);
      for (const timer of timers) clearTimeout(timer);
      for (const cleanup of imageCleanups) cleanup();
    };
  }, [canonicalId, locale]);
  return null;
}
