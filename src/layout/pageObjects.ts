export interface SermonPrintPageSettings {
  pageWidthIn: number;
  pageHeightIn: number;
  marginTopIn: number;
  marginRightIn: number;
  marginBottomIn: number;
  marginLeftIn: number;
}

export interface SermonPrintBlock {
  id: string;
  markdown: string;
  html: string;
  estimatedHeightPx: number;
}

export interface SermonPrintPage {
  pageNumber: number;
  blocks: SermonPrintBlock[];
  usedHeightPx: number;
  availableHeightPx: number;
}

export function inchesToPx(inches: number): number {
  return inches * 96;
}

export function getDefaultPageSettings(): SermonPrintPageSettings {
  return {
    pageWidthIn: 5.5,
    pageHeightIn: 8.5,
    marginTopIn: 0.55,
    marginRightIn: 0.55,
    marginBottomIn: 0.55,
    marginLeftIn: 0.55,
  };
}

export function getPrintableHeightPx(settings: SermonPrintPageSettings): number {
  return inchesToPx(settings.pageHeightIn - settings.marginTopIn - settings.marginBottomIn);
}
