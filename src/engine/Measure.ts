import { SermonBlock } from "./Block";
import { PageSettings } from "./Page";

export interface MeasuredBlock {
  block: SermonBlock;
  estimatedHeightPx: number;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s?/, "")
    .replace(/\*\*/g, "")
    .trim();
}

export function estimateBlockHeight(block: SermonBlock, settings: PageSettings): number {
  const text = stripMarkdown(block.text);
  const printableWidthIn = settings.widthIn - settings.marginLeftIn - settings.marginRightIn;

  const fontPx = settings.fontSizePt * 1.333;
  const linePx = fontPx * settings.lineHeight;
  const charsPerLine = Math.max(28, Math.floor(printableWidthIn * 12.5));

  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  const spacingPx = settings.paragraphSpacingPt * 1.333;

  switch (block.type) {
    case "title":
      return linePx * 2.3 + spacingPx * 1.5;
    case "heading":
    case "mainPoint":
      return linePx * 1.9 + spacingPx * 1.4;
    case "scripture":
    case "quote":
      return lines * linePx * 1.08 + spacingPx * 1.5;
    default:
      return lines * linePx + spacingPx;
  }
}

export function measureBlocks(blocks: SermonBlock[], settings: PageSettings): MeasuredBlock[] {
  return blocks.map((block) => ({
    block,
    estimatedHeightPx: estimateBlockHeight(block, settings),
  }));
}
