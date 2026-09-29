import { describe, expect, it } from "vitest";
import { cases, collections } from "../../src/content";
import { readingMinutes, readingStrategies } from "../../src/lib/reading-time";
import { searchCases } from "../../src/lib/search";
import { marketConfig, supportedLocales } from "../../src/config/market";
import { getProductizedArticle, productizedItems } from "../../src/content/productized";

describe("release content", () => {
  it("adds all 232 durable articles while preserving the nine-case U1 baseline", () => {
    expect(productizedItems).toHaveLength(232);
    expect(cases).toHaveLength(241);
    expect(new Set(cases.map((item) => item.slug)).size).toBe(cases.length);
    expect(cases.some((item) => item.slug === "cooper")).toBe(true);
  });

  it("keeps KO/EN blocks and original visual roles paired within the same canonical dossier", async () => {
    const article = await getProductizedArticle("romanov-remains-dna");
    expect(article?.localizedCopy.ko.blocks.map((block) => block.blockId)).toEqual(article?.localizedCopy.en.blocks.map((block) => block.blockId));
    expect(article?.visuals.every((visual) => visual.localizedFiles.ko.fileName.endsWith("__ko.png") && visual.localizedFiles.en.fileName.endsWith("__en.png"))).toBe(true);
    expect(article?.publication.randomEligible).toBe(false);
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
    expect(readingStrategies.en.unitsPerMinute).not.toBe(readingStrategies.ko.unitsPerMinute);
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

  it("materializes canonical, locale, image-role and visual-flow data", () => {
    for (const record of cases) {
      expect(record.id).toBe(record.slug);
      expect(record.sourceModel?.canonical.id).toBe(record.slug);
      expect(record.sourceModel?.locales.en.preview).toBe(record.preview.en);
      expect(record.sourceModel?.locales.ko.preview).toBe(record.preview.ko);
      expect(record.images.every((image) => image.id && typeof image.reconstruction === "boolean")).toBe(true);
      expect(record.visualSequence).toHaveLength(record.narrative.length);
      expect(record.related.every((edge) => edge.relationType)).toBe(true);
    }
    const visiblePaths = cases.flatMap((record) => record.images.flatMap((image) => image.path ? [image.path] : []));
    expect(new Set(visiblePaths).size).toBe(visiblePaths.length);
  });

  it("keeps market identity and future locales in configuration", () => {
    expect(marketConfig.en.publicDisplayName).toBeTruthy();
    expect(marketConfig.ko.reactionLabels.positive).toBe("좋아요");
    expect(supportedLocales).toEqual(expect.arrayContaining(["ja", "zh-Hans", "zh-Hant", "es", "pt", "th", "de", "fr"]));
  });

  it("search accepts a 100-case data set without implementation changes", () => {
    const seed = cases[0];
    const expanded = Array.from({ length: 100 }, (_, index) => ({ ...seed, id: `scale-${index}`, slug: `scale-${index}`, title: `Scale Case ${index}`, aliases: [`Expansion ${index}`] }));
    expect(searchCases("Expansion 99", "en", expanded)[0].slug).toBe("scale-99");
    expect(searchCases("", "en", expanded)).toHaveLength(100);
  });
});
