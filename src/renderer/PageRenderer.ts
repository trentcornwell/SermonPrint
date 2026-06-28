import { SermonPage, PageSettings } from "../engine/Page";
import { blockToHtml } from "./BlockRenderer";

export function renderPagesToHtml(pages: SermonPage[], settings: PageSettings): string {
  return pages
    .map((page) => {
      const blocks = page.blocks.map(blockToHtml).join("\\n");

      return `
<section class="sp-page" data-page="${page.number}" style="
  width: ${settings.widthIn}in;
  min-height: ${settings.heightIn}in;
  padding: ${settings.marginTopIn}in ${settings.marginRightIn}in ${settings.marginBottomIn}in ${settings.marginLeftIn}in;
">
  <div class="sp-page-number">Page ${page.number}</div>
  <div class="sp-page-content">
    ${blocks}
  </div>
</section>`;
    })
    .join('\n<div class="sp-page-gap"></div>\n');
}
