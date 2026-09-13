"use client";

import { useEffect, useState } from "react";
import { getMarket } from "@/config/market";
import type { Locale } from "@/content/schema";
import { trackEvent } from "@/lib/analytics";
import { localReactionRepository, type ReactionValue } from "@/lib/reaction-repository";

export function ReactionControl({ caseId, locale }: { caseId: string; locale: Locale }) {
  const [reaction, setReaction] = useState<ReactionValue>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setReaction(localReactionRepository.get(caseId)), 0);
    return () => window.clearTimeout(timer);
  }, [caseId]);
  const labels = getMarket(locale).reactionLabels;
  function choose(next: Exclude<ReactionValue, null>) {
    const value = reaction === next ? null : next;
    localReactionRepository.set(caseId, value);
    setReaction(value);
    trackEvent({ name: "reaction", caseId, locale, value: value ?? "cancelled" });
  }
  return <section className="reaction-panel" aria-labelledby={`reaction-${caseId}`}>
    <div><p className="section-number">REACTION</p><h2 id={`reaction-${caseId}`}>{locale === "en" ? "Was this file worth your time?" : "이 사건 파일은 읽을 가치가 있었나요?"}</h2><p>{locale === "en" ? "Stored only in this browser. No public counter is shown." : "이 브라우저에만 저장되며 공개 집계 수치는 표시하지 않습니다."}</p></div>
    <div className="reaction-buttons">
      <button type="button" aria-pressed={reaction === "positive"} onClick={() => choose("positive")}>＋ {labels.positive}</button>
      <button type="button" aria-pressed={reaction === "negative"} onClick={() => choose("negative")}>− {labels.negative}</button>
    </div>
  </section>;
}
