"use client";

import { useSaved } from "./SavedProvider";
import type { Locale } from "@/content/schema";
import { trackEvent } from "@/lib/analytics";

export function SaveButton({ slug, locale }: { slug: string; locale: Locale }) {
  const { ready, has, toggle } = useSaved();
  const active = ready && has(slug);
  return <button type="button" className={`action-button${active ? " active" : ""}`} onClick={() => { toggle(slug); trackEvent({ name: "save", caseId: slug, locale, value: active ? "removed" : "saved" }); }} aria-label={locale === "ko" ? active ? "저장한 이야기에서 제거" : "이야기 저장" : active ? "Remove saved story" : "Save story"} aria-pressed={active} data-testid={`save-${slug}`}>
    <svg aria-hidden="true" focusable="false" width="18" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>{active ? (locale === "en" ? "Saved" : "저장됨") : (locale === "en" ? "Save" : "저장")}
  </button>;
}
