import { SermonBlock } from "./Block";
import { SermonDocument } from "./Document";
import { PageSettings, SermonPage, printableHeightPx } from "./Page";

function estimateBlockHeight(block: SermonBlock, settings: PageSettings): number {
  const charsPerLine = 54;
  const text = block.text.replace(/[#>*_`-]/g, "").trim();
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));

  const fontPx = settings.fontSizePt * 1.333;
  const linePx = fontPx * settings.lineHeight;
  const spacingPx = settings.paragraphSpacingPt * 1.333;

  let multiplier = 1;

  if (block.type === "title") multiplier = 1.8;
  if (block.type === "heading") multiplier = 1.5;
  if (block.type === "mainPoint") multiplier = 1.6;
  if (block.type === "scripture" || block.type === "quote") multiplier = 1.15;

  return lines * linePx * multiplier + spacingPx;
}

function keepWithNext(block: SermonBlock): boolean {
  return block.type === "heading" || block.type === "mainPoint" || block.type === "title";
}

export function paginateDocument(document: SermonDocument, settings: PageSettings): SermonPage[] {
  const availableHeight = printableHeightPx(settings);
  const pages: SermonPage[] = [
    {
      number: 1,
      blocks: [],
      usedHeightPx: 0,
      availableHeightPx: availableHeight,
    },
  ];

  function currentPage(): SermonPage {
    return pages[pages.length - 1];
  }

  function newPage(): SermonPage {
    const page: SermonPage = {
      number: pages.length + 1,
      blocks: [],
      usedHeightPx: 0,
      availableHeightPx: availableHeight,
    };
    pages.push(page);
    return page;
  }

  for (let index = 0; index < document.blocks.length; index++) {
    const block = document.blocks[index];
    const blockHeight = estimateBlockHeight(block, settings);

    let heightToFit = blockHeight;
    const next = document.blocks[index + 1];

    if (keepWithNext(block) && next) {
      heightToFit += estimateBlockHeight(next, settings);
    }

    if (currentPage().blocks.length > 0 && currentPage().usedHeightPx + heightToFit > availableHeight) {
      newPage();
    }

    currentPage().blocks.push(block);
    currentPage().usedHeightPx += blockHeight;
  }

  return pages;
}
