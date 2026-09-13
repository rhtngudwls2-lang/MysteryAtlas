"use client";

import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/content/schema";

export function QuickPreview({ caseId, locale, children }: { caseId: string; locale: Locale; children: React.ReactNode }) {
  return <details className="quick-preview" onToggle={(event) => {
    if (event.currentTarget.open) trackEvent({ name: "preview_open", caseId, locale });
  }}>
    <summary><span>{locale === "en" ? "10-second preview" : "10초 프리뷰"}</span><small>{locale === "en" ? "A quick editorial preview—not a timer" : "타이머가 아닌 짧은 편집 프리뷰"}</small></summary>
    <div>{children}</div>
  </details>;
}
