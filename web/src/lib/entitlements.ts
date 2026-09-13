export type ContentTier = "FREE" | "DEEP_FILE" | "PREMIUM_COLLECTION" | "HIGH_RES_EVIDENCE";
export interface EntitlementRepository { canAccess(tier: ContentTier, contentId: string): Promise<boolean> }
export const freeReleaseEntitlements: EntitlementRepository = {
  async canAccess(tier) { return tier === "FREE"; },
};
