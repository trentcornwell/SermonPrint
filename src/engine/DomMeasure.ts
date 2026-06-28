import { SermonBlock } from "./Block";
import { PageSettings } from "./Page";

export type RenderBlockHtml = (block: SermonBlock) => string;

type MeasurementCacheEntry = {
  heightPx: number;
};

export class DomMeasureService {
  private rootEl: HTMLElement;
  private pageEl: HTMLElement;
  private contentEl: HTMLElement;
  private cache = new Map<string, MeasurementCacheEntry>();

  constructor(ownerEl: HTMLElement, private renderBlockHtml: RenderBlockHtml) {
    this.rootEl = document.createElement("div");
    this.rootEl.className = "sp-measure-root";
    this.pageEl = document.createElement("section");
    this.pageEl.className = "sp-page";
    this.contentEl = document.createElement("div");
    this.contentEl.className = "sp-page-content";

    this.pageEl.appendChild(this.contentEl);
    this.rootEl.appendChild(this.pageEl);
    ownerEl.appendChild(this.rootEl);
  }

  clear(): void {
    this.cache.clear();
  }

  destroy(): void {
    this.rootEl.remove();
    this.cache.clear();
  }

  measureBlock(block: SermonBlock, settings: PageSettings): number {
    const key = this.cacheKey(block, settings);
    const cached = this.cache.get(key);
    if (cached) return cached.heightPx;

    this.applyPageSettings(settings);
    this.contentEl.innerHTML = this.renderBlockHtml(block);

    const blockEl = this.contentEl.firstElementChild as HTMLElement | null;
    if (!blockEl) return 0;

    const rect = blockEl.getBoundingClientRect();
    const style = window.getComputedStyle(blockEl);
    const marginTop = Number.parseFloat(style.marginTop) || 0;
    const marginBottom = Number.parseFloat(style.marginBottom) || 0;
    const heightPx = rect.height + marginTop + marginBottom;

    this.cache.set(key, { heightPx });
    return heightPx;
  }

  private applyPageSettings(settings: PageSettings): void {
    this.pageEl.setAttribute("style", `
  width: ${settings.widthIn}in;
  height: ${settings.heightIn}in;
  padding: ${settings.marginTopIn}in ${settings.marginRightIn}in ${settings.marginBottomIn}in ${settings.marginLeftIn}in;
`);
  }

  private cacheKey(block: SermonBlock, settings: PageSettings): string {
    return JSON.stringify({
      id: block.id,
      type: block.type,
      text: block.text,
      html: block.html ?? "",
      widthIn: settings.widthIn,
      heightIn: settings.heightIn,
      marginTopIn: settings.marginTopIn,
      marginRightIn: settings.marginRightIn,
      marginBottomIn: settings.marginBottomIn,
      marginLeftIn: settings.marginLeftIn,
      fontSizePt: settings.fontSizePt,
      lineHeight: settings.lineHeight,
      paragraphSpacingPt: settings.paragraphSpacingPt,
    });
  }
}
