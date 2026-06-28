import { ResolvedLayout } from "./engine";

const PX_PER_INCH = 96;

export interface DomPage {
  pageNumber: number;
  topPx: number;
  heightPx: number;
  printableTopPx: number;
  printableBottomPx: number;
}

export function paginateDom(contentEl: HTMLElement, layout: ResolvedLayout): DomPage[] {
  const pageHeightPx = layout.pageHeightIn * PX_PER_INCH;
  const marginPx = layout.marginIn * PX_PER_INCH;
  const contentHeightPx = Math.max(pageHeightPx, contentEl.scrollHeight + marginPx);

  const pageCount = Math.max(1, Math.ceil(contentHeightPx / pageHeightPx));

  return Array.from({ length: pageCount }, (_, index) => {
    const topPx = index * pageHeightPx;

    return {
      pageNumber: index + 1,
      topPx,
      heightPx: pageHeightPx,
      printableTopPx: topPx + marginPx,
      printableBottomPx: topPx + pageHeightPx - marginPx,
    };
  });
}
