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
        const blocks = [...document.querySelectorAll<HTMLElement>("[id^='block-']:not([data-anchor-alias])")].filter((node) => node.getClientRects().length > 0);
        const panel = document.querySelector<HTMLElement>('.article-tab-panel:not([hidden])');
        const readingLine = Math.max(160,(document.querySelector<HTMLElement>('.article-toolbar')?.getBoundingClientRect().bottom??0)+24);
        const current = blocks.filter((block) => block.getBoundingClientRect().top < readingLine).at(-1);
        try {
          const previous = JSON.parse(localStorage.getItem(progressKey) ?? "null");
          const blockId = current?.id ?? (previous?.canonicalId === canonicalId && previous?.panel === panel?.dataset.articlePanel ? previous.blockId : "") ?? "";
          localStorage.setItem(progressKey, JSON.stringify({ canonicalId, locale, blockId, panel: panel?.dataset.articlePanel, panelScroll: window.scrollY, updatedAt: Date.now() }));
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
      const root = document.documentElement;
      const body = document.body;
      const rootBehavior = root.style.scrollBehavior;
      const bodyBehavior = body.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
      const toolbar = document.querySelector<HTMLElement>(".article-toolbar");
      const offset = Math.max(96, Math.ceil(toolbar?.getBoundingClientRect().bottom ?? 0) + 24);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "auto" });
      root.style.scrollBehavior = rootBehavior;
      body.style.scrollBehavior = bodyBehavior;
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
      const target = id.startsWith("block-") ? document.getElementById(id) : null;
      if (!target) {
        beginTracking();
        return;
      }

      for (let parent = target.parentElement; parent; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement) parent.open = true;
      }
      const precedingImages = [...document.querySelectorAll<HTMLImageElement>(".productized-page img")].filter((image) =>
        Boolean(image.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
      // Next/Image may keep offscreen images lazy even when they are above a
      // deep-link target. Ask those images to load before restoring the anchor,
      // otherwise their later layout shift can move the chapter hundreds of px.
      for (const image of precedingImages) {
        if (image.loading === "lazy") image.loading = "eager";
      }
      const pendingImages = precedingImages.filter((image) => !image.complete || image.naturalWidth === 0);
      let finished = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;

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
