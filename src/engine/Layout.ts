export const INCH_TO_PX = 96;
export const PT_TO_PX = 1.333;

export type PageSizePreset = "half-sheet" | "letter" | "a4" | "legal" | "custom";

export interface PagePreset {
  width: string;
  height: string;
}

export const PAGE_PRESETS: Record<Exclude<PageSizePreset, "custom">, PagePreset> = {
  "half-sheet": {
    width: "5.5in",
    height: "8.5in",
  },
  letter: {
    width: "8.5in",
    height: "11in",
  },
  legal: {
    width: "8.5in",
    height: "14in",
  },
  a4: {
    width: "8.27in",
    height: "11.69in",
  },
};

export function getPagePreset(value: PageSizePreset): PagePreset | null {
  if (value === "custom") return null;
  return PAGE_PRESETS[value];
}

export function parsePositiveInches(value: string, fallback: number): number {
  const parsed = Number(String(value).replace("in", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseInches(value: string, fallback: number): number {
  const parsed = Number(String(value).replace("in", "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parsePositivePoints(value: string, fallback: number): number {
  const parsed = Number(String(value).replace("pt", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function inchesToPx(value: number): number {
  return value * INCH_TO_PX;
}
