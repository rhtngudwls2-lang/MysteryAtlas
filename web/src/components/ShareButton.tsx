"use client";

import { useState } from "react";
import type { Locale } from "@/content/schema";

export function ShareButton({ locale, title }: { locale: Locale; title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    if (navigator.share) await navigator.share({ title, url: location.href });
    else { await navigator.clipboard.writeText(location.href); setCopied(true); }
  }
  return <button type="button" className="action-button" onClick={share}>{copied ? (locale === "en" ? "Link copied" : "링크 복사됨") : (locale === "en" ? "Share" : "공유")}</button>;
}
