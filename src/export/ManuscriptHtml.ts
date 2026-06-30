export const MANUSCRIPT_LAYOUT_DEFAULTS = {
  fontFamily: "Georgia",
  fontSize: "12.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.58in",
  lineHeight: "1.65",
  verseColor: "#8b0000",
};

export const MANUSCRIPT_SPACING = {
  paragraph: ".20in",
  blankLineHeight: ".24in",
  brSpace: ".12in",
  h1FontSize: "18pt",
  h1LineHeight: "1.15",
  h1Margin: "0 0 .22in 0",
  h2FontSize: "15pt",
  h2LineHeight: "1.22",
  h2Margin: ".34in 0 .16in",
  h3FontSize: "13pt",
  h3LineHeight: "1.28",
  h3Margin: ".28in 0 .13in",
  h4FontSize: "12pt",
  h4LineHeight: "1.25",
  h4Margin: ".18in 0 .10in",
  listMarginTop: ".10in",
  listMarginBottom: ".18in",
  listPaddingLeft: ".32in",
  listItemBottom: ".10in",
  blockquoteMargin: ".20in 0 .22in .18in",
  blockquotePaddingLeft: ".15in",
  hrMargin: ".22in 0",
};

export type ManuscriptRenderSettings = {
  fontFamily?: string;
  fontSize?: string;
  pageWidth?: string;
  pageHeight?: string;
  margin?: string;
  lineHeight?: string;
  verseColor?: string;
  bibleVerseColor?: string;
  keepTogetherRules?: boolean;
  autoPageBalancing?: boolean;
};

export const PRINT_PREVIEW_SETTINGS: ManuscriptRenderSettings = {
  fontFamily: "Georgia",
  fontSize: "11.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.55in",
  lineHeight: "1.45",
};

