import { ResolvedLayout } from "./engine";

const PX_PER_INCH = 96;

export interface BlockPageBreak {
  pageNumber: number;
  topPx: number;
  spacerBefore: HTMLElement;
}

function px(value: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function outerHeight(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const styles = window.getComputedStyle(el);
  return rect.height + px(styles.marginTop) + px(styles.marginBottom);
}

function isRealBlock(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.classList.contains("sermonprint-page-spacer")) return false;
  if (el.classList.contains("sermonprint-page-gap-label")) return false;
  if (el.offsetHeight <= 0) return false;
  return true;
}

function isHeading(el: HTMLElement): boolean {
  return /^H[1-4]$/.test(el.tagName);
}

function blockHeightWithNext(blocks: HTMLElement[], index: number): number {
  const current = blocks[index];
  let height = outerHeight(current);

  if (isHeading(current) && blocks[index + 1]) {
    height += outerHeight(blocks[index + 1]);
  }

  return height;
}

export function clearBlockPagination(editorEl: HTMLElement): void {
  editorEl.querySelectorAll(".sermonprint-page-spacer").forEach((el) => el.remove());
}

export function paginateBlocks(editorEl: HTMLElement, layout: ResolvedLayout): number {
  clearBlockPagination(editorEl);

  const pageHeightPx = layout.pageHeightIn * PX_PER_INCH;
  const marginPx = layout.marginIn * PX_PER_INCH;
  const printableHeightPx = pageHeightPx - marginPx * 2;

  const blocks = Array.from(editorEl.children).filter(isRealBlock);

  let page = 1;
  let usedOnPage = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const heightToKeep = blockHeightWithNext(blocks, i);
    const blockHeight = outerHeight(block);

    const shouldBreak =
      usedOnPage > 0 &&
      heightToKeep > 0 &&
      usedOnPage + heightToKeep > printableHeightPx;

    if (shouldBreak) {
      const spacerHeight = Math.max(24, pageHeightPx - usedOnPage);

      const spacer = document.createElement("div");
      spacer.className = "sermonprint-page-spacer";
      spacer.contentEditable = "false";
      spacer.style.height = `${spacerHeight}px`;

      const label = document.createElement("span");
      label.className = "sermonprint-page-gap-label";
      label.textContent = `Page ${page + 1}`;
      spacer.appendChild(label);

      editorEl.insertBefore(spacer, block);

      page += 1;
      usedOnPage = 0;
    }

    usedOnPage += blockHeight;
  }

  return page;
}
