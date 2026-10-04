"use client";

import { useState } from "react";
import type { Locale } from "@/content/schema";
import { getMarket } from "@/config/market";
import { trackEvent } from "@/lib/analytics";

export function ShareButton({ locale, title }: { locale: Locale; title: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function share() {
    const shareTitle = `${getMarket(locale).shareCopy} ${title}`;
    const shareUrl = new URL(location.pathname, location.origin).toString();
    trackEvent({ name: "share", locale, value: title });
    setFailed(false);
    try {
      if (navigator.share) await navigator.share({ title: shareTitle, url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); setCopied(true); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
    }
  }
  return <button type="button" className="action-button" onClick={share} aria-label={failed ? (locale === "en" ? "Share failed. Retry" : "공유 실패. 다시 시도") : undefined}>{copied ? (locale === "en" ? "Link copied" : "링크 복사됨") : (locale === "en" ? "Share" : "공유")}</button>;
}
