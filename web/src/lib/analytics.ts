export type ProductEventName = "card_impression" | "case_open" | "preview_open" | "scroll_depth" | "evidence_interaction" | "source_click" | "rabbit_hole_click" | "save" | "reaction" | "collection_open" | "search" | "share";

export interface ProductEvent {
  name: ProductEventName;
  caseId?: string;
  collectionId?: string;
  locale?: string;
  value?: string | number;
}

export interface AnalyticsAdapter { track(event: ProductEvent): void }

class NoopAnalytics implements AnalyticsAdapter {
  track(event: ProductEvent) { void event; /* Intentionally empty until an approved provider exists. */ }
}

let adapter: AnalyticsAdapter = new NoopAnalytics();
export const configureAnalytics = (next: AnalyticsAdapter) => { adapter = next; };
export const trackEvent = (event: ProductEvent) => adapter.track(event);
