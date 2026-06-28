import { SermonBlock } from "./Block";
import { SermonDocument } from "./Document";
import { PageSettings, SermonPage, printableHeightPx } from "./Page";
import { estimateBlockHeight } from "./Measure";

export type MeasureBlock = (block: SermonBlock, settings: PageSettings) => number;

function keepWithNext(block: SermonBlock): boolean {
  return block.type === "title" || block.type === "heading" || block.type === "mainPoint";
}

function newPage(number: number, availableHeightPx: number): SermonPage {
  return {
    number,
    blocks: [],
    usedHeightPx: 0,
    availableHeightPx,
  };
}

export function paginateDocument(document: SermonDocument, settings: PageSettings, measureBlock: MeasureBlock = estimateBlockHeight): SermonPage[] {
  const availableHeight = printableHeightPx(settings);
  const pages: SermonPage[] = [newPage(1, availableHeight)];

  let current = pages[0];

  for (let index = 0; index < document.blocks.length; index++) {
    const block = document.blocks[index];
    const blockHeight = measureBlock(block, settings);

    let heightToFit = blockHeight;
    const next = document.blocks[index + 1];

    if (keepWithNext(block) && next) {
      heightToFit += measureBlock(next, settings);
    }

    const doesNotFit = current.blocks.length > 0 && current.usedHeightPx + heightToFit > availableHeight;

    if (doesNotFit) {
      current = newPage(pages.length + 1, availableHeight);
      pages.push(current);
    }

    current.blocks.push(block);
    current.usedHeightPx += blockHeight;
  }

  return pages;
}
