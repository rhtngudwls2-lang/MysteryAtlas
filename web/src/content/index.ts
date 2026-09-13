import { legacyCases, legacyCategories } from "./legacy";
import { cooperClaims, researchedCases } from "./researched";
import type { CaseRecord, CollectionRecord, Locale, Localized } from "./schema";

const L = (en: string, ko: string): Localized => ({ en, ko });

const upgradedLegacy = legacyCases.map((item) => item.slug === "cooper" ? {
  ...item,
  claims: cooperClaims,
  related: [
    { slug: "rendlesham", question: L("What does an official record establish without proving a cause?", "공식 기록은 원인을 입증하지 않고도 무엇을 보여주는가?") },
    { slug: "loch-ness", question: L("When does new evidence actually change an identification?", "새 근거는 언제 실제로 정체 판단을 바꾸는가?") },
    ...item.related,
  ],
} : item);

export const cases: CaseRecord[] = [...upgradedLegacy, ...researchedCases];
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
