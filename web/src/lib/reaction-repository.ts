export type ReactionValue = "positive" | "negative" | null;

export interface ReactionRepository {
  get(caseId: string): ReactionValue;
  set(caseId: string, value: ReactionValue): void;
}

const storageKey = "mystery-atlas:v3:reactions";

export const localReactionRepository: ReactionRepository = {
  get(caseId) {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "{}")[caseId] ?? null; } catch { return null; }
  },
  set(caseId, value) {
    if (typeof window === "undefined") return;
    let current: Record<string, Exclude<ReactionValue, null>> = {};
    try { current = JSON.parse(localStorage.getItem(storageKey) ?? "{}"); } catch { /* replace invalid local state */ }
    if (value) current[caseId] = value; else delete current[caseId];
    localStorage.setItem(storageKey, JSON.stringify(current));
  },
};
