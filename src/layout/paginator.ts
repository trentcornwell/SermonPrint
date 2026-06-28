import { ResolvedLayout } from "./engine";
import { ManuscriptPage } from "./page";

const PX_PER_INCH = 96;

export function calculateVisualPages(contentHeightPx: number, layout: ResolvedLayout): ManuscriptPage[] {
  const pageHeightPx = layout.pageHeightIn * PX_PER_INCH;
  const pages = Math.max(1, Math.ceil(Math.max(pageHeightPx, contentHeightPx + 24) / pageHeightPx));
  return Array.from({ length: pages }, (_, index) => ({
    pageNumber: index + 1,
    topPx: index * pageHeightPx,
    heightPx: pageHeightPx
  }));
}
