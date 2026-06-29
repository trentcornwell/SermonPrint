import { SermonBlock } from "./Block";
import { PageSettings } from "./Page";

export type RenderBlockHtml = (block: SermonBlock) => string;

type MeasurementCacheEntry = {
  heightsByBlockId: Map<string, number>;
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

  measureBlocks(blocks: SermonBlock[], settings: PageSettings): Map<string, number> {
    const key = this.cacheKey(blocks, settings);
    const cached = this.cache.get(key);
    if (cached) return cached.heightsByBlockId;

    this.applyPageSettings(settings);
    this.contentEl.innerHTML = blocks.map((block) => this.renderBlockHtml(block)).join("\n");

    const contentTop = this.contentEl.getBoundingClientRect().top;
    const heightsByBlockId = new Map<string, number>();
    let previousBottom = contentTop;

    blocks.forEach((block, index) => {
      const blockEl = this.contentEl.children[index] as HTMLElement | undefined;
      if (!blockEl) {
        heightsByBlockId.set(block.id, 0);
        return;
      }

      const blockRect = blockEl.getBoundingClientRect();
      const blockBottom = blockRect.bottom - contentTop;
      const effectiveHeight = Math.max(0, blockBottom - previousBottom);

      heightsByBlockId.set(block.id, effectiveHeight);
      previousBottom = blockBottom;
    });

    this.cache.set(key, { heightsByBlockId });
    return heightsByBlockId;
  }

  private applyPageSettings(settings: PageSettings): void {
    this.pageEl.setAttribute("style", `
  width: ${settings.widthIn}in;
  height: ${settings.heightIn}in;
  padding: ${settings.marginTopIn}in ${settings.marginRightIn}in ${settings.marginBottomIn}in ${settings.marginLeftIn}in;
`);
  }

  private cacheKey(blocks: SermonBlock[], settings: PageSettings): string {
    return JSON.stringify({
      blocks: blocks.map((block) => ({
        id: block.id,
        type: block.type,
        text: block.text,
        html: block.html ?? "",
      })),
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
