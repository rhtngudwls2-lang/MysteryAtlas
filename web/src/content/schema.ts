export type Locale = "en" | "ko";
export type SupportedLocale = Locale | "ja" | "zh-Hans" | "zh-Hant" | "es" | "pt" | "th" | "de" | "fr";
export type Localized = Record<Locale, string> & Partial<Record<SupportedLocale, string>>;

export const t = (value: Localized, locale: Locale) => value[locale] || value.en;
export type EvidenceStatus = "CONFIRMED" | "SUPPORTED" | "DISPUTED" | "ALLEGED" | "UNVERIFIED" | "DEBUNKED" | "OUTDATED" | "CLAIM";
export type ImageRole = "HERO" | "SCENE" | "EVIDENCE" | "CONTEXT" | "THUMBNAIL" | "RELATED";
export type RelationType = "similar_case" | "same_country" | "same_era" | "same_theme" | "related_person" | "related_place" | "derived_conspiracy" | "skeptical_explanation" | "evidence_pattern" | "question_based";

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
  id?: string;
  role: ImageRole;
  path?: string;
  type: "EDITORIAL_RECONSTRUCTION" | "HISTORICAL_MATERIAL" | "CONTEXT" | "PLACEHOLDER";
  alt: Localized;
  caption: Localized;
  provenance: Localized;
  reconstruction?: boolean;
  sequence?: number;
  sourceUrl?: string;
}

export interface NarrativeSection {
  id: string;
  title: Localized;
  body: Localized;
  sourceIds: string[];
  imageIds?: string[];
}

export interface VisualBeat {
  id: string;
  sequence: number;
  role: Extract<ImageRole, "SCENE" | "EVIDENCE" | "CONTEXT">;
  label: Localized;
  imageId?: string;
  state: "AVAILABLE" | "MISSING";
}

export interface RelatedCase {
  slug: string;
  question: Localized;
  relationType?: RelationType;
  context?: Localized;
}

export interface CaseCanonicalData {
  id: string;
  slug: string;
  canonicalTitle: string;
  aliases: string[];
  countryKey: string;
  era: string;
  categories: string[];
  tags: string[];
  people: string[];
  places: string[];
  dates: string[];
  imagePlan: Array<{ id: string; role: ImageRole; reconstruction: boolean; sequence: number }>;
}

export interface CaseLocaleContent {
  subtitle: string;
  preview: string;
  status: string;
  country: string;
  narrative: Array<Omit<NarrativeSection, "title" | "body"> & { title: string; body: string }>;
}

export interface CaseRecord {
  id?: string;
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
  visualSequence?: VisualBeat[];
  sourceModel?: {
    canonical: CaseCanonicalData;
    locales: Record<Locale, CaseLocaleContent>;
  };
}


export interface CollectionRecord {
  slug: string;
  title: Localized;
  description: Localized;
  caseSlugs: string[];
}
