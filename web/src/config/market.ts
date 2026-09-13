import type { Locale, SupportedLocale } from "@/content/schema";

export interface MarketConfig {
  locale: Locale;
  publicDisplayName: string;
  shortName: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  shareCopy: string;
  featuredCollections: string[];
  localHookCases: string[];
  reactionLabels: { positive: string; negative: string };
}

export const supportedLocales: SupportedLocale[] = ["en", "ko", "ja", "zh-Hans", "zh-Hant", "es", "pt", "th", "de", "fr"];
export const activeLocales: Locale[] = ["en", "ko"];

export const marketConfig: Record<Locale, MarketConfig> = {
  en: {
    locale: "en", publicDisplayName: "Mystery Atlas", shortName: "MA",
    tagline: "Stories with their evidentiary limits intact.", seoTitle: "Mystery Atlas",
    seoDescription: "Mystery stories with evidence, counterevidence, and source boundaries.",
    shareCopy: "Follow the evidence in", featuredCollections: ["documents-under-pressure", "evidence-changes-the-story", "identity-without-an-answer"],
    localHookCases: ["cooper", "rendlesham", "loch-ness"], reactionLabels: { positive: "Worth reading", negative: "Not for me" },
  },
  ko: {
    locale: "ko", publicDisplayName: "Mystery Atlas", shortName: "MA",
    tagline: "이야기와 근거의 한계를 함께 읽습니다.", seoTitle: "Mystery Atlas",
    seoDescription: "미스터리의 이야기와 근거, 반대 근거, 출처의 한계를 함께 읽습니다.",
    shareCopy: "근거를 따라 읽는 미스터리", featuredCollections: ["documents-under-pressure", "evidence-changes-the-story", "identity-without-an-answer"],
    localHookCases: ["cooper", "rendlesham", "loch-ness"], reactionLabels: { positive: "좋아요", negative: "별로예요" },
  },
};

export const getMarket = (locale: Locale) => marketConfig[locale];
