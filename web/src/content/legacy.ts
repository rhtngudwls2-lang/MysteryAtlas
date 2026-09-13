import catalogJson from "../../../app/src/main/assets/v2/catalog.json";
import imageRightsJson from "../../../app/src/main/assets/v2/image-rights.json";
import cooperJson from "../../../app/src/main/assets/v2/articles/cooper.json";
import dyatlovJson from "../../../app/src/main/assets/v2/articles/dyatlov.json";
import maryCelesteJson from "../../../app/src/main/assets/v2/articles/mary-celeste.json";
import phaistosJson from "../../../app/src/main/assets/v2/articles/phaistos.json";
import rohoncJson from "../../../app/src/main/assets/v2/articles/rohonc.json";
import voynichJson from "../../../app/src/main/assets/v2/articles/voynich.json";
import wowJson from "../../../app/src/main/assets/v2/articles/wow.json";
import type { CaseRecord, EvidenceClaim, EvidenceStatus, Localized, SourceRef } from "./schema";

type LegacyCopy = { en: string; ko: string };
type LegacyStory = (typeof catalogJson.cases)[number];
type LegacyArticle = typeof cooperJson;

const articles: Record<string, LegacyArticle> = {
  cooper: cooperJson,
  dyatlov: dyatlovJson as LegacyArticle,
  "mary-celeste": maryCelesteJson as LegacyArticle,
  phaistos: phaistosJson as LegacyArticle,
  rohonc: rohoncJson as LegacyArticle,
  voynich: voynichJson as LegacyArticle,
  wow: wowJson as LegacyArticle,
};

const imageRights = new Map(imageRightsJson.images.map((image) => [image.path, image]));

const unavailable: Localized = {
  en: "NOT VERIFIED — the V2 record did not include this field.",
  ko: "NOT VERIFIED — V2 레코드에 이 필드가 없었습니다.",
};

function sourceFor(article: LegacyArticle, ids: string[]): SourceRef {
  const source = article.sources.find((item) => ids.includes(item.id)) ?? article.sources[0];
  return source
    ? { title: source.title, publisher: source.publisher, url: source.url }
    : { title: "NOT VERIFIED", url: "#source-not-verified" };
}

function migrateClaim(article: LegacyArticle, evidence: LegacyArticle["evidence"][number]): EvidenceClaim {
  return {
    id: `v2-${evidence.id}`,
    claim: evidence.text as LegacyCopy,
    status: evidence.status as EvidenceStatus,
    statusQualifier: {
      en: "Legacy V2 classification; not a universal confidence score.",
      ko: "기존 V2 분류이며, 보편적인 신뢰도 점수가 아닙니다.",
    },
    reason: {
      en: "Migrated without strengthening the original V2 editorial judgment.",
      ko: "기존 V2 편집 판단을 더 강하게 바꾸지 않고 이관했습니다.",
    },
    source: sourceFor(article, evidence.sourceIds),
    sourceType: { en: "V2 source record — type not classified", ko: "V2 출처 기록 — 유형 미분류" },
    sourceDate: "NOT VERIFIED",
    establishes: evidence.text as LegacyCopy,
    doesNotEstablish: unavailable,
    counterEvidence: unavailable,
    lastVerified: article.verifiedAt,
    changeHistory: [{
      date: "2026-09-13",
      note: { en: "Migrated from the verified V2 record; no new factual claim added.", ko: "검증된 V2 레코드에서 이관했으며 새 사실 주장을 추가하지 않았습니다." },
    }],
  };
}

function mapStory(story: LegacyStory): CaseRecord {
  const article = articles[story.id];
  const rights = imageRights.get(story.image);
  return {
    slug: story.id,
    title: story.canonicalTitle,
    subtitle: story.headline,
    preview: article.summary,
    status: story.status,
    country: story.country,
    year: story.year,
    categories: story.categoryIds,
    tags: story.tags,
    aliases: story.aliases,
    people: story.persons.map((item) => item.name),
    places: story.locations.map((item) => item.name),
    dates: story.dates.map((item) => item.start),
    verifiedAt: article.verifiedAt,
    images: [{
      role: "HERO",
      path: `/${story.image}`,
      type: "EDITORIAL_RECONSTRUCTION",
      alt: rights?.alt ?? { en: `${story.canonicalTitle} editorial illustration`, ko: `${story.canonicalTitle} 편집 삽화` },
      caption: rights?.caption ?? { en: "Editorial illustration; not evidence.", ko: "편집 삽화이며 실제 증거가 아닙니다." },
      provenance: {
        en: `${rights?.rightsBasis ?? "DIRECTLY_GENERATED_FOR_THIS_PROJECT"}. ${rights?.limitations ?? "Not evidence."}`,
        ko: `이 프로젝트를 위해 직접 생성된 편집 이미지입니다. ${rights?.limitations ?? "실제 증거가 아닙니다."}`,
      },
    }],
    narrative: article.sections.map((section) => ({
      id: section.id,
      title: section.title,
      body: section.body,
      sourceIds: section.sourceIds,
    })),
    claims: article.evidence.map((evidence) => migrateClaim(article, evidence)),
    sources: article.sources,
    related: story.related.map((item) => ({ slug: item.caseId, question: item.reason })),
  };
}

export const legacyCases = catalogJson.cases.map(mapStory);
export const legacyCategories = catalogJson.categories.map((category) => ({
  id: category.id,
  name: category.name,
  hook: category.hook,
}));
