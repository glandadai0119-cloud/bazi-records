import type { BaziRecord } from "@/data/mock-records";

const STORAGE_KEY = "bazi_records";
const LEGACY_STORAGE_KEY = "bazi-records-list";

export function getStoredRecords(): BaziRecord[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is BaziRecord => {
      if (!item || typeof item !== "object") {
        return false;
      }
      const record = item as Record<string, unknown>;
      const isValidInputMode =
        record.inputMode === undefined ||
        record.inputMode === "solar" ||
        record.inputMode === "lunar" ||
        record.inputMode === "pillars" ||
        record.inputMode === "date" ||
        record.inputMode === "ganzhi";
      const pillars = record.pillars as Record<string, unknown> | undefined;
      const hasValidReferenceSolarDateTime =
        record.referenceSolarDateTime === undefined ||
        typeof record.referenceSolarDateTime === "string";
      const hasValidPillars =
        pillars === undefined ||
        (typeof pillars === "object" &&
          typeof pillars.year === "string" &&
          typeof pillars.month === "string" &&
          typeof pillars.day === "string" &&
          typeof pillars.time === "string");
      return (
        typeof record.id === "string" &&
        typeof record.name === "string" &&
        (record.gender === "男" || record.gender === "女") &&
        typeof record.birthDate === "string" &&
        typeof record.birthTime === "string" &&
        isValidInputMode &&
        hasValidReferenceSolarDateTime &&
        hasValidPillars &&
        typeof record.notes === "string" &&
        typeof record.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function saveRecords(records: BaziRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function appendRecord(record: BaziRecord): BaziRecord[] {
  const current = getStoredRecords();
  const next = [record, ...current];
  saveRecords(next);
  return next;
}

export function getStoredRecordById(id: string): BaziRecord | null {
  if (!id) {
    return null;
  }
  const records = getStoredRecords();
  return records.find((record) => record.id === id) ?? null;
}

export function removeStoredRecordById(id: string): BaziRecord[] {
  const current = getStoredRecords();
  const next = current.filter((record) => record.id !== id);
  saveRecords(next);
  return next;
}
