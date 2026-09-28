import articleIndex from "../../../shared/content/index.json";
import { productizedLoaders } from "./productized-loaders.generated";
import type { CaseRecord, Locale, Localized } from "./schema";
import { countryLabel } from "./taxonomy";

type LocaleCopy = { headline: string; hook: string; factBoundary?: { established: string; notEstablished: string }; blocks: ProductizedBlock[] };
export type ProductizedBlock = { blockId: string; type: string; headingKo: string; headingEn: string; textKo: string; textEn: string };
export type ProductizedSource = { sourceId: string; title: string; publisher: string; url: string; sourceType: string };
export type ProductizedClaim = { claimId: string; status: string; statementKo: string; statementEn: string; sourceRefs: string[] };
export type ProductizedVisual = {
  assetId: string; role: string; assetKind: string; rightsStatus: string;
  isDocumentaryEvidence: boolean; isReconstruction: boolean;
  captionKo: string; captionEn: string; altKo: string; altEn: string;
  sourceRefs: string[]; localizedFiles: Record<Locale, { fileName: string; sha256: string; width: number; height: number }>;
};
export type ProductizedArticle = {
  schemaVersion: string; canonicalId: string;
  identity: { canonicalTitleKo: string; canonicalTitleEn: string; aliasesKo: string[]; aliasesEn: string[] };
  publication: { tier: string; state: string; randomEligible: boolean; releaseEligible: boolean };
  localizedCopy: Record<Locale, LocaleCopy>;
  claims: ProductizedClaim[]; sources: ProductizedSource[]; visuals: ProductizedVisual[];
  metadata: { primaryGenre: string; secondaryGenres?: string[]; countries?: string[]; regions?: string[]; places?: Array<string | { name: string }>; people?: Array<string | { name: string }>; era?: string; resolution: string; relatedCases?: string[]; dateRange?: { start?: string; end?: string } };
};
type Summary = (typeof articleIndex.items)[number];
const entityName = (value: string | { name: string }): string => typeof value === "string" ? value : value.name;
export const productizedItems: Summary[] = articleIndex.items;
export const productizedIds = new Set(productizedItems.map((item) => item.canonicalId));
export const productizedSummary = (slug: string) => productizedItems.find((item) => item.canonicalId === slug);

export async function getProductizedArticle(slug: string): Promise<ProductizedArticle | undefined> {
  const loader = productizedLoaders[slug];
  if (!loader) return undefined;
  const loaded = await loader() as { default: ProductizedArticle };
  return loaded.default;
}

export function productizedCaseCard(item: Summary): CaseRecord {
  const country = item.countries.join(", ") || "Unknown";
  const title: Localized = { ko: item.title.ko, en: item.title.en };
  const subtitle: Localized = { ko: item.headline.ko, en: item.headline.en };
  const preview: Localized = { ko: item.hook.ko, en: item.hook.en };
  const start = item.dateRange.start ?? "";
  const date = /^\d{4}/.test(start) ? start.slice(0, 4) : item.era;
  return {
    id: item.canonicalId, slug: item.canonicalId, title: title.en, displayTitle: title,
    subtitle, preview, status: { ko: "연구 미리보기", en: "Research preview" },
    country: { ko: item.countries.map((name) => countryLabel(name, "ko")).join(", ") || "불명", en: country }, year: date,
    categories: [item.genre], tags: [item.genre, ...item.genres, item.era, item.resolution, ...item.regions],
    aliases: item.aliases, people: item.people.map(entityName), places: item.places.map(entityName),
    dates: [item.dateRange.start, item.dateRange.end].filter(Boolean).map(String),
    verifiedAt: "2026-09-27", readMinutesByLocale: item.readMinutes,
    images: [{
      id: item.heroAssetId, role: "HERO", path: `/media/${item.heroFile.en}`,
      localizedPaths: { ko: `/media/${item.heroFile.ko}`, en: `/media/${item.heroFile.en}` },
      type: "CONTEXT", alt: item.heroAlt, caption: item.heroCaption,
      provenance: { ko: "Mystery Atlas 자체 제작 맥락 그래픽. 당시 현장 증거 사진이 아닙니다.", en: "Mystery Atlas original context graphic; not an event photograph." },
      reconstruction: false,
    }],
    narrative: [], claims: [], sources: [], related: [], visualSequence: [],
    sourceModel: {
      canonical: { id: item.canonicalId, slug: item.canonicalId, canonicalTitle: title.en,
        aliases: item.aliases, countryKey: country.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
        era: item.era, categories: [item.genre], tags: [item.genre, ...item.genres], people: item.people.map(entityName),
        places: item.places.map(entityName), dates: [date], imagePlan: [] },
      locales: {
        ko: { subtitle: subtitle.ko, preview: preview.ko, status: "연구 미리보기", country, narrative: [] },
        en: { subtitle: subtitle.en, preview: preview.en, status: "Research preview", country, narrative: [] },
      },
    },
  };
}
