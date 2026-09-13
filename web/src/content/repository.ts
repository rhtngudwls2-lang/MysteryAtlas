import type { CaseRecord, Locale } from "./schema";

export interface ContentRepository {
  list(locale: Locale): Promise<CaseRecord[]>;
  get(slug: string, locale: Locale): Promise<CaseRecord | undefined>;
}

export class StaticContentRepository implements ContentRepository {
  constructor(private readonly records: CaseRecord[]) {}
  async list(locale: Locale) { void locale; return this.records; }
  async get(slug: string, locale: Locale) { void locale; return this.records.find((record) => record.slug === slug); }
}
