import { describe, expect, it } from "vitest";
import { normalizeReaderTone } from "../../src/lib/reader-preferences";
import { editorialPhoto, photoRecord } from "../../src/content/editorial-media";
import recommendations from "../../../shared/editorial/home-recommendations.json";
describe("ABC reader migration", () => {
  it("defaults new and legacy dark users to ivory while retaining explicit new themes", () => {
    expect(normalizeReaderTone(undefined)).toBe("ivory");
    for (const tone of ["dark", "dim", "warm"]) expect(normalizeReaderTone(tone)).toBe("ivory");
    for (const tone of ["ivory", "warmgray", "midnight"]) expect(normalizeReaderTone(tone)).toBe(tone);
  });
  it("allows only the supplied documentary photo for a cover", () => {
    expect(editorialPhoto("romanov-remains-dna")).toBeTruthy();
    expect(editorialPhoto("roswell")).toBeUndefined();
    expect(photoRecord.isDocumentaryEvidence).toBe(false);
    expect(photoRecord.width / photoRecord.height).toBeCloseTo(3711 / 3281);
  });
  it("keeps the three home IDs and accepts only the explicit reviewed card photographs", () => {
    expect(recommendations.caseIds).toEqual(["antikythera-mechanism", "princes-in-the-tower", "hubble-tension"]);
    expect(editorialPhoto("romanov-remains-dna", "THUMBNAIL")?.role).toBe("THUMBNAIL");
    for (const id of recommendations.caseIds) {
      expect(editorialPhoto(id, "THUMBNAIL")?.type).toBe("EXTERNAL_REVIEWED_PHOTOGRAPH");
      expect(editorialPhoto(id, "HERO")?.type).toBe("EXTERNAL_REVIEWED_PHOTOGRAPH");
    }
    expect(editorialPhoto("roswell", "THUMBNAIL")).toBeUndefined();
  });
});
