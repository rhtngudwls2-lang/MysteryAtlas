import type { Locale } from "@/content/schema";

const dictionary = {
  en: {
    home: "Home", explore: "Explore", search: "Search", collections: "Collections", saved: "Saved",
    about: "About", methodology: "Methodology", editorial: "Editorial policy", evidence: "Evidence file",
    sources: "Sources", rabbit: "Follow the question", save: "Save", savedLabel: "Saved", share: "Share",
    reading: "min read", verified: "Last verified", establishes: "What this establishes", notEstablish: "What this does not establish",
    counter: "Counterevidence", history: "Change history", allCases: "All cases", noResults: "No matching cases.",
  },
  ko: {
    home: "홈", explore: "탐색", search: "검색", collections: "컬렉션", saved: "저장됨",
    about: "소개", methodology: "검증 방법", editorial: "편집 정책", evidence: "근거 파일",
    sources: "출처", rabbit: "질문을 따라가기", save: "저장", savedLabel: "저장됨", share: "공유",
    reading: "분 읽기", verified: "마지막 검증", establishes: "이 근거가 입증하는 것", notEstablish: "입증하지 않는 것",
    counter: "반대 근거", history: "변경 이력", allCases: "전체 사건", noResults: "일치하는 사건이 없습니다.",
  },
} as const;

export const copy = (locale: Locale) => dictionary[locale];
