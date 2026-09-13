export type Locale = "en" | "ko";
export type Localized = Record<Locale, string>;

export const t = (value: Localized, locale: Locale) => value[locale] || value.en;
export type EvidenceStatus = "CONFIRMED" | "SUPPORTED" | "DISPUTED" | "ALLEGED" | "UNVERIFIED" | "DEBUNKED" | "OUTDATED" | "CLAIM";
export type ImageRole = "HERO" | "SCENE" | "EVIDENCE" | "CONTEXT";

export interface SourceRef {
  title: string;
  publisher?: string;
  url: string;
}

export interface ChangeRecord {
  date: string;
  note: Localized;
}

export interface EvidenceClaim {
  id: string;
  claim: Localized;
  status: EvidenceStatus;
  statusQualifier?: Localized;
  reason: Localized;
  source: SourceRef;
  sourceType: Localized;
  sourceDate: string;
  establishes: Localized;
  doesNotEstablish: Localized;
  counterEvidence: Localized;
  counterSource?: SourceRef;
  lastVerified: string;
  changeHistory: ChangeRecord[];
}

export interface CaseImage {
  role: ImageRole;
  path?: string;
  type: "EDITORIAL_RECONSTRUCTION" | "HISTORICAL_MATERIAL" | "CONTEXT" | "PLACEHOLDER";
  alt: Localized;
  caption: Localized;
  provenance: Localized;
}

export interface NarrativeSection {
  id: string;
  title: Localized;
  body: Localized;
  sourceIds: string[];
}

export interface RelatedCase {
  slug: string;
  question: Localized;
}

export interface CaseRecord {
  slug: string;
  title: string;
  subtitle: Localized;
  preview: Localized;
  status: Localized;
  country: Localized;
  year: string;
  categories: string[];
  tags: string[];
  aliases: string[];
  people: string[];
  places: string[];
  dates: string[];
  verifiedAt: string;
  images: CaseImage[];
  narrative: NarrativeSection[];
  claims: EvidenceClaim[];
  sources: Array<SourceRef & { id: string; accessedAt: string }>;
  related: RelatedCase[];
}

export interface CollectionRecord {
  slug: string;
  title: Localized;
  description: Localized;
  caseSlugs: string[];
}

export interface CollectionRecord {
  slug: string;
  title: Localized;
  description: Localized;
  caseSlugs: string[];
}
