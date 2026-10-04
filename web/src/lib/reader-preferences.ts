export const readerTones = ["ivory", "warmgray", "midnight"] as const;
export type ReaderTone = typeof readerTones[number] | "dark" | "dim" | "warm";
export function normalizeReaderTone(value: unknown): ReaderTone {
  return typeof value === "string" && [...readerTones, "dark", "dim", "warm"].includes(value) ? value as ReaderTone : "ivory";
}
