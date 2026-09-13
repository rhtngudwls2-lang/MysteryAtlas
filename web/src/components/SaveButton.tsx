"use client";

import { useSaved } from "./SavedProvider";
import type { Locale } from "@/content/schema";
import { trackEvent } from "@/lib/analytics";

export function SaveButton({ slug, locale }: { slug: string; locale: Locale }) {
  const { ready, has, toggle } = useSaved();
  const active = ready && has(slug);
  return <button type="button" className={`action-button${active ? " active" : ""}`} onClick={() => { toggle(slug); trackEvent({ name: "save", caseId: slug, locale, value: active ? "removed" : "saved" }); }} aria-pressed={active} data-testid={`save-${slug}`}>
    <span aria-hidden="true">{active ? "◆" : "◇"}</span>{active ? (locale === "en" ? "Saved" : "저장됨") : (locale === "en" ? "Save" : "저장")}
  </button>;
}