function parseInches(value: unknown, fallback: number): number {
  const parsed = Number(String(value ?? "").replace("in", "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePositiveInches(value: unknown, fallback: number): number {
  const parsed = parseInches(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

export function normalizeSettings(settings: ManuscriptRenderSettings = {}) {
  return {
    fontFamily: settings.fontFamily || MANUSCRIPT_LAYOUT_DEFAULTS.fontFamily,
    fontSize: settings.fontSize || MANUSCRIPT_LAYOUT_DEFAULTS.fontSize,
    pageWidth: settings.pageWidth || MANUSCRIPT_LAYOUT_DEFAULTS.pageWidth,
    pageHeight: settings.pageHeight || MANUSCRIPT_LAYOUT_DEFAULTS.pageHeight,
    margin: settings.margin || MANUSCRIPT_LAYOUT_DEFAULTS.margin,
    lineHeight: settings.lineHeight || MANUSCRIPT_LAYOUT_DEFAULTS.lineHeight,
    verseColor: settings.verseColor || settings.bibleVerseColor || MANUSCRIPT_LAYOUT_DEFAULTS.verseColor,
    keepTogetherRules: settings.keepTogetherRules !== false,
    autoPageBalancing: settings.autoPageBalancing !== false,
  };
}

export function getManuscriptLayoutMetrics(settings: ManuscriptRenderSettings = {}) {
  const normalized = normalizeSettings(settings);
  const pageWidthIn = parsePositiveInches(normalized.pageWidth, 5.5);
  const pageHeightIn = parsePositiveInches(normalized.pageHeight, 8.5);
  const marginIn = parsePositiveInches(normalized.margin, 0.58);
  const printableWidthIn = Math.max(1, pageWidthIn - marginIn * 2);
  const printableHeightIn = Math.max(1, pageHeightIn - marginIn * 2);

  return {
    pageWidth: normalized.pageWidth,
    pageHeight: normalized.pageHeight,
    margin: normalized.margin,
    fontFamily: normalized.fontFamily,
    fontSize: normalized.fontSize,
    lineHeight: normalized.lineHeight,
    pageWidthIn,
    pageHeightIn,
    marginIn,
    printableWidthIn,
    printableHeightIn,
    previewGuideStepIn: printableHeightIn,
    firstGuideTopIn: marginIn + printableHeightIn,
  };
}

export function cleanMarkdown(value: string): string {
  return String(value).replace(/^kangaroo names\s*$/gim, "");
}

export function preserveIntentionalBlankLines(markdown: string): string {
  return String(markdown).replace(/\n{3,}/g, "\n\n<div class=\"sp-blank-line\"></div>\n\n");
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInlineMarkdown(value: string): string {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
}

function renderParagraph(lines: string[]): string {
  return `<p>${lines.map(renderInlineMarkdown).join("<br>")}</p>`;
}

function renderBlockquote(lines: string[]): string {
  const text = lines.map((line) => line.replace(/^>\s?/, ""));
  return `<blockquote>${text.map(renderInlineMarkdown).join("<br>")}</blockquote>`;
}

function renderListItem(text: string, checked?: boolean): string {
  const checkbox = checked === undefined
    ? ""
    : `<input type="checkbox" disabled${checked ? " checked" : ""}> `;
  return `<li>${checkbox}${renderInlineMarkdown(text)}</li>`;
}

function renderList(type: "ul" | "ol", items: string[]): string {
  return `<${type}>\n${items.join("\n")}\n</${type}>`;
}

export function manuscriptContentCss(settings: ManuscriptRenderSettings = {}, scope = ".sermonprint-export"): string {
  const normalized = normalizeSettings(settings);
  const s = MANUSCRIPT_SPACING;

  return `
${scope} {
  box-sizing: border-box;
  font-family: ${normalized.fontFamily}, Georgia, serif;
  font-size: ${normalized.fontSize};
  line-height: ${normalized.lineHeight};
  color: #111;
}

${scope} h1 {
  text-align: center;
  font-size: ${s.h1FontSize};
  line-height: ${s.h1LineHeight};
  margin: ${s.h1Margin};
}

${scope} h2 {
  font-size: ${s.h2FontSize};
  line-height: ${s.h2LineHeight};
  margin: ${s.h2Margin};
}

${scope} h3 {
  font-size: ${s.h3FontSize};
  line-height: ${s.h3LineHeight};
  margin: ${s.h3Margin};
}

${scope} h4 {
  font-size: ${s.h4FontSize};
  line-height: ${s.h4LineHeight};
  margin: ${s.h4Margin};
}

${scope} p {
  margin: 0 0 ${s.paragraph} 0;
  orphans: 3;
  widows: 3;
}

${scope} br {
  display: block;
  content: "";
  margin-bottom: ${s.brSpace};
}

${scope} .sp-blank-line {
  display: block;
  height: ${s.blankLineHeight};
}

${scope} ul,
${scope} ol {
  margin-top: ${s.listMarginTop};
  margin-bottom: ${s.listMarginBottom};
  padding-left: ${s.listPaddingLeft};
}

${scope} li {
  margin-bottom: ${s.listItemBottom};
}

${scope} li input[type="checkbox"] {
  margin-right: .06in;
  transform: translateY(1px);
}

${scope} blockquote {
  margin: ${s.blockquoteMargin};
  padding-left: ${s.blockquotePaddingLeft};
  border-left: 3px solid ${normalized.verseColor};
  color: ${normalized.verseColor};
  font-style: italic;
}

${scope} .sp-verse-text,
${scope} font[color] {
  color: ${normalized.verseColor} !important;
}

${scope} hr {
  border: none;
  border-top: 1px solid #cfcfcf;
  margin: ${s.hrMargin};
}

${scope} .page-break {
  break-after: page;
  page-break-after: always;
}

${scope} p.sp-paragraph-continuation {
  margin-top: 0;
}
`;
}

function keepTogetherCss(enabled: boolean): string {
  return enabled ? `
h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
blockquote, table, pre, .callout { break-inside: avoid; page-break-inside: avoid; }
li { break-inside: avoid; page-break-inside: avoid; }
p { orphans: 3; widows: 3; }
` : "";
}

function balanceCss(enabled: boolean): string {
  return enabled ? `
h2 + blockquote, h2 + p, h2 + ol, h2 + ul,
h3 + blockquote, h3 + p, h3 + ol, h3 + ul { break-before: avoid; page-break-before: avoid; }
` : "";
}

export function manuscriptPrintCss(settings: ManuscriptRenderSettings = {}): string {
  const normalized = normalizeSettings(settings);
  return `
@page {
  size: ${normalized.pageWidth} ${normalized.pageHeight};
  margin: ${normalized.margin};
}

html, body {
  margin: 0;
  padding: 0;
  background: white;
}

body {
  font-family: ${normalized.fontFamily}, Georgia, serif;
  font-size: ${normalized.fontSize};
  line-height: ${normalized.lineHeight};
  color: #111;
}

${manuscriptContentCss(normalized, ".sermonprint-export")}
${keepTogetherCss(normalized.keepTogetherRules)}
${balanceCss(normalized.autoPageBalancing)}

@media screen {
  html {
    background: #cfcfcf;
  }

  body {
    background: #cfcfcf;
    padding: .28in 0 .65in;
    overflow: auto;
  }

  .sermonprint-export {
    position: relative;
    width: calc(${normalized.pageWidth} - (${normalized.margin} * 2));
    min-height: calc(${normalized.pageHeight} - (${normalized.margin} * 2));
    margin: 0 auto;
    padding: ${normalized.margin};
    background:
      repeating-linear-gradient(
        to bottom,
        white 0,
        white ${normalized.pageHeight},
        transparent ${normalized.pageHeight},
        transparent calc(${normalized.pageHeight} + .35in)
      );
    background-origin: border-box;
    background-clip: border-box;
    filter: drop-shadow(0 0 14px rgba(0, 0, 0, .24));
  }

  .sermonprint-export::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      repeating-linear-gradient(
        to bottom,
        rgba(0, 0, 0, .16) 0,
        rgba(0, 0, 0, .16) 1px,
        transparent 1px,
        transparent ${normalized.pageHeight},
        transparent calc(${normalized.pageHeight} + .35in)
      );
  }

}
`;
}

export function paginatedPrintCss(settings: ManuscriptRenderSettings = {}): string {
  const normalized = normalizeSettings({ ...settings, ...PRINT_PREVIEW_SETTINGS });

  return `
@page {
  size: ${normalized.pageWidth} ${normalized.pageHeight};
  margin: 0;
}

html,
body {
  margin: 0;
  padding: 0;
  background: white;
}

body {
  font-family: ${normalized.fontFamily}, Georgia, serif;
  font-size: ${normalized.fontSize};
  line-height: ${normalized.lineHeight};
  color: #111;
}

.sermonprint-export {
  margin: 0;
  padding: 0;
}

.sp-print-source {
  display: none;
}

.sp-print-page {
  position: relative;
  box-sizing: border-box;
  width: ${normalized.pageWidth};
  height: ${normalized.pageHeight};
  background: white;
  overflow: visible;
}

.sp-print-page:not(:last-child) {
  break-after: page;
  page-break-after: always;
}

.sp-print-page-content {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: ${normalized.margin};
  overflow: visible;
}

.sp-print-page-label {
  display: none;
}

${manuscriptContentCss(normalized, ".sp-print-page-content")}
${keepTogetherCss(normalized.keepTogetherRules)}
${balanceCss(normalized.autoPageBalancing)}

@media screen {
  html {
    background: #cfcfcf;
  }

  body {
    background: #cfcfcf;
    padding: 36px 0 72px;
  }

  .sermonprint-export {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 36px;
  }

  .sp-print-page {
    box-shadow: 0 6px 20px rgba(0, 0, 0, .16);
  }

  .sp-print-page-label {
    display: block;
    position: absolute;
    top: 50%;
    left: calc(-.82in);
    transform: translateY(-50%);
    width: .66in;
    text-align: right;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    color: #5f6368;
    pointer-events: none;
    user-select: none;
  }
}
`;
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = cleanMarkdown(markdown).replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let blockquote: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let blankCount = 0;

  function flushList(): void {
    if (!listType || !listItems.length) return;
    html.push(renderList(listType, listItems));
    listType = null;
    listItems = [];
  }

  function flushParagraph(): void {
    if (!paragraph.length) return;
    flushList();
    html.push(renderParagraph(paragraph));
    paragraph = [];
  }

  function flushBlockquote(): void {
    if (!blockquote.length) return;
    flushList();
    html.push(renderBlockquote(blockquote));
    blockquote = [];
  }

  function flushText(): void {
    flushList();
    flushParagraph();
    flushBlockquote();
  }

  function addListItem(type: "ul" | "ol", item: string): void {
    flushParagraph();
    flushBlockquote();

    if (listType && listType !== type) flushList();
    listType = type;
    listItems.push(item);
  }

  function pushBlankSpacers(): void {
    if (blankCount <= 1) {
      blankCount = 0;
      return;
    }

    for (let i = 1; i < blankCount; i += 1) {
      html.push('<div class="sp-blank-line" aria-hidden="true"></div>');
    }
    blankCount = 0;
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushText();
      blankCount += 1;
      continue;
    }

    pushBlankSpacers();

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed) || /^___+$/.test(trimmed)) {
      flushText();
      html.push("<hr>");
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushText();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const unorderedListItem = /^[-*+]\s+(?:\[([ xX])\]\s+)?(.+)$/.exec(trimmed);
    if (unorderedListItem) {
      const checked = unorderedListItem[1] ? unorderedListItem[1].toLowerCase() === "x" : undefined;
      addListItem("ul", renderListItem(unorderedListItem[2], checked));
      continue;
    }

    const orderedListItem = /^\d+[.)]\s+(.+)$/.exec(trimmed);
    if (orderedListItem) {
      addListItem("ol", renderListItem(orderedListItem[1]));
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushList();
      flushParagraph();
      blockquote.push(trimmed);
      continue;
    }

    flushList();
    flushBlockquote();
    paragraph.push(trimmed);
  }

  flushText();
  return html.join("\n");
}

export function buildManuscriptHtml(markdown: string, settings: ManuscriptRenderSettings = {}, title = "SermonPrint"): string {
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
${manuscriptPrintCss(settings)}
</style>
</head>
<body>
<main class="sermonprint-export">
${renderMarkdownToHtml(markdown)}
</main>
</body>
</html>
`;
}

export const buildPrintHtml = buildManuscriptHtml;

function paginationScript(): string {
  return `
(function () {
  var OVERFLOW_FUDGE_PX = 1;

  function createPage(pageNumber) {
    var page = document.createElement("div");
    page.className = "sp-print-page";
    page.setAttribute("data-page", String(pageNumber));

    var label = document.createElement("div");
    label.className = "sp-print-page-label";
    label.textContent = "Page " + pageNumber;
    page.appendChild(label);

    var content = document.createElement("div");
    content.className = "sp-print-page-content";
    page.appendChild(content);

    return { page: page, content: content };
  }

  function isHeading(block) {
    return /^H[1-6]$/.test(block.tagName);
  }

  function isParagraph(block) {
    return block.tagName === "P";
  }

  function isKeepTogetherBlock(block) {
    return isHeading(block) || block.tagName === "BLOCKQUOTE";
  }

  function pageOverflows(content) {
    return content.scrollHeight > content.clientHeight + OVERFLOW_FUDGE_PX;
  }

  function pageHasContent(content) {
    return content.children.length > 0;
  }

  function warnOversized(block) {
    console.warn("SermonPrint Print Preview: a single block is taller than one page and will overflow for now.", block.textContent || block.tagName);
  }

  function clearElement(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function markContinuation(paragraph, sourceBlock, partIndex) {
    if (sourceBlock.dataset.spBlockId) paragraph.dataset.spBlockId = sourceBlock.dataset.spBlockId;
    if (partIndex <= 0) return;
    paragraph.classList.add("sp-paragraph-continuation");
    if (sourceBlock.dataset.spBlockId) paragraph.dataset.spContinuationOf = sourceBlock.dataset.spBlockId;
    paragraph.dataset.spContinuationPart = String(partIndex + 1);
  }

  function textPositions(root) {
    var positions = [];
    
    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var value = node.nodeValue || "";
        for (var offset = 0; offset < value.length; offset += 1) {
          positions.push({ node: node, offset: offset });
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      Array.prototype.forEach.call(node.childNodes, walk);
    }

    walk(root);
    return positions;
  }

  function lineBottomLimit(paragraph, content) {
    var marginBottom = parseFloat(window.getComputedStyle(paragraph).marginBottom || "0") || 0;
    return content.getBoundingClientRect().bottom - marginBottom + OVERFLOW_FUDGE_PX;
  }

  function renderedLines(paragraph) {
    var positions = textPositions(paragraph);
    var lines = [];
    var range = document.createRange();

    positions.forEach(function (position, index) {
      range.setStart(position.node, position.offset);
      range.setEnd(position.node, position.offset + 1);
      var rects = range.getClientRects();
      var last = rects[rects.length - 1];
      var current = lines[lines.length - 1];

      if (!last) {
        if (current) current.end = index + 1;
        return;
      }

      if (!current || Math.abs(last.top - current.top) > 2) {
        lines.push({ start: index, end: index + 1, top: last.top, bottom: last.bottom });
        return;
      }

      current.end = index + 1;
      current.bottom = Math.max(current.bottom, last.bottom);
    });

    range.detach();
    return { lines: lines, positions: positions };
  }

  function paragraphFragment(paragraph, positions, start, end) {
    var fragment = document.createDocumentFragment();
    if (start >= end || !positions.length) return fragment;

    var first = positions[start];
    var last = positions[end - 1];
    var range = document.createRange();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, last.offset + 1);
    fragment.appendChild(range.cloneContents());
    range.detach();
    return fragment;
  }

  function paragraphSegment(sourceBlock, renderedParagraph, positions, start, end, partIndex) {
    var paragraph = sourceBlock.cloneNode(false);
    markContinuation(paragraph, sourceBlock, partIndex);
    paragraph.appendChild(paragraphFragment(renderedParagraph, positions, start, end));
    return paragraph;
  }

  function characterCount(block) {
    return textPositions(block).length;
  }

  function splitParagraphAcrossPages(block, state) {
    var remaining = block.cloneNode(true);
    var partIndex = 0;

    while (characterCount(remaining) > 0) {
      var paragraph = remaining.cloneNode(true);
      markContinuation(paragraph, block, partIndex);
      state.current.content.appendChild(paragraph);

      if (!pageOverflows(state.current.content)) {
        return;
      }

      var measurement = renderedLines(paragraph);
      var lines = measurement.lines;
      var positions = measurement.positions;
      var bottom = lineBottomLimit(paragraph, state.current.content);
      var fittingLines = lines.filter(function (line) {
        return line.bottom <= bottom;
      });

      if (!fittingLines.length) {
        state.current.content.removeChild(paragraph);

        if (!pageHasContent(state.current.content)) {
          paragraph = remaining.cloneNode(true);
          markContinuation(paragraph, block, partIndex);
          state.current.content.appendChild(paragraph);
          warnOversized(block);
          return;
        }

        state.nextPage();
        continue;
      }

      var splitOffset = fittingLines[fittingLines.length - 1].end;
      if (splitOffset >= positions.length) return;

      var firstSegment = paragraphSegment(block, paragraph, positions, 0, splitOffset, partIndex);
      var nextSegment = paragraphSegment(block, paragraph, positions, splitOffset, positions.length, partIndex + 1);

      state.current.content.replaceChild(firstSegment, paragraph);
      remaining = nextSegment;
      partIndex += 1;
      state.nextPage();
    }
  }

  function appendKeepTogetherBlock(block, state) {
    var clone = block.cloneNode(true);
    state.current.content.appendChild(clone);

    if (!pageOverflows(state.current.content)) return;

    if (!pageHasContent(state.current.content) || state.current.content.children.length === 1) {
      warnOversized(block);
      return;
    }

    state.current.content.removeChild(clone);
    state.nextPage();
    state.current.content.appendChild(clone);

    if (pageOverflows(state.current.content)) warnOversized(block);
  }

  function headingGroupFits(block, nextBlock, state) {
    if (!nextBlock) return true;

    var heading = block.cloneNode(true);
    var next = nextBlock.cloneNode(true);
    state.current.content.appendChild(heading);
    state.current.content.appendChild(next);
    var fits = !pageOverflows(state.current.content);
    state.current.content.removeChild(next);
    state.current.content.removeChild(heading);
    return fits;
  }

  function placeHeading(block, nextBlock, state) {
    if (nextBlock && !headingGroupFits(block, nextBlock, state) && pageHasContent(state.current.content)) {
      state.nextPage();
    }

    appendKeepTogetherBlock(block, state);
  }

  function paginatePrintPreview() {
    var source = document.querySelector(".sp-print-source");
    var pages = document.querySelector(".sp-print-pages");
    if (!source || !pages) return;

    clearElement(pages);
    var blocks = Array.prototype.slice.call(source.children);
    blocks.forEach(function (block, index) {
      if (!block.dataset.spBlockId) block.dataset.spBlockId = "sp-block-" + (index + 1);
    });

    var pageNumber = 1;
    var current = createPage(pageNumber);
    pages.appendChild(current.page);

    var state = {
      get current() {
        return current;
      },
      nextPage: function () {
        pageNumber += 1;
        current = createPage(pageNumber);
        pages.appendChild(current.page);
      }
    };

    blocks.forEach(function (block, index) {
      var nextBlock = blocks[index + 1] || null;

      if (isHeading(block)) {
        placeHeading(block, nextBlock, state);
        return;
      }

      if (isParagraph(block)) {
        splitParagraphAcrossPages(block, state);
        return;
      }

      if (isKeepTogetherBlock(block)) {
        appendKeepTogetherBlock(block, state);
        return;
      }

      appendKeepTogetherBlock(block, state);
    });
  }

  window.SermonPrintPaginator = { paginate: paginatePrintPreview };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paginatePrintPreview);
  } else {
    paginatePrintPreview();
  }
})();
`;
}

export function buildPaginatedManuscriptHtml(markdown: string, settings: ManuscriptRenderSettings = {}, title = "SermonPrint"): string {
  const normalized = normalizeSettings({ ...settings, ...PRINT_PREVIEW_SETTINGS });

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
${paginatedPrintCss(normalized)}
</style>
</head>
<body>
<main class="sermonprint-export">
<div class="sp-print-source">
${renderMarkdownToHtml(markdown)}
</div>
<div class="sp-print-pages" aria-label="SermonPrint paginated preview"></div>
</main>
<script>
${paginationScript()}
</script>
</body>
</html>
`;
}
