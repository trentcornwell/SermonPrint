import { SermonPrintSettings } from "../settings";

export type PageSizePreset = "half-sheet" | "letter" | "a4" | "legal" | "custom";

export interface ResolvedLayout {
  preset: PageSizePreset;
  pageWidthIn: number;
  pageHeightIn: number;
  marginIn: number;
  printableWidthIn: number;
  printableHeightIn: number;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
  paragraphSpacingIn: number;
  h1AfterIn: number;
  h2BeforeIn: number;
  h2AfterIn: number;
  h3BeforeIn: number;
  h3AfterIn: number;
  blockSpacingIn: number;
  listSpacingIn: number;
  verseColor: string;
}

export function parseInches(value: string | number | undefined, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace("in", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePoints(value: string | number | undefined, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace("pt", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveLayout(settings: SermonPrintSettings): ResolvedLayout {
  const pageWidthIn = parseInches(settings.pageWidth, 5.5);
  const pageHeightIn = parseInches(settings.pageHeight, 8.5);
  const marginIn = parseInches(settings.margin, 0.58);
  const fontSizePt = parsePoints(settings.fontSize, 12.5);
  const lineHeight = Number(settings.lineHeight) || 1.65;

  return {
    preset: settings.pageSizePreset || "half-sheet",
    pageWidthIn,
    pageHeightIn,
    marginIn,
    printableWidthIn: Math.max(1, pageWidthIn - marginIn * 2),
    printableHeightIn: Math.max(1, pageHeightIn - marginIn * 2),
    fontFamily: settings.fontFamily || "Georgia",
    fontSizePt,
    lineHeight,
    paragraphSpacingIn: 0.2,
    h1AfterIn: 0.22,
    h2BeforeIn: 0.34,
    h2AfterIn: 0.16,
    h3BeforeIn: 0.28,
    h3AfterIn: 0.13,
    blockSpacingIn: 0.22,
    listSpacingIn: 0.18,
    verseColor: settings.bibleVerseColor || "#8b0000"
  };
}

export function applyLayoutVariables(target: HTMLElement, settings: SermonPrintSettings): ResolvedLayout {
  const layout = resolveLayout(settings);
  target.style.setProperty("--sp-page-width", `${layout.pageWidthIn}in`);
  target.style.setProperty("--sp-page-height", `${layout.pageHeightIn}in`);
  target.style.setProperty("--sp-page-margin", `${layout.marginIn}in`);
  target.style.setProperty("--sp-printable-width", `${layout.printableWidthIn}in`);
  target.style.setProperty("--sp-printable-height", `${layout.printableHeightIn}in`);
  target.style.setProperty("--sp-font-family", `${layout.fontFamily}, Georgia, serif`);
  target.style.setProperty("--sp-font-size", `${layout.fontSizePt}pt`);
  target.style.setProperty("--sp-line-height", String(layout.lineHeight));
  target.style.setProperty("--sp-paragraph-space", `${layout.paragraphSpacingIn}in`);
  target.style.setProperty("--sp-verse-color", layout.verseColor);
  return layout;
}

export function pageSizeForPreset(preset: PageSizePreset): { width: string; height: string } {
  if (preset === "letter") return { width: "8.5in", height: "11in" };
  if (preset === "legal") return { width: "8.5in", height: "14in" };
  if (preset === "a4") return { width: "8.27in", height: "11.69in" };
  return { width: "5.5in", height: "8.5in" };
}
