export interface CommunitySubmission {
  id: string;
  caseId?: string;
  body: string;
  sourceUrl?: string;
  status: "USER_SUBMISSION" | "UNDER_REVIEW" | "REJECTED";
}

export const evidencePromotionPolicy = "EDITORIAL_REVIEW_REQUIRED" as const;
