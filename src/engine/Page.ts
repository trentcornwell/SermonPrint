import { SermonBlock } from "./Block";
import { inchesToPx } from "./Layout";

export interface PageSettings {
  widthIn: number;
  heightIn: number;
  marginTopIn: number;
  marginRightIn: number;
  marginBottomIn: number;
  marginLeftIn: number;
  fontSizePt: number;
  lineHeight: number;
  paragraphSpacingPt: number;
}

export interface SermonPage {
  number: number;
  blocks: SermonBlock[];
  usedHeightPx: number;
  availableHeightPx: number;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  widthIn: 5.5,
  heightIn: 8.5,
  marginTopIn: 0.55,
  marginRightIn: 0.55,
  marginBottomIn: 0.55,
  marginLeftIn: 0.55,
  fontSizePt: 13,
  lineHeight: 1.45,
  paragraphSpacingPt: 8,
};

export function printableHeightPx(settings: PageSettings): number {
  return inchesToPx(settings.heightIn - settings.marginTopIn - settings.marginBottomIn);
}
