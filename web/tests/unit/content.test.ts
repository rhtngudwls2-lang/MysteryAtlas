import { describe, expect, it } from "vitest";
import { cases, collections } from "../../src/content";
import { readingMinutes } from "../../src/lib/reading-time";
import { searchCases } from "../../src/lib/search";

describe("release content", () => {
  it("ships exactly the approved nine-case catalog", () => {
    expect(cases).toHaveLength(9);
    expect(new Set(cases.map((item) => item.slug)).size).toBe(9);
  });

  it("preserves all 15 researched V3 claims", () => {
    const ids = cases.flatMap((item) => item.claims.map((claim) => claim.id));
    expect(ids.filter((id) => /^[CRL]\d{2}$/.test(id)).sort()).toEqual([
      "C01", "C02", "C03", "C04", "C05", "L01", "L02", "L03", "L04", "L05", "R01", "R02", "R03", "R04", "R05",
    ]);
  });

  it("renders every required V3 evidence field without filling unknown source dates", () => {
    for (const claim of cases.flatMap((item) => item.claims)) {
      expect(claim.claim.en).toBeTruthy();
      expect(claim.claim.ko).toBeTruthy();
      expect(claim.reason.en).toBeTruthy();
      expect(claim.source.title).toBeTruthy();
      expect(claim.sourceType.en).toBeTruthy();
      expect(claim.sourceDate).toBeTruthy();
      expect(claim.establishes.ko).toBeTruthy();
      expect(claim.doesNotEstablish.ko).toBeTruthy();
      expect(claim.counterEvidence.en).toBeTruthy();
      expect(claim.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(claim.changeHistory.length).toBeGreaterThan(0);
    }
    expect(cases.flatMap((item) => item.claims).some((claim) => claim.sourceDate === "NOT VERIFIED")).toBe(true);
  });

  it("calculates reading time from rendered content", () => {
    const cooper = cases.find((item) => item.slug === "cooper")!;
    expect(readingMinutes(cooper, "en")).toBeGreaterThan(1);
    expect(readingMinutes(cooper, "ko")).toBeGreaterThan(1);
  });

  it("searches title, alias, people, place, dates, tags and categories", () => {
    expect(searchCases("Nessie", "en")[0].slug).toBe("loch-ness");
    expect(searchCases("Charles Halt", "en")[0].slug).toBe("rendlesham");
    expect(searchCases("1981-01-13", "en")[0].slug).toBe("rendlesham");
    expect(searchCases("암호", "ko").some((item) => item.slug === "voynich")).toBe(true);
  });

  it("keeps every collection and rabbit-hole edge valid", () => {
    const slugs = new Set(cases.map((item) => item.slug));
    expect(collections.every((item) => item.caseSlugs.every((slug) => slugs.has(slug)))).toBe(true);
    expect(cases.every((item) => item.related.every((edge) => slugs.has(edge.slug)))).toBe(true);
  });
});
