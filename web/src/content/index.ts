import { legacyCases, legacyCategories } from "./legacy";
import { cooperClaims, researchedCases } from "./researched";
import type { CaseRecord, CollectionRecord, Locale, Localized } from "./schema";

const L = (en: string, ko: string): Localized => ({ en, ko });

const upgradedLegacy = legacyCases.map((item) => item.slug === "cooper" ? {
  ...item,
  claims: cooperClaims,
  related: [
    { slug: "rendlesham", relationType: "evidence_pattern" as const, question: L("What does an official record establish without proving a cause?", "공식 기록은 원인을 입증하지 않고도 무엇을 보여주는가?") },
    { slug: "loch-ness", relationType: "evidence_pattern" as const, question: L("When does new evidence actually change an identification?", "새 근거는 언제 실제로 정체 판단을 바꾸는가?") },
    ...item.related,
  ],
} : item);

function countryKey(country: string) {
  return country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function materializeCase(record: CaseRecord): CaseRecord {
  const images = record.images.map((image, index) => ({
    ...image,
    id: image.id ?? `${record.slug}-${image.role.toLowerCase()}-${index + 1}`,
    reconstruction: image.reconstruction ?? image.type === "EDITORIAL_RECONSTRUCTION",
    sequence: image.sequence ?? index,
  }));
  const canonical = {
    id: record.id ?? record.slug,
    slug: record.slug,
    canonicalTitle: record.title,
    aliases: record.aliases,
    countryKey: countryKey(record.country.en),
    era: record.year,
    categories: record.categories,
    tags: record.tags,
    people: record.people,
    places: record.places,
    dates: record.dates,
    imagePlan: images.map((image) => ({ id: image.id, role: image.role, reconstruction: image.reconstruction, sequence: image.sequence })),
  };
  return {
    ...record,
    id: canonical.id,
    images,
    visualSequence: record.visualSequence ?? record.narrative.map((section, index) => {
      const imageId = section.imageIds?.find((id) => images.some((image) => image.id === id));
      return { id: `${record.slug}-beat-${section.id}`, sequence: index + 1, role: (["SCENE", "CONTEXT", "EVIDENCE"] as const)[index % 3], label: section.title, imageId, state: imageId ? "AVAILABLE" as const : "MISSING" as const };
    }),
    related: record.related.map((related) => ({ ...related, relationType: related.relationType ?? "question_based" })),
    sourceModel: {
      canonical,
      locales: {
        en: { subtitle: record.subtitle.en, preview: record.preview.en, status: record.status.en, country: record.country.en, narrative: record.narrative.map((section) => ({ ...section, title: section.title.en, body: section.body.en })) },
        ko: { subtitle: record.subtitle.ko, preview: record.preview.ko, status: record.status.ko, country: record.country.ko, narrative: record.narrative.map((section) => ({ ...section, title: section.title.ko, body: section.body.ko })) },
      },
    },
  };
}

function removeDuplicateHeroReuse(records: CaseRecord[]): CaseRecord[] {
  const usedPaths = new Set<string>();
  return records.map((record) => ({
    ...record,
    images: record.images.map((image) => {
      if (!image.path || !usedPaths.has(image.path)) {
        if (image.path) usedPaths.add(image.path);
        return image;
      }
      return {
        ...image,
        path: undefined,
        type: "PLACEHOLDER" as const,
        reconstruction: false,
        alt: L(`${record.title}: no distinct verified image available`, `${record.title}: 별도의 검증된 이미지 없음`),
        caption: L("A repeated cross-case illustration was withheld in this placement.", "사건 간 동일 이미지 반복을 피하기 위해 이 위치에서는 기존 공용 이미지를 표시하지 않습니다."),
        provenance: L("Intentional duplicate-reduction state; no replacement image was generated or sourced.", "중복 이미지 축소를 위한 의도적인 상태입니다. 대체 이미지를 생성하거나 외부에서 가져오지 않았습니다."),
      };
    }),
  }));
}

export const cases: CaseRecord[] = removeDuplicateHeroReuse([...upgradedLegacy, ...researchedCases]).map(materializeCase);
export const categories = legacyCategories;

export const collections: CollectionRecord[] = [
  {
    slug: "documents-under-pressure",
    title: L("Documents under pressure", "문서가 말하는 것과 말하지 않는 것"),
    description: L("Official records, manuscripts and inscriptions—read with their evidentiary limits intact.", "공식 기록, 필사본, 명문을 증거의 한계와 함께 읽습니다."),
    caseSlugs: ["rendlesham", "cooper", "voynich", "rohonc", "phaistos"],
  },
  {
    slug: "evidence-changes-the-story",
    title: L("When evidence changes the story", "근거가 이야기를 바꿀 때"),
    description: L("Cases where scientific models, recovered material, or source criticism narrowed the mystery without erasing it.", "과학 모델, 회수된 물증, 출처 비평이 미스터리를 지우지 않으면서 범위를 좁힌 사건들입니다."),
    caseSlugs: ["loch-ness", "dyatlov", "mary-celeste", "wow"],
  },
  {
    slug: "identity-without-an-answer",
    title: L("Identity without an answer", "정체를 둘러싼 미해결 질문"),
    description: L("What survives after a famous name, image, or explanation is tested?", "유명한 이름, 이미지, 설명을 검증한 뒤 무엇이 남는지 살펴봅니다."),
    caseSlugs: ["cooper", "loch-ness", "wow"],
  },
];

export const caseBySlug = (slug: string) => cases.find((item) => item.slug === slug);
export const collectionBySlug = (slug: string) => collections.find((item) => item.slug === slug);
export const locales: Locale[] = ["en", "ko"];
