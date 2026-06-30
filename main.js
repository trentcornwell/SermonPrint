var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SermonPrintPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");
var fs3 = __toESM(require("fs"));
var path4 = __toESM(require("path"));

// src/settings.ts
var import_obsidian = require("obsidian");

// src/engine/Layout.ts
var INCH_TO_PX = 96;
var PAGE_PRESETS = {
  "half-sheet": {
    width: "5.5in",
    height: "8.5in"
  },
  letter: {
    width: "8.5in",
    height: "11in"
  },
  legal: {
    width: "8.5in",
    height: "14in"
  },
  a4: {
    width: "8.27in",
    height: "11.69in"
  }
};
function getPagePreset(value) {
  if (value === "custom") return null;
  return PAGE_PRESETS[value];
}
function parsePositiveInches(value, fallback) {
  const parsed = Number(String(value).replace("in", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function parseInches(value, fallback) {
  const parsed = Number(String(value).replace("in", "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}
function parsePositivePoints(value, fallback) {
  const parsed = Number(String(value).replace("pt", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function inchesToPx(value) {
  return value * INCH_TO_PX;
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  pageSizePreset: "half-sheet",
  pdfFolder: "Sermon PDFs",
  fontFamily: "Georgia",
  fontSize: "12.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.58in",
  lineHeight: "1.65",
  pageGuideOffset: "0in",
  showPageGuides: true,
  showPageShadow: true,
  showPageBreakLabels: true,
  showMarginRuler: true,
  showPageNumbers: true,
  keepTogetherRules: true,
  autoPageBalancing: true,
  openAfterExport: true,
  defaultExportMode: "pdf",
  bibleVerseColor: "#8b0000"
};
var SermonPrintSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "SermonPrint Settings" });
    this.addPageSetupSettings();
    this.addTextSetting("PDF folder", "Relative to the vault or an absolute path. Example: Sermon PDFs", "pdfFolder");
    this.addTextSetting("Font family", "Example: Georgia", "fontFamily");
    this.addTextSetting("Font size", "Example: 11.5pt", "fontSize");
    this.addTextSetting("Page width", "Example: 5.5in", "pageWidth");
    this.addTextSetting("Page height", "Example: 8.5in", "pageHeight");
    this.addTextSetting("Margin", "Applies to all sides. Example: 0.55in", "margin");
    this.addTextSetting("Line height", "Example: 1.45", "lineHeight");
    this.addTextSetting("Bible verse color", "Used by the manuscript toolbar. Example: #8b0000", "bibleVerseColor");
    new import_obsidian.Setting(containerEl).setName("Reset page view").setDesc("Turns on the paper view, red page guides, margin ruler, live page numbers, and keep-together rules.").addButton(
      (button) => button.setButtonText("Reset layout view").onClick(async () => {
        this.plugin.settings.showPageGuides = true;
        this.plugin.settings.showPageShadow = true;
        this.plugin.settings.showMarginRuler = true;
        this.plugin.settings.showPageNumbers = true;
        this.plugin.settings.keepTogetherRules = true;
        this.plugin.settings.autoPageBalancing = true;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    this.addToggle("Show page guides", "Show a page frame and page-break marker while writing.", "showPageGuides");
    this.addToggle("Show page shadow", "Show a real paper card in Sermon Layout.", "showPageShadow");
    this.addToggle("Show margin ruler", "Show the printable margin area while writing.", "showMarginRuler");
    this.addToggle("Show live page numbers", "Show approximate page count in the status bar.", "showPageNumbers");
    this.addToggle("Keep-together rules", "Keep headings, quotes, transitions, and lists together when possible.", "keepTogetherRules");
    this.addToggle("Open PDF after export", "Automatically open the finished PDF after SermonPrint creates it.", "openAfterExport");
  }
  addPageSetupSettings() {
    new import_obsidian.Setting(this.containerEl).setName("Page size").setDesc("This controls both the red page guides and the exported PDF. Your preferred default is Half-sheet, 5.5 \xD7 8.5.").addDropdown(
      (dropdown) => dropdown.addOption("half-sheet", "Half-sheet sermon page (5.5 \xD7 8.5)").addOption("letter", "US Letter (8.5 \xD7 11)").addOption("legal", "US Legal (8.5 \xD7 14)").addOption("a4", "A4 (8.27 \xD7 11.69)").addOption("custom", "Custom").setValue(this.plugin.settings.pageSizePreset || "half-sheet").onChange(async (value) => {
        this.plugin.settings.pageSizePreset = value;
        const preset = getPagePreset(value);
        if (preset) {
          this.plugin.settings.pageWidth = preset.width;
          this.plugin.settings.pageHeight = preset.height;
        }
        await this.plugin.saveSettings();
        this.display();
      })
    );
    new import_obsidian.Setting(this.containerEl).setName("Use half-sheet sermon page").setDesc("Sets the layout and exporter to 5.5 \xD7 8.5 immediately.").addButton(
      (button) => button.setButtonText("Set 5.5 \xD7 8.5").onClick(async () => {
        const preset = getPagePreset("half-sheet");
        this.plugin.settings.pageSizePreset = "half-sheet";
        this.plugin.settings.pageWidth = preset.width;
        this.plugin.settings.pageHeight = preset.height;
        await this.plugin.saveSettings();
        this.display();
      })
    );
  }
  addTextSetting(name, desc, key) {
    new import_obsidian.Setting(this.containerEl).setName(name).setDesc(desc).addText(
      (text) => text.setValue(String(this.plugin.settings[key])).onChange(async (value) => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
        this.plugin.refreshLayoutStyles();
        this.plugin.updateStatusBar();
      })
    );
  }
  addToggle(name, desc, key) {
    new import_obsidian.Setting(this.containerEl).setName(name).setDesc(desc).addToggle(
      (toggle) => toggle.setValue(Boolean(this.plugin.settings[key])).onChange(async (value) => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
        this.plugin.refreshLayoutStyles();
        this.plugin.updateStatusBar();
      })
    );
  }
};

// src/export/ManuscriptHtml.ts
var MANUSCRIPT_LAYOUT_DEFAULTS = {
  fontFamily: "Georgia",
  fontSize: "12.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.58in",
  lineHeight: "1.65",
  verseColor: "#8b0000"
};
var MANUSCRIPT_SPACING = {
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
  hrMargin: ".22in 0"
};
var PRINT_PREVIEW_SETTINGS = {
  fontFamily: "Georgia",
  fontSize: "11.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.55in",
  lineHeight: "1.45"
};
function parseInches2(value, fallback) {
  const parsed = Number(String(value != null ? value : "").replace("in", "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}
function parsePositiveInches2(value, fallback) {
  const parsed = parseInches2(value, fallback);
  return parsed > 0 ? parsed : fallback;
}
function normalizeSettings(settings = {}) {
  return {
    fontFamily: settings.fontFamily || MANUSCRIPT_LAYOUT_DEFAULTS.fontFamily,
    fontSize: settings.fontSize || MANUSCRIPT_LAYOUT_DEFAULTS.fontSize,
    pageWidth: settings.pageWidth || MANUSCRIPT_LAYOUT_DEFAULTS.pageWidth,
    pageHeight: settings.pageHeight || MANUSCRIPT_LAYOUT_DEFAULTS.pageHeight,
    margin: settings.margin || MANUSCRIPT_LAYOUT_DEFAULTS.margin,
    lineHeight: settings.lineHeight || MANUSCRIPT_LAYOUT_DEFAULTS.lineHeight,
    verseColor: settings.verseColor || settings.bibleVerseColor || MANUSCRIPT_LAYOUT_DEFAULTS.verseColor,
    keepTogetherRules: settings.keepTogetherRules !== false,
    autoPageBalancing: settings.autoPageBalancing !== false
  };
}
function getManuscriptLayoutMetrics(settings = {}) {
  const normalized = normalizeSettings(settings);
  const pageWidthIn = parsePositiveInches2(normalized.pageWidth, 5.5);
  const pageHeightIn = parsePositiveInches2(normalized.pageHeight, 8.5);
  const marginIn = parsePositiveInches2(normalized.margin, 0.58);
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
    firstGuideTopIn: marginIn + printableHeightIn
  };
}
function cleanMarkdown(value) {
  return String(value).replace(/^kangaroo names\s*$/gim, "");
}
function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function renderInlineMarkdown(value) {
  const escaped = escapeHtml(value);
  return escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>").replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
}
function renderParagraph(lines) {
  return `<p>${lines.map(renderInlineMarkdown).join("<br>")}</p>`;
}
function renderBlockquote(lines) {
  const text = lines.map((line) => line.replace(/^>\s?/, ""));
  return `<blockquote>${text.map(renderInlineMarkdown).join("<br>")}</blockquote>`;
}
function renderListItem(text, checked) {
  const checkbox = checked === void 0 ? "" : `<input type="checkbox" disabled${checked ? " checked" : ""}> `;
  return `<li>${checkbox}${renderInlineMarkdown(text)}</li>`;
}
function renderList(type, items) {
  return `<${type}>
${items.join("\n")}
</${type}>`;
}
function manuscriptContentCss(settings = {}, scope = ".sermonprint-export") {
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
function keepTogetherCss(enabled) {
  return enabled ? `
h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
blockquote, table, pre, .callout { break-inside: avoid; page-break-inside: avoid; }
li { break-inside: avoid; page-break-inside: avoid; }
p { orphans: 3; widows: 3; }
` : "";
}
function balanceCss(enabled) {
  return enabled ? `
h2 + blockquote, h2 + p, h2 + ol, h2 + ul,
h3 + blockquote, h3 + p, h3 + ol, h3 + ul { break-before: avoid; page-break-before: avoid; }
` : "";
}
function paginatedPrintCss(settings = {}) {
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
function renderMarkdownToHtml(markdown) {
  const lines = cleanMarkdown(markdown).replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let blockquote = [];
  let listType = null;
  let listItems = [];
  let blankCount = 0;
  function flushList() {
    if (!listType || !listItems.length) return;
    html.push(renderList(listType, listItems));
    listType = null;
    listItems = [];
  }
  function flushParagraph() {
    if (!paragraph.length) return;
    flushList();
    html.push(renderParagraph(paragraph));
    paragraph = [];
  }
  function flushBlockquote() {
    if (!blockquote.length) return;
    flushList();
    html.push(renderBlockquote(blockquote));
    blockquote = [];
  }
  function flushText() {
    flushList();
    flushParagraph();
    flushBlockquote();
  }
  function addListItem(type, item) {
    flushParagraph();
    flushBlockquote();
    if (listType && listType !== type) flushList();
    listType = type;
    listItems.push(item);
  }
  function pushBlankSpacers() {
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
      const checked = unorderedListItem[1] ? unorderedListItem[1].toLowerCase() === "x" : void 0;
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
function paginationScript() {
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
function buildPaginatedManuscriptHtml(markdown, settings = {}, title = "SermonPrint") {
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

// src/styles.ts
var STYLE_ID = "sermonprint-layout-styles";
function numberFromAnyInch(value) {
  return parseInches(value, 0);
}
function getPageMetrics(settings) {
  const metrics = getManuscriptLayoutMetrics(settings);
  const pageHeight = metrics.pageHeightIn;
  const pageWidth = metrics.pageWidthIn;
  const margin = metrics.marginIn;
  const offset = numberFromAnyInch(settings.pageGuideOffset);
  const printableHeight = metrics.printableHeightIn;
  return { pageHeight, pageWidth, margin, printableHeight, guideAt: Math.max(1, metrics.firstGuideTopIn + offset) };
}
function injectLayoutStyles(settings) {
  var _a;
  (_a = document.getElementById(STYLE_ID)) == null ? void 0 : _a.remove();
  const { pageHeight, pageWidth, margin, guideAt } = getPageMetrics(settings);
  const textWidth = Math.max(1, pageWidth - margin * 2);
  const defaults = MANUSCRIPT_LAYOUT_DEFAULTS;
  const spacing = MANUSCRIPT_SPACING;
  const guideBackground = settings.showPageGuides ? `background-image: repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent calc(${guideAt}in - 1px),
        rgba(185, 42, 42, 0.72) calc(${guideAt}in - 1px),
        rgba(185, 42, 42, 0.72) ${guideAt}in,
        transparent ${guideAt}in,
        transparent ${pageHeight}in
      ) !important;
      background-repeat: repeat-y !important;
      background-size: 100% ${pageHeight}in !important;
      background-position: 0 0 !important;` : "background-image: none !important;";
  const shadow = settings.showPageShadow ? "box-shadow: 0 0 18px rgba(0,0,0,0.26) !important;" : "";
  const ruler = settings.showMarginRuler ? `outline: 1px solid rgba(0,0,0,0.08) !important;
       border-left: 1px solid rgba(139,0,0,0.16) !important;
       border-right: 1px solid rgba(139,0,0,0.16) !important;` : "";
  const keepTogether = settings.keepTogetherRules ? `
    body.sermonprint-layout h1,
    body.sermonprint-layout h2,
    body.sermonprint-layout h3,
    body.sermonprint-layout h4,
    body.sermonprint-layout .cm-header-1,
    body.sermonprint-layout .cm-header-2,
    body.sermonprint-layout .cm-header-3,
    body.sermonprint-layout .cm-header-4 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    body.sermonprint-layout blockquote,
    body.sermonprint-layout .callout,
    body.sermonprint-layout table,
    body.sermonprint-layout pre {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    ` : "";
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `

/* SermonPrint custom manuscript editor */
body .sermonprint-manuscript-shell {
  --sp-page-width: ${defaults.pageWidth};
  --sp-page-height: ${defaults.pageHeight};
  --sp-page-margin: ${defaults.margin};
  --sp-printable-height: ${pageHeight - margin * 2}in;
  --sp-font-family: ${defaults.fontFamily}, serif;
  --sp-font-size: ${defaults.fontSize};
  --sp-line-height: ${defaults.lineHeight};
  --sp-verse-color: ${defaults.verseColor};
  background: #d7d7d7;
  height: 100%;
  overflow: auto;
  padding: 0 0 52px;
}
body .sermonprint-toolbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: center;
  background: rgba(245,245,245,.98);
  border-bottom: 1px solid rgba(0,0,0,.15);
  padding: 8px;
}
body .sermonprint-toolbar button,
body .sermonprint-toolbar select {
  border: 1px solid rgba(0,0,0,.18);
  border-radius: 6px;
  padding: 4px 9px;
  background: white;
  color: #111;
  font-size: 12px;
}
body .sermonprint-toolbar button:hover,
body .sermonprint-toolbar select:hover {
  background: #f2f2f2;
}
body .sermonprint-toolbar-label,
body .sermonprint-page-count {
  margin-left: 8px;
  color: #555;
  font-size: 12px;
  font-family: system-ui, -apple-system, sans-serif;
}
body .sermonprint-manuscript-stage {
  width: calc(var(--sp-page-width) + 1.25in);
  margin: 28px auto 70px;
  position: relative;
}
body .sermonprint-manuscript-paper {
  position: relative;
  width: var(--sp-page-width);
  min-height: var(--sp-page-height);
  margin: 0 auto;
}
body .sermonprint-manuscript-editor {
  box-sizing: border-box;
  width: var(--sp-page-width);
  min-height: var(--sp-page-height);
  margin: 0 auto;
  padding: var(--sp-page-margin);
  background: #fff;
  box-shadow: 0 0 18px rgba(0,0,0,.25);
  font-family: var(--sp-font-family);
  font-size: var(--sp-font-size);
  line-height: var(--sp-line-height);
  color: #111;
  outline: none;
  position: relative;
  z-index: 2;
}
body .sermonprint-manuscript-editor::after {
  content: "";
  position: absolute;
  left: var(--sp-page-margin);
  right: var(--sp-page-margin);
  top: var(--sp-page-margin);
  bottom: var(--sp-page-margin);
  border: 1px solid rgba(139,0,0,.12);
  pointer-events: none;
}
body .sermonprint-page-guides {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
body .sermonprint-page-break-marker {
  position: absolute;
  left: -0.42in;
  right: -0.42in;
  border-top: 2px dashed rgba(139,0,0,.55);
  height: 0;
}
body .sermonprint-page-break-marker::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -16px;
  height: 32px;
  background: linear-gradient(to bottom, rgba(215,215,215,0), rgba(215,215,215,.95), rgba(215,215,215,0));
  z-index: -1;
}
body .sermonprint-page-break-marker span {
  position: absolute;
  right: 0;
  top: -13px;
  background: #d7d7d7;
  color: #8b0000;
  border: 1px solid rgba(139,0,0,.25);
  border-radius: 999px;
  padding: 2px 8px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 600;
}
body .sermonprint-manuscript-editor p {
  margin: 0 0 ${spacing.paragraph} 0;
}
body .sermonprint-manuscript-editor h1 {
  text-align: center;
  font-size: ${spacing.h1FontSize};
  line-height: ${spacing.h1LineHeight};
  margin: ${spacing.h1Margin};
}
body .sermonprint-manuscript-editor h2 {
  font-size: ${spacing.h2FontSize};
  line-height: ${spacing.h2LineHeight};
  margin: ${spacing.h2Margin};
}
body .sermonprint-manuscript-editor h3 {
  font-size: ${spacing.h3FontSize};
  line-height: ${spacing.h3LineHeight};
  margin: ${spacing.h3Margin};
}
body .sermonprint-manuscript-editor h4 {
  font-size: ${spacing.h4FontSize};
  line-height: ${spacing.h4LineHeight};
  margin: ${spacing.h4Margin};
}
body .sermonprint-manuscript-editor blockquote {
  margin: ${spacing.blockquoteMargin};
  padding-left: ${spacing.blockquotePaddingLeft};
  border-left: 3px solid var(--sp-verse-color);
  color: var(--sp-verse-color);
  font-style: italic;
}
body .sermonprint-manuscript-editor .sp-verse-text,
body .sermonprint-manuscript-editor font[color] {
  color: var(--sp-verse-color) !important;
}
body .sermonprint-manuscript-editor ul,
body .sermonprint-manuscript-editor ol {
  margin-top: ${spacing.listMarginTop};
  margin-bottom: ${spacing.listMarginBottom};
  padding-left: ${spacing.listPaddingLeft};
}
body .sermonprint-manuscript-editor li {
  margin-bottom: ${spacing.listItemBottom};
}
body .sermonprint-manuscript-editor .sermonprint-preview-page-guard {
  display: block;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  pointer-events: none;
  user-select: none;
}
body .sermonprint-manuscript-editor div,
body .sermonprint-manuscript-editor p,
body .sermonprint-manuscript-editor li,
body .sermonprint-manuscript-editor blockquote {
  max-width: 100%;
}


    body.sermonprint-layout {
      --sp-line-height: ${settings.lineHeight};
      --sp-paragraph-space: ${spacing.paragraph};
      --sp-line-space: 0.095in;
      --sp-heading-before: ${spacing.h3Margin.split(" ")[0]};
      --sp-heading-after: ${spacing.h3Margin.split(" ")[2]};
    }

    body.sermonprint-layout .markdown-preview-view,
    body.sermonprint-layout .markdown-source-view.mod-cm6 .cm-scroller {
      background: #d9d9d9 !important;
    }

    body.sermonprint-layout .markdown-preview-sizer,
    body.sermonprint-layout .cm-content {
      box-sizing: border-box !important;
      width: ${settings.pageWidth} !important;
      max-width: ${settings.pageWidth} !important;
      min-height: ${settings.pageHeight} !important;
      margin: 34px auto !important;
      padding: ${settings.margin} !important;
      background-color: #ffffff !important;
      overflow: visible !important;
      ${guideBackground}
      ${shadow}
      ${ruler}
      font-family: ${settings.fontFamily}, Georgia, serif !important;
      font-size: ${settings.fontSize} !important;
      line-height: var(--sp-line-height, ${settings.lineHeight}) !important;
      color: #111 !important;
    }

    body.sermonprint-layout .cm-line,
    body.sermonprint-layout .markdown-rendered p,
    body.sermonprint-layout .markdown-preview-view p {
      font-family: ${settings.fontFamily}, Georgia, serif !important;
      font-size: ${settings.fontSize} !important;
      line-height: var(--sp-line-height, ${settings.lineHeight}) !important;
    }

    body.sermonprint-layout .markdown-preview-sizer::before,
    body.sermonprint-layout .cm-content::before {
      content: "SermonPrint editable 5.5 \xD7 8.5 page view";
      display: block;
      position: sticky;
      top: 0;
      float: right;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 10px;
      color: rgba(139,0,0,0.55);
      background: rgba(255,255,255,0.86);
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 3;
    }

    body.sermonprint-layout .markdown-preview-view h1,
    body.sermonprint-layout .markdown-rendered h1,
    body.sermonprint-layout .cm-header-1 {
      text-align: center !important;
      font-size: ${spacing.h1FontSize} !important;
      line-height: ${spacing.h1LineHeight} !important;
      margin: ${spacing.h1Margin} !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view h2,
    body.sermonprint-layout .markdown-rendered h2,
    body.sermonprint-layout .cm-header-2 {
      font-size: ${spacing.h2FontSize} !important;
      line-height: ${spacing.h2LineHeight} !important;
      margin: ${spacing.h2Margin} !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view h3,
    body.sermonprint-layout .markdown-rendered h3,
    body.sermonprint-layout .cm-header-3 {
      font-size: ${spacing.h3FontSize} !important;
      line-height: ${spacing.h3LineHeight} !important;
      margin: ${spacing.h3Margin} !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view h4,
    body.sermonprint-layout .markdown-rendered h4,
    body.sermonprint-layout .cm-header-4 {
      font-size: ${spacing.h4FontSize} !important;
      line-height: ${spacing.h4LineHeight} !important;
      margin: ${spacing.h4Margin} !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view p,
    body.sermonprint-layout .markdown-rendered p {
      margin: 0 0 var(--sp-paragraph-space) 0 !important;
    }

    body.sermonprint-layout .markdown-preview-view ul,
    body.sermonprint-layout .markdown-preview-view ol,
    body.sermonprint-layout .markdown-rendered ul,
    body.sermonprint-layout .markdown-rendered ol {
      margin-top: ${spacing.listMarginTop} !important;
      margin-bottom: ${spacing.listMarginBottom} !important;
      padding-left: ${spacing.listPaddingLeft} !important;
      max-width: ${textWidth}in !important;
    }

    body.sermonprint-layout .markdown-preview-view li,
    body.sermonprint-layout .markdown-rendered li {
      margin-bottom: ${spacing.listItemBottom} !important;
    }

    body.sermonprint-layout .markdown-preview-view blockquote,
    body.sermonprint-layout .markdown-rendered blockquote,
    body.sermonprint-layout blockquote {
      margin: ${spacing.blockquoteMargin} !important;
      padding-left: ${spacing.blockquotePaddingLeft} !important;
      border-left: 3px solid #8b0000 !important;
      color: #8b0000 !important;
      font-style: italic !important;
    }

    body.sermonprint-layout .page-break {
      page-break-after: always;
      break-after: page;
      border-top: 2px dashed #8b0000;
      margin: 0.35in 0;
      text-align: center;
    }

    body.sermonprint-layout .page-break::after {
      content: "Manual Page Break";
      display: ${settings.showPageBreakLabels ? "block" : "none"};
      font-size: 9pt;
      color: #8b0000;
      font-family: system-ui, -apple-system, sans-serif;
      margin-top: 0.05in;
    }

    ${keepTogether}


    /* Editable Live Preview / Source mode word-processor treatment */
    body.sermonprint-layout .markdown-source-view.mod-cm6 .cm-scroller {
      background: #d9d9d9 !important;
      padding: 28px 0 !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .cm-content {
      box-sizing: border-box !important;
      width: ${settings.pageWidth} !important;
      max-width: ${settings.pageWidth} !important;
      min-height: ${settings.pageHeight} !important;
      margin: 34px auto !important;
      padding: ${settings.margin} !important;
      background-color: #ffffff !important;
      overflow: visible !important;
      ${guideBackground}
      ${shadow}
      ${ruler}
      font-family: ${settings.fontFamily}, Georgia, serif !important;
      font-size: ${settings.fontSize} !important;
      line-height: var(--sp-line-height, ${settings.lineHeight}) !important;
      color: #111 !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .cm-line {
      font-family: ${settings.fontFamily}, Georgia, serif !important;
      font-size: ${settings.fontSize} !important;
      line-height: var(--sp-line-height, ${settings.lineHeight}) !important;
      padding: 0 0 var(--sp-line-space) 0 !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-header {
      padding-top: 0.16in !important;
      padding-bottom: 0.08in !important;
      line-height: 1.22 !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-header-1 {
      text-align: center !important;
      font-size: 18pt !important;
      padding-top: 0 !important;
      padding-bottom: 0.18in !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-header-2 {
      font-size: 15pt !important;
      padding-top: var(--sp-heading-before) !important;
      padding-bottom: var(--sp-heading-after) !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-header-3 {
      font-size: 13pt !important;
      padding-top: 0.20in !important;
      padding-bottom: 0.08in !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-quote {
      border-left: 3px solid #8b0000 !important;
      color: #8b0000 !important;
      font-style: italic !important;
      padding-left: 0.14in !important;
      margin-left: 0.18in !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-list-line {
      padding-bottom: var(--sp-line-space) !important;
    }


    /* SermonPrint word-processor spacing fixes */
    body.sermonprint-layout .cm-contentContainer,
    body.sermonprint-layout .cm-editor,
    body.sermonprint-layout .cm-scroller {
      font-family: ${settings.fontFamily}, Georgia, serif !important;
      font-size: ${settings.fontSize} !important;
      line-height: var(--sp-line-height, ${settings.lineHeight}) !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .cm-line {
      min-height: calc(1em * var(--sp-line-height, ${settings.lineHeight})) !important;
      margin-bottom: 0 !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .cm-line:empty {
      min-height: 0.24in !important;
      padding-bottom: 0.08in !important;
    }

    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-codeblock,
    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-quote,
    body.sermonprint-layout .markdown-source-view.mod-cm6 .HyperMD-list-line {
      line-height: var(--sp-line-height, ${settings.lineHeight}) !important;
    }

    body.sermonprint-layout .markdown-preview-view p + p,
    body.sermonprint-layout .markdown-rendered p + p {
      margin-top: 0 !important;
    }

    @media print {
      body, .markdown-preview-view, .markdown-preview-sizer, .markdown-rendered, .cm-content {
        background: white !important;
        background-image: none !important;
        box-shadow: none !important;
      }
      .page-break { border: none !important; margin: 0 !important; }
      .page-break::after { content: "" !important; }
    }
  

/* SermonPrint Engine V2 */
body .sp-v2-root {
  height: 100%;
  overflow: auto;
  background: #cfcfcf;
  padding: 18px 0 48px;
}

body .sp-v2-toolbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 8px;
  background: rgba(245,245,245,.95);
  border-bottom: 1px solid rgba(0,0,0,.12);
}

body .sp-v2-pages {
  display: flex;
  flex-direction: column;
  align-items: center;
}

body .sp-measure-root {
  position: absolute;
  left: -10000px;
  top: 0;
  visibility: hidden;
  pointer-events: none;
  contain: layout style;
}

body .sp-page {
  position: relative;
  box-sizing: border-box;
  background: white;
  color: #111;
  box-shadow: 0 0 20px rgba(0,0,0,.22);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 13pt;
  line-height: 1.45;
}

body .sp-page-gap {
  height: .35in;
}

body .sp-page-number {
  position: absolute;
  right: -0.64in;
  top: .12in;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #8b0000;
  background: #f8f8f8;
  border: 1px solid rgba(139,0,0,.25);
  border-radius: 999px;
  padding: 2px 8px;
}

body .sp-debug-overlay {
  position: absolute;
  left: .08in;
  bottom: .08in;
  z-index: 20;
  max-width: calc(100% - .16in);
  max-height: 42%;
  overflow: auto;
  background: rgba(255, 255, 255, .94);
  border: 1px solid rgba(139, 0, 0, .35);
  color: #111;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
  line-height: 1.35;
  padding: 6px 8px;
  pointer-events: none;
}

body .sp-debug-overlay ul {
  margin: 4px 0 0;
  padding-left: 14px;
}

body .sp-page-content h1 {
  font-size: 20pt;
  line-height: 1.08;
  margin: 0 0 .18in;
}

body .sp-page-content h2 {
  font-size: 15.5pt;
  line-height: 1.15;
  margin: .10in 0 .10in;
  break-after: avoid;
}

body .sp-page-content p {
  margin: 0 0 .16in;
  orphans: 3;
  widows: 3;
}

body .sp-page-content blockquote {
  margin: .12in 0 .18in;
  padding-left: .18in;
  border-left: 3px solid #8b0000;
  color: #8b0000;
  font-style: italic;
}

body .sp-page-content .sp-main-point {
  border-top: 1px solid rgba(139,0,0,.35);
  padding-top: .08in;
  color: #111;
}

body .sp-page-content .sp-transition {
  font-weight: 700;
  color: #333;
}

/* SermonPrint Print Preview */
body .sp-print-preview-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #d7d7d7;
}

body .sp-print-preview-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(245, 245, 245, .96);
  border-bottom: 1px solid rgba(0, 0, 0, .12);
}

body .sp-print-preview-shell {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 38%) minmax(360px, 1fr);
  gap: 0;
}

body .sp-print-preview-editor {
  width: 100%;
  height: 100%;
  resize: none;
  border: 0;
  border-right: 1px solid rgba(0, 0, 0, .16);
  padding: 18px;
  box-sizing: border-box;
  background: var(--background-primary);
  color: var(--text-normal);
  font-family: var(--font-monospace), monospace;
  font-size: 14px;
  line-height: 1.55;
  outline: none;
}

body .sp-print-preview-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #cfcfcf;
}

@media (max-width: 860px) {
  body .sp-print-preview-shell {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(220px, 38%) minmax(320px, 1fr);
  }

  body .sp-print-preview-editor {
    border-right: 0;
    border-bottom: 1px solid rgba(0, 0, 0, .16);
  }
}

`;
  document.head.appendChild(style);
}
function removeLayoutStyles() {
  var _a;
  (_a = document.getElementById(STYLE_ID)) == null ? void 0 : _a.remove();
}

// src/exporter.ts
var import_obsidian2 = require("obsidian");
var import_child_process2 = require("child_process");
var fs2 = __toESM(require("fs"));
var path3 = __toESM(require("path"));

// src/booklet.ts
var import_child_process = require("child_process");
var path2 = __toESM(require("path"));

// src/node.ts
var fs = __toESM(require("fs"));
var os = __toESM(require("os"));
var path = __toESM(require("path"));
function isFile(value) {
  try {
    return fs.existsSync(value) && fs.statSync(value).isFile();
  } catch (e) {
    return false;
  }
}
function addIfFile(candidates, value) {
  if (!value) return;
  if (isFile(value)) candidates.push(value);
}
function nodeVersionScore(version) {
  return version.replace(/^v/, "").split(".").map((part) => Number(part) || 0);
}
function compareNodeVersions(a, b) {
  const av = nodeVersionScore(a);
  const bv = nodeVersionScore(b);
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const diff = (bv[i] || 0) - (av[i] || 0);
    if (diff !== 0) return diff;
  }
  return b.localeCompare(a);
}
function getNodeExecutable() {
  const candidates = [];
  addIfFile(candidates, process.env.SERMONPRINT_NODE_PATH);
  const pathEntries = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    addIfFile(candidates, path.join(entry, "node"));
  }
  addIfFile(candidates, "/opt/homebrew/bin/node");
  addIfFile(candidates, "/usr/local/bin/node");
  addIfFile(candidates, "/usr/bin/node");
  const home = os.homedir();
  const nvmVersionsDir = path.join(home, ".nvm", "versions", "node");
  try {
    const versions = fs.readdirSync(nvmVersionsDir).filter((name) => name.startsWith("v")).sort(compareNodeVersions);
    for (const version of versions) {
      addIfFile(candidates, path.join(nvmVersionsDir, version, "bin", "node"));
    }
  } catch (e) {
  }
  const uniqueCandidates = Array.from(new Set(candidates));
  if (uniqueCandidates.length > 0) return uniqueCandidates[0];
  throw new Error(
    "SermonPrint could not find Node. Set SERMONPRINT_NODE_PATH or install Node with nvm, Homebrew, or the official installer."
  );
}

// src/booklet.ts
function createBooklet(pluginDir, inputPdf, outputPdf) {
  const bookletScript = path2.join(pluginDir, "booklet.js");
  return new Promise((resolve, reject) => {
    (0, import_child_process.execFile)(getNodeExecutable(), [bookletScript, inputPdf, outputPdf], (error, _stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
        return;
      }
      resolve();
    });
  });
}

// src/exporter.ts
var SermonPrintExporter = class {
  constructor(plugin, settings) {
    this.plugin = plugin;
    this.settings = settings;
  }
  async exportHtml(html, basename2, outputPath) {
    var _a;
    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      new import_obsidian2.Notice("Could not find vault path.");
      return null;
    }
    const pluginDir = path3.join(vaultPath, (_a = this.plugin.manifest.dir) != null ? _a : ".obsidian/plugins/vision-sermon-toolkit");
    const exporterScript = path3.join(pluginDir, "exporter.js");
    const defaultFolder = this.resolveExportFolder(vaultPath);
    const pdfPath = outputPath || path3.join(defaultFolder, `${basename2} SermonPrint.pdf`);
    const exportFolder = path3.dirname(pdfPath);
    fs2.mkdirSync(exportFolder, { recursive: true });
    const htmlPath = path3.join(exportFolder, `${path3.basename(pdfPath, ".pdf")}.sermonprint-preview.html`);
    new import_obsidian2.Notice("Creating SermonPrint PDF...");
    try {
      let nodeExecutable;
      try {
        nodeExecutable = getNodeExecutable();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("SermonPrint export failed", error);
        new import_obsidian2.Notice("SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting.");
        return null;
      }
      fs2.writeFileSync(htmlPath, html, "utf8");
      await this.runNode(nodeExecutable, exporterScript, ["--html", htmlPath, pdfPath]);
      await this.waitForValidPdf(pdfPath);
      new import_obsidian2.Notice(`SermonPrint PDF saved: ${pdfPath}`);
      if (this.settings.openAfterExport) await this.tryOpenFile(pdfPath);
      return pdfPath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("SermonPrint export failed", error);
      new import_obsidian2.Notice(message.includes("Node") ? "SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting." : `SermonPrint export failed: ${message}`);
      return null;
    } finally {
      try {
        if (fs2.existsSync(htmlPath)) fs2.unlinkSync(htmlPath);
      } catch (error) {
        console.warn("SermonPrint could not remove temporary preview HTML.", error);
      }
    }
  }
  async exportCurrentNote(mode) {
    var _a;
    const file = this.plugin.app.workspace.getActiveFile();
    if (!file || !(file instanceof import_obsidian2.TFile)) {
      new import_obsidian2.Notice("No active note found.");
      return;
    }
    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      new import_obsidian2.Notice("Could not find vault path.");
      return;
    }
    const pluginDir = path3.join(vaultPath, (_a = this.plugin.manifest.dir) != null ? _a : ".obsidian/plugins/vision-sermon-toolkit");
    const exporterScript = path3.join(pluginDir, "exporter.js");
    const inputPath = path3.join(vaultPath, file.path);
    const exportFolder = this.resolveExportFolder(vaultPath);
    const suffix = mode === "large-print" ? " Large Print" : mode === "half-sheet" ? " Half-Sheet" : " SermonPrint";
    const pdfPath = path3.join(exportFolder, `${file.basename}${suffix}.pdf`);
    const bookletPath = path3.join(exportFolder, `${file.basename} SermonPrint Booklet.pdf`);
    const exportSettings = this.modeSettings(mode);
    new import_obsidian2.Notice(`Creating SermonPrint ${mode === "booklet" ? "booklet" : "PDF"}...`);
    try {
      let nodeExecutable;
      try {
        nodeExecutable = getNodeExecutable();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("SermonPrint export failed", error);
        new import_obsidian2.Notice("SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting.");
        return;
      }
      await this.runNode(nodeExecutable, exporterScript, [
        inputPath,
        pdfPath,
        file.basename,
        exportSettings.fontFamily,
        exportSettings.fontSize,
        exportSettings.pageWidth,
        exportSettings.pageHeight,
        exportSettings.margin,
        exportSettings.lineHeight,
        exportSettings.keepTogetherRules ? "true" : "false",
        exportSettings.autoPageBalancing ? "true" : "false"
      ]);
      await this.waitForValidPdf(pdfPath);
      if (mode !== "booklet") {
        new import_obsidian2.Notice("SermonPrint PDF created.");
        if (this.settings.openAfterExport) await this.tryOpenFile(pdfPath);
        return;
      }
      await createBooklet(pluginDir, pdfPath, bookletPath);
      await this.waitForValidPdf(bookletPath);
      new import_obsidian2.Notice("SermonPrint booklet created.");
      if (this.settings.openAfterExport) await this.tryOpenFile(bookletPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("SermonPrint export failed", error);
      new import_obsidian2.Notice(message.includes("Node") ? "SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting." : `SermonPrint export failed: ${message}`);
    }
  }
  modeSettings(mode) {
    const next = { ...this.settings };
    if (mode === "large-print") {
      next.fontSize = "14pt";
      next.lineHeight = "1.55";
    }
    if (mode === "half-sheet") {
      next.pageWidth = "5.5in";
      next.pageHeight = "8.5in";
    }
    return next;
  }
  resolveExportFolder(vaultPath) {
    const configuredFolder = (this.settings.pdfFolder || "Sermon PDFs").trim();
    const exportFolder = path3.isAbsolute(configuredFolder) ? configuredFolder : path3.join(vaultPath, configuredFolder);
    fs2.mkdirSync(exportFolder, { recursive: true });
    return exportFolder;
  }
  getVaultPath() {
    var _a, _b, _c;
    const adapter = this.plugin.app.vault.adapter;
    return (_c = (_b = (_a = adapter.getBasePath) == null ? void 0 : _a.call(adapter)) != null ? _b : adapter.basePath) != null ? _c : null;
  }
  runNode(nodeExecutable, scriptPath, args) {
    return new Promise((resolve, reject) => {
      if (!fs2.existsSync(scriptPath)) {
        reject(new Error(`SermonPrint exporter script was not found at ${scriptPath}. Reinstall the plugin.`));
        return;
      }
      (0, import_child_process2.execFile)(nodeExecutable, [scriptPath, ...args], (error, _stdout, stderr) => {
        if (error) {
          const details = (stderr == null ? void 0 : stderr.trim()) || error.message;
          console.error(details);
          reject(new Error(details));
          return;
        }
        resolve();
      });
    });
  }
  async tryOpenFile(filePath) {
    await new Promise((resolve) => {
      (0, import_child_process2.execFile)("open", [filePath], (error) => {
        if (error) {
          console.warn("SermonPrint created the PDF but could not auto-open it.", error);
          new import_obsidian2.Notice("PDF created, but macOS could not auto-open it.");
        }
        resolve();
      });
    });
  }
  async waitForValidPdf(filePath) {
    const start = Date.now();
    let lastSize = -1;
    let stableCount = 0;
    while (Date.now() - start < 8e3) {
      if (fs2.existsSync(filePath)) {
        const stat = fs2.statSync(filePath);
        if (stat.size > 1e3 && stat.size === lastSize) {
          stableCount += 1;
        } else {
          stableCount = 0;
          lastSize = stat.size;
        }
        if (stableCount >= 2 && this.looksLikePdf(filePath)) return;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`SermonPrint created an invalid or incomplete PDF: ${filePath}`);
  }
  looksLikePdf(filePath) {
    try {
      const buffer = fs2.readFileSync(filePath);
      const start = buffer.subarray(0, 5).toString("utf8");
      const tail = buffer.subarray(Math.max(0, buffer.length - 2048)).toString("latin1");
      return start === "%PDF-" && tail.includes("%%EOF");
    } catch (e) {
      return false;
    }
  }
};

// src/manuscriptView.ts
var import_obsidian3 = require("obsidian");
var VIEW_TYPE_SERMONPRINT_MANUSCRIPT = "sermonprint-manuscript-view";
var STRUCTURE_INSERTS = [
  { label: "Big Idea", markdown: "> **Big Idea:** " },
  { label: "Text", markdown: "**Text:** " },
  { label: "Introduction", markdown: "## Introduction" },
  { label: "Review", markdown: "## Review" },
  { label: "Main Point 1", markdown: "## Point 1 \u2014 " },
  { label: "Main Point 2", markdown: "## Point 2 \u2014 " },
  { label: "Main Point 3", markdown: "## Point 3 \u2014 " },
  { label: "Main Point 4", markdown: "## Point 4 \u2014 " },
  { label: "Main Point 5", markdown: "## Point 5 \u2014 " },
  { label: "Main Point 6", markdown: "## Point 6 \u2014 " },
  { label: "Subpoint A", markdown: "### A. " },
  { label: "Subpoint B", markdown: "### B. " },
  { label: "Subpoint C", markdown: "### C. " },
  { label: "Transition", markdown: "**Transition:** " },
  { label: "Illustration", markdown: "### Illustration" },
  { label: "Application", markdown: "## Application" },
  { label: "Invitation", markdown: "## Invitation" },
  { label: "Conclusion", markdown: "## Conclusion" },
  { label: "Scripture", markdown: "> " },
  { label: "Quote", markdown: "> " }
];
var EXPORT_GUIDE_CALIBRATION_IN = 0;
var PREVIEW_PAGE_GUARD_CLASS = "sermonprint-preview-page-guard";
var PREVIEW_PAGE_GUARD_BUFFER_IN = 0.18;
function inlineHtmlToMarkdown(el) {
  let output = "";
  el.childNodes.forEach((node) => {
    var _a;
    if (node.nodeType === Node.TEXT_NODE) {
      output += (_a = node.textContent) != null ? _a : "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node;
    if (child.classList.contains(PREVIEW_PAGE_GUARD_CLASS)) return;
    const tag = child.tagName.toLowerCase();
    const text = inlineHtmlToMarkdown(child);
    if (tag === "strong" || tag === "b") output += `**${text}**`;
    else if (tag === "em" || tag === "i") output += `*${text}*`;
    else if (tag === "br") output += "\n";
    else if (child.classList.contains("sp-verse-text")) output += `<span class="sp-verse-text">${text}</span>`;
    else output += text;
  });
  return output.replace(/\u00a0/g, " ").trimEnd();
}
function htmlToMarkdown(root) {
  const blocks = [];
  function textOf(el) {
    return inlineHtmlToMarkdown(el).trimEnd();
  }
  function walkBlock(el) {
    if (el instanceof HTMLElement && el.classList.contains(PREVIEW_PAGE_GUARD_CLASS)) return;
    const tag = el.tagName.toLowerCase();
    const htmlEl = el;
    const text = textOf(htmlEl).trim();
    if (!text && tag !== "br") return;
    if (tag === "h1") blocks.push(`# ${text}`);
    else if (tag === "h2") blocks.push(`## ${text}`);
    else if (tag === "h3") blocks.push(`### ${text}`);
    else if (tag === "h4") blocks.push(`#### ${text}`);
    else if (tag === "blockquote") {
      const lines = text.split(/\n+/).map((line) => `> ${line.trim()}`);
      blocks.push(lines.join("\n"));
    } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(el.children).filter((child) => child.tagName.toLowerCase() === "li");
      blocks.push(items.map((li, index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${textOf(li).trim()}`).join("\n"));
    } else if (tag === "pre") {
      blocks.push("```\n" + text + "\n```");
    } else if (tag === "p" || tag === "div") {
      blocks.push(text);
    }
  }
  Array.from(root.children).forEach(walkBlock);
  return blocks.join("\n\n") + "\n";
}
var SermonPrintManuscriptView = class extends import_obsidian3.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.file = null;
    this.editorEl = null;
    this.guidesEl = null;
    this.pageCountEl = null;
    this.colorInput = null;
    this.updateTimer = null;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_SERMONPRINT_MANUSCRIPT;
  }
  getDisplayText() {
    return "SermonPrint Manuscript";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("sermonprint-manuscript-shell");
    const toolbar = container.createDiv({ cls: "sermonprint-toolbar" });
    this.buildToolbar(toolbar);
    const stage = container.createDiv({ cls: "sermonprint-manuscript-stage" });
    const paper = stage.createDiv({ cls: "sermonprint-manuscript-paper" });
    this.guidesEl = paper.createDiv({ cls: "sermonprint-page-guides" });
    this.editorEl = paper.createDiv({ cls: "sermonprint-manuscript-editor" });
    this.editorEl.contentEditable = "true";
    this.editorEl.spellcheck = true;
    this.editorEl.addEventListener("input", () => this.scheduleGuideUpdate());
    this.editorEl.addEventListener("keyup", () => this.scheduleGuideUpdate());
    this.editorEl.addEventListener("paste", () => this.scheduleGuideUpdate());
    await this.loadActiveFile();
    this.applyManuscriptVariables();
    this.scheduleGuideUpdate();
  }
  buildToolbar(toolbar) {
    toolbar.createEl("button", { text: "Save" }).onclick = () => this.save();
    const pageSize = toolbar.createEl("select", { cls: "sermonprint-page-size-select" });
    pageSize.createEl("option", { text: "5.5 \xD7 8.5", value: "half-sheet" });
    pageSize.createEl("option", { text: "Letter", value: "letter" });
    pageSize.createEl("option", { text: "A4", value: "a4" });
    pageSize.createEl("option", { text: "Legal", value: "legal" });
    pageSize.value = this.plugin.settings.pageSizePreset || "half-sheet";
    pageSize.onchange = async () => {
      await this.setPageSize(pageSize.value);
      this.applyManuscriptVariables();
      this.scheduleGuideUpdate();
    };
    toolbar.createEl("button", { text: "Normal" }).onclick = () => this.formatBlock("p");
    toolbar.createEl("button", { text: "H1" }).onclick = () => this.formatBlock("h1");
    toolbar.createEl("button", { text: "H2" }).onclick = () => this.formatBlock("h2");
    toolbar.createEl("button", { text: "H3" }).onclick = () => this.formatBlock("h3");
    const structure = toolbar.createEl("select", { cls: "sermonprint-structure-select" });
    structure.createEl("option", { text: "Insert sermon block...", value: "" });
    STRUCTURE_INSERTS.forEach((item, index) => structure.createEl("option", { text: item.label, value: String(index) }));
    structure.onchange = () => {
      if (!structure.value) return;
      const item = STRUCTURE_INSERTS[Number(structure.value)];
      this.insertMarkdownBlock(item.markdown);
      structure.value = "";
    };
    toolbar.createEl("button", { text: "Bold" }).onclick = () => document.execCommand("bold");
    toolbar.createEl("button", { text: "Italic" }).onclick = () => document.execCommand("italic");
    toolbar.createEl("button", { text: "Scripture" }).onclick = () => this.applyScriptureStyle();
    const colorLabel = toolbar.createSpan({ text: " Verse " });
    colorLabel.addClass("sermonprint-toolbar-label");
    this.colorInput = toolbar.createEl("input", { type: "color" });
    this.colorInput.value = this.plugin.settings.bibleVerseColor || "#8b0000";
    this.colorInput.onchange = async () => {
      if (!this.colorInput) return;
      this.plugin.settings.bibleVerseColor = this.colorInput.value;
      await this.plugin.saveSettings();
      this.applyManuscriptVariables();
    };
    toolbar.createEl("button", { text: "Export PDF" }).onclick = async () => {
      await this.save();
      await this.plugin.exportWithMode("pdf");
    };
    toolbar.createEl("button", { text: "Export Booklet" }).onclick = async () => {
      await this.save();
      await this.plugin.exportWithMode("booklet");
    };
    this.pageCountEl = toolbar.createSpan({ text: "Page 1 of 1", cls: "sermonprint-page-count" });
  }
  async setPageSize(value) {
    this.plugin.settings.pageSizePreset = value;
    const preset = getPagePreset(value);
    if (preset) {
      this.plugin.settings.pageWidth = preset.width;
      this.plugin.settings.pageHeight = preset.height;
    }
    await this.plugin.saveSettings();
  }
  async loadActiveFile() {
    this.file = this.plugin.app.workspace.getActiveFile();
    if (!this.file || !this.editorEl) {
      new import_obsidian3.Notice("Open a sermon note before opening SermonPrint Manuscript View.");
      return;
    }
    this.editorEl.empty();
    const md = await this.plugin.app.vault.read(this.file);
    await import_obsidian3.MarkdownRenderer.render(this.plugin.app, md, this.editorEl, this.file.path, this);
    new import_obsidian3.Notice("SermonPrint Manuscript View loaded.");
    this.scheduleGuideUpdate();
  }
  async save() {
    if (!this.file || !this.editorEl) return;
    const markdown = htmlToMarkdown(this.editorEl);
    this.removePreviewPageGuards();
    await this.plugin.app.vault.modify(this.file, markdown);
    new import_obsidian3.Notice("SermonPrint manuscript saved.");
    this.scheduleGuideUpdate();
  }
  formatBlock(tag) {
    var _a;
    (_a = this.editorEl) == null ? void 0 : _a.focus();
    document.execCommand("formatBlock", false, tag);
    this.scheduleGuideUpdate();
  }
  insertMarkdownBlock(markdown) {
    var _a;
    (_a = this.editorEl) == null ? void 0 : _a.focus();
    const lines = markdown.split("\n");
    let html = "";
    for (const line of lines) {
      if (line.startsWith("### ")) html += `<h3>${line.slice(4)}</h3>`;
      else if (line.startsWith("## ")) html += `<h2>${line.slice(3)}</h2>`;
      else if (line.startsWith("# ")) html += `<h1>${line.slice(2)}</h1>`;
      else if (line.startsWith("> ")) html += `<blockquote>${line.slice(2)}</blockquote>`;
      else if (line.startsWith("**") && line.endsWith("**")) html += `<p><strong>${line.slice(2, -2)}</strong></p>`;
      else html += `<p>${line}</p>`;
    }
    document.execCommand("insertHTML", false, html);
    this.scheduleGuideUpdate();
  }
  applyScriptureStyle() {
    var _a, _b;
    const color = ((_a = this.colorInput) == null ? void 0 : _a.value) || this.plugin.settings.bibleVerseColor || "#8b0000";
    this.plugin.settings.bibleVerseColor = color;
    this.plugin.saveSettings();
    (_b = this.editorEl) == null ? void 0 : _b.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      this.insertMarkdownBlock("> ");
      return;
    }
    const range = selection.getRangeAt(0);
    const wrapper = document.createElement("span");
    wrapper.className = "sp-verse-text";
    wrapper.style.color = color;
    try {
      range.surroundContents(wrapper);
    } catch (e) {
      document.execCommand("foreColor", false, color);
    }
    this.scheduleGuideUpdate();
  }
  applyManuscriptVariables() {
    const shell = this.containerEl.querySelector(".sermonprint-manuscript-shell");
    if (!shell) return;
    const pageWidth = parsePositiveInches(this.plugin.settings.pageWidth, 5.5);
    const pageHeight = parsePositiveInches(this.plugin.settings.pageHeight, 8.5);
    const margin = parsePositiveInches(this.plugin.settings.margin, 0.58);
    const fontSize = parsePositivePoints(this.plugin.settings.fontSize, 12.5);
    const lineHeight = Number(this.plugin.settings.lineHeight) || 1.65;
    const printableHeight = Math.max(1, pageHeight - margin * 2);
    shell.style.setProperty("--sp-page-width", `${pageWidth}in`);
    shell.style.setProperty("--sp-page-height", `${pageHeight}in`);
    shell.style.setProperty("--sp-page-margin", `${margin}in`);
    shell.style.setProperty("--sp-printable-height", `${printableHeight}in`);
    shell.style.setProperty("--sp-font-family", `${this.plugin.settings.fontFamily}, Georgia, serif`);
    shell.style.setProperty("--sp-font-size", `${fontSize}pt`);
    shell.style.setProperty("--sp-line-height", String(lineHeight));
    shell.style.setProperty("--sp-verse-color", this.plugin.settings.bibleVerseColor || "#8b0000");
  }
  scheduleGuideUpdate() {
    if (this.updateTimer) window.clearTimeout(this.updateTimer);
    this.updateTimer = window.setTimeout(() => this.updatePageGuides(), 80);
  }
  updatePageGuides() {
    if (!this.editorEl || !this.guidesEl || !this.pageCountEl) return;
    this.applyManuscriptVariables();
    this.guidesEl.empty();
    this.removePreviewPageGuards();
    const metrics = getManuscriptLayoutMetrics(this.plugin.settings);
    const guideOffsetIn = parseInches(this.plugin.settings.pageGuideOffset, 0);
    const marginPx = metrics.marginIn * INCH_TO_PX;
    const printableHeightPx2 = metrics.previewGuideStepIn * INCH_TO_PX;
    const guideOffsetPx = (guideOffsetIn + EXPORT_GUIDE_CALIBRATION_IN) * INCH_TO_PX;
    const editableContentHeight = Math.max(0, this.editorEl.scrollHeight - marginPx * 2);
    const pages = Math.max(1, Math.ceil(editableContentHeight / printableHeightPx2));
    for (let i = 1; i < pages; i++) {
      const guideTop = marginPx + i * printableHeightPx2 + guideOffsetPx;
      this.insertPreviewPageGuard(guideTop);
      const marker = this.guidesEl.createDiv({ cls: "sermonprint-page-break-marker" });
      marker.style.top = `${guideTop}px`;
      marker.createSpan({ text: `Page ${i + 1}` });
    }
    this.pageCountEl.setText(`Page 1 of ${pages}`);
  }
  removePreviewPageGuards() {
    var _a;
    (_a = this.editorEl) == null ? void 0 : _a.querySelectorAll(`.${PREVIEW_PAGE_GUARD_CLASS}`).forEach((guard) => guard.remove());
  }
  insertPreviewPageGuard(guideTop) {
    if (!this.editorEl) return;
    const blocks = Array.from(this.editorEl.children).filter((child) => {
      return child instanceof HTMLElement && !child.classList.contains(PREVIEW_PAGE_GUARD_CLASS);
    });
    const crossingBlock = blocks.find((block) => {
      const blockTop = block.offsetTop;
      const blockBottom = block.offsetTop + block.offsetHeight;
      return blockTop < guideTop && blockBottom > guideTop;
    });
    if (!crossingBlock) return;
    const guard = document.createElement("div");
    guard.className = PREVIEW_PAGE_GUARD_CLASS;
    guard.contentEditable = "false";
    guard.setAttribute("aria-hidden", "true");
    guard.setAttribute("data-sermonprint-preview-only", "true");
    const bufferPx = PREVIEW_PAGE_GUARD_BUFFER_IN * INCH_TO_PX;
    const neededHeight = Math.max(bufferPx, guideTop - crossingBlock.offsetTop + bufferPx);
    guard.style.height = `${neededHeight}px`;
    crossingBlock.before(guard);
  }
  getPaginationDiagnostics() {
    if (!this.editorEl) return null;
    const metrics = getManuscriptLayoutMetrics(this.plugin.settings);
    const guideOffsetIn = parseInches(this.plugin.settings.pageGuideOffset, 0);
    const marginPx = metrics.marginIn * INCH_TO_PX;
    const printableHeightPx2 = metrics.previewGuideStepIn * INCH_TO_PX;
    const guideOffsetPx = (guideOffsetIn + EXPORT_GUIDE_CALIBRATION_IN) * INCH_TO_PX;
    const editableContentHeight = Math.max(0, this.editorEl.scrollHeight - marginPx * 2);
    const previewPageCount = Math.max(1, Math.ceil(editableContentHeight / printableHeightPx2));
    const blockEls = Array.from(this.editorEl.querySelectorAll("h1, h2, h3, h4, p, blockquote, li"));
    const firstVisibleTextByGuide = [];
    for (let i = 1; i < previewPageCount; i++) {
      const guideTop = marginPx + i * printableHeightPx2 + guideOffsetPx;
      const nearest = blockEls.find((el) => el.offsetTop + el.offsetHeight >= guideTop);
      firstVisibleTextByGuide.push(((nearest == null ? void 0 : nearest.innerText) || (nearest == null ? void 0 : nearest.textContent) || "").replace(/\s+/g, " ").trim().slice(0, 90));
    }
    return {
      previewPageCount,
      previewEffectivePageStepIn: metrics.previewGuideStepIn,
      exportPageSize: `${metrics.pageWidth} x ${metrics.pageHeight}`,
      exportMargin: metrics.margin,
      firstVisibleTextByGuide
    };
  }
};

// src/ui/ManuscriptEditorV2.ts
var import_obsidian4 = require("obsidian");

// src/engine/Parser.ts
function idFor(index) {
  return `block-${index + 1}`;
}
function detectType(line) {
  const clean = line.trim().toLowerCase();
  if (clean.startsWith("# ")) return "title";
  if (clean.startsWith("## point") || clean.startsWith("## main point")) return "mainPoint";
  if (clean.startsWith("## ")) return "heading";
  if (clean.startsWith(">")) return "scripture";
  if (clean.startsWith("**transition")) return "transition";
  if (clean.startsWith("**application")) return "application";
  if (clean.startsWith("**invitation")) return "invitation";
  if (clean.startsWith("**conclusion")) return "conclusion";
  return "paragraph";
}
function parseMarkdownToDocument(markdown, fallbackTitle = "Untitled Sermon") {
  const chunks = markdown.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  const blocks = chunks.map((chunk, index) => {
    const type = detectType(chunk);
    const level = chunk.startsWith("### ") ? 3 : chunk.startsWith("## ") ? 2 : chunk.startsWith("# ") ? 1 : void 0;
    return {
      id: idFor(index),
      type,
      level,
      text: chunk
    };
  });
  const titleBlock = blocks.find((b) => b.type === "title");
  const title = (titleBlock == null ? void 0 : titleBlock.text.replace(/^#\s+/, "").trim()) || fallbackTitle;
  return {
    id: "sermon-document",
    title,
    blocks
  };
}

// src/engine/Page.ts
var DEFAULT_PAGE_SETTINGS = {
  widthIn: 5.5,
  heightIn: 8.5,
  marginTopIn: 0.55,
  marginRightIn: 0.55,
  marginBottomIn: 0.55,
  marginLeftIn: 0.55,
  fontSizePt: 13,
  lineHeight: 1.45,
  paragraphSpacingPt: 8
};
function printableHeightPx(settings) {
  return inchesToPx(settings.heightIn - settings.marginTopIn - settings.marginBottomIn);
}

// src/engine/Measure.ts
function stripMarkdown(text) {
  return text.replace(/^#{1,6}\s+/, "").replace(/^>\s?/, "").replace(/\*\*/g, "").trim();
}
function estimateBlockHeight(block, settings) {
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

// src/engine/Paginator.ts
function keepWithNext(block) {
  return block.type === "title" || block.type === "heading" || block.type === "mainPoint";
}
function newPage(number, availableHeightPx) {
  return {
    number,
    blocks: [],
    usedHeightPx: 0,
    availableHeightPx
  };
}
function paginateDocument(document2, settings, measureBlock = estimateBlockHeight) {
  const availableHeight = printableHeightPx(settings);
  const pages = [newPage(1, availableHeight)];
  let current = pages[0];
  for (let index = 0; index < document2.blocks.length; index++) {
    const block = document2.blocks[index];
    const blockHeight = measureBlock(block, settings);
    let heightToFit = blockHeight;
    const next = document2.blocks[index + 1];
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

// src/engine/DomMeasure.ts
var DomMeasureService = class {
  constructor(ownerEl, renderBlockHtml) {
    this.renderBlockHtml = renderBlockHtml;
    this.cache = /* @__PURE__ */ new Map();
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
  clear() {
    this.cache.clear();
  }
  destroy() {
    this.rootEl.remove();
    this.cache.clear();
  }
  measureBlocks(blocks, settings) {
    const key = this.cacheKey(blocks, settings);
    const cached = this.cache.get(key);
    if (cached) return cached.heightsByBlockId;
    this.applyPageSettings(settings);
    this.contentEl.innerHTML = blocks.map((block) => this.renderBlockHtml(block)).join("\n");
    const contentTop = this.contentEl.getBoundingClientRect().top;
    const heightsByBlockId = /* @__PURE__ */ new Map();
    let previousBottom = contentTop;
    blocks.forEach((block, index) => {
      const blockEl = this.contentEl.children[index];
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
  applyPageSettings(settings) {
    this.pageEl.setAttribute("style", `
  width: ${settings.widthIn}in;
  height: ${settings.heightIn}in;
  padding: ${settings.marginTopIn}in ${settings.marginRightIn}in ${settings.marginBottomIn}in ${settings.marginLeftIn}in;
`);
  }
  cacheKey(blocks, settings) {
    return JSON.stringify({
      blocks: blocks.map((block) => {
        var _a;
        return {
          id: block.id,
          type: block.type,
          text: block.text,
          html: (_a = block.html) != null ? _a : ""
        };
      }),
      widthIn: settings.widthIn,
      heightIn: settings.heightIn,
      marginTopIn: settings.marginTopIn,
      marginRightIn: settings.marginRightIn,
      marginBottomIn: settings.marginBottomIn,
      marginLeftIn: settings.marginLeftIn,
      fontSizePt: settings.fontSizePt,
      lineHeight: settings.lineHeight,
      paragraphSpacingPt: settings.paragraphSpacingPt
    });
  }
};

// src/renderer/BlockRenderer.ts
function stripMarkdown2(text) {
  return text.replace(/^#{1,6}\s+/, "").replace(/^>\s?/, "").replace(/\*\*/g, "").trim();
}
function blockToHtml(block) {
  const text = stripMarkdown2(block.text);
  switch (block.type) {
    case "title":
      return `<h1>${text}</h1>`;
    case "heading":
      return `<h2>${text}</h2>`;
    case "mainPoint":
      return `<h2 class="sp-main-point">${text}</h2>`;
    case "scripture":
      return `<blockquote class="sp-scripture">${text}</blockquote>`;
    case "quote":
      return `<blockquote>${text}</blockquote>`;
    case "transition":
      return `<p class="sp-transition">${text}</p>`;
    case "application":
      return `<p class="sp-application">${text}</p>`;
    case "invitation":
      return `<p class="sp-invitation">${text}</p>`;
    case "conclusion":
      return `<h2>${text}</h2>`;
    default:
      return `<p>${text}</p>`;
  }
}

// src/renderer/PageRenderer.ts
function renderPagesToHtml(pages, settings) {
  return pages.map((page) => {
    const blocks = page.blocks.map(blockToHtml).join("\n");
    return `
<section class="sp-page" data-page="${page.number}" style="
  width: ${settings.widthIn}in;
  height: ${settings.heightIn}in;
  padding: ${settings.marginTopIn}in ${settings.marginRightIn}in ${settings.marginBottomIn}in ${settings.marginLeftIn}in;
">
  <div class="sp-page-number">Page ${page.number}</div>
  <div class="sp-page-content">
    ${blocks}
  </div>
</section>`;
  }).join('\n<div class="sp-page-gap"></div>\n');
}

// src/ui/ManuscriptEditorV2.ts
var SERMONPRINT_V2_VIEW_TYPE = "sermonprint-manuscript-engine-v2";
var ManuscriptEditorV2View = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.file = null;
    this.rootEl = null;
    this.measureService = null;
    this.debugEnabled = false;
    this.plugin = plugin;
  }
  getViewType() {
    return SERMONPRINT_V2_VIEW_TYPE;
  }
  getDisplayText() {
    return "SermonPrint Engine V2";
  }
  async onOpen() {
    this.containerEl.empty();
    this.rootEl = this.containerEl.createDiv({ cls: "sp-v2-root" });
    this.measureService = new DomMeasureService(this.rootEl, blockToHtml);
    const toolbar = this.rootEl.createDiv({ cls: "sp-v2-toolbar" });
    toolbar.createEl("button", { text: "Refresh Pages" }).onclick = () => this.renderCurrentFile();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFile();
    toolbar.createEl("button", { text: "Debug" }).onclick = async () => {
      this.debugEnabled = !this.debugEnabled;
      await this.renderCurrentFile();
    };
    this.rootEl.createDiv({ cls: "sp-v2-pages" });
    await this.renderCurrentFile();
  }
  onClose() {
    var _a;
    (_a = this.measureService) == null ? void 0 : _a.destroy();
    this.measureService = null;
    return Promise.resolve();
  }
  async setFile(file) {
    this.file = file;
    await this.renderCurrentFile();
  }
  async renderCurrentFile() {
    var _a, _b, _c;
    const pagesEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(".sp-v2-pages");
    if (!pagesEl) return;
    const active = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    const file = this.file || (active == null ? void 0 : active.file);
    if (!file) {
      pagesEl.setText("Open a sermon note first.");
      return;
    }
    this.file = file;
    const markdown = await this.app.vault.read(file);
    const document2 = parseMarkdownToDocument(markdown, file.basename);
    (_b = this.measureService) == null ? void 0 : _b.clear();
    const measuredHeights = (_c = this.measureService) == null ? void 0 : _c.measureBlocks(document2.blocks, DEFAULT_PAGE_SETTINGS);
    const pages = measuredHeights ? paginateDocument(document2, DEFAULT_PAGE_SETTINGS, (block, settings) => {
      var _a2;
      return (_a2 = measuredHeights.get(block.id)) != null ? _a2 : estimateBlockHeight(block, settings);
    }) : paginateDocument(document2, DEFAULT_PAGE_SETTINGS);
    pagesEl.innerHTML = renderPagesToHtml(pages, DEFAULT_PAGE_SETTINGS);
    if (this.debugEnabled) this.renderDebugOverlays(pagesEl, pages, measuredHeights);
  }
  renderDebugOverlays(pagesEl, pages, measuredHeights) {
    pages.forEach((page) => {
      const pageEl = pagesEl.querySelector(`.sp-page[data-page="${page.number}"]`);
      if (!pageEl) return;
      const overlay = pageEl.createDiv({ cls: "sp-debug-overlay" });
      overlay.createDiv({ text: `printable: ${page.availableHeightPx.toFixed(2)}px` });
      overlay.createDiv({ text: `used: ${page.usedHeightPx.toFixed(2)}px` });
      overlay.createDiv({ text: `remaining: ${Math.max(0, page.availableHeightPx - page.usedHeightPx).toFixed(2)}px` });
      overlay.createDiv({ text: `blocks: ${page.blocks.length}` });
      const list = overlay.createEl("ul");
      page.blocks.forEach((block) => {
        var _a;
        const measured = (_a = measuredHeights == null ? void 0 : measuredHeights.get(block.id)) != null ? _a : estimateBlockHeight(block, DEFAULT_PAGE_SETTINGS);
        list.createEl("li", { text: `${block.id} | ${block.type} | ${measured.toFixed(2)}px` });
      });
    });
  }
  async openMarkdownFile() {
    if (!this.file) return;
    await this.app.workspace.openLinkText(this.file.path, "", false);
  }
};
async function openManuscriptEngineV2(plugin) {
  const active = plugin.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
  const file = active == null ? void 0 : active.file;
  if (!file) {
    new import_obsidian4.Notice("Open a sermon note first.");
    return;
  }
  const leaf = plugin.app.workspace.getLeaf("tab");
  await leaf.setViewState({ type: SERMONPRINT_V2_VIEW_TYPE, active: true });
  const view = leaf.view;
  await view.setFile(file);
}

// src/ui/PrintPreviewView.ts
var import_obsidian5 = require("obsidian");
var SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE = "sermonprint-print-preview";
var SermonPrintPrintPreviewView = class extends import_obsidian5.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.file = null;
    this.editorEl = null;
    this.iframeEl = null;
    this.lastHtml = "";
    this.lastMarkdown = "";
    this.refreshTimer = null;
    this.plugin = plugin;
  }
  getViewType() {
    return SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE;
  }
  getDisplayText() {
    return "SermonPrint Print Preview";
  }
  async onOpen() {
    this.containerEl.empty();
    const root = this.containerEl.createDiv({ cls: "sp-print-preview-root" });
    const toolbar = root.createDiv({ cls: "sp-print-preview-toolbar" });
    toolbar.createEl("button", { text: "Save" }).onclick = () => this.saveMarkdown();
    toolbar.createEl("button", { text: "Refresh" }).onclick = () => this.renderPreview();
    toolbar.createEl("button", { text: "Export PDF" }).onclick = () => this.exportPdf();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFile();
    const shell = root.createDiv({ cls: "sp-print-preview-shell" });
    this.editorEl = shell.createEl("textarea", {
      cls: "sp-print-preview-editor",
      attr: { spellcheck: "true" }
    });
    this.iframeEl = shell.createEl("iframe", {
      cls: "sp-print-preview-frame",
      attr: { title: "SermonPrint PDF preview" }
    });
    this.editorEl.addEventListener("input", () => this.schedulePreviewRefresh());
    await this.loadCurrentFile();
  }
  onClose() {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    return Promise.resolve();
  }
  async setFile(file) {
    this.file = file;
    await this.loadCurrentFile();
  }
  async loadCurrentFile() {
    const active = this.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
    const file = this.file || (active == null ? void 0 : active.file);
    if (!file) {
      if (this.editorEl) this.editorEl.value = "";
      this.lastHtml = buildPaginatedManuscriptHtml("", this.plugin.settings, "SermonPrint");
      if (this.iframeEl) this.iframeEl.srcdoc = this.lastHtml;
      new import_obsidian5.Notice("Open a sermon note first.");
      return;
    }
    this.file = file;
    if (this.editorEl) this.editorEl.value = await this.app.vault.read(file);
    this.renderPreview();
  }
  schedulePreviewRefresh() {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.renderPreview();
    }, 400);
  }
  buildCurrentHtml() {
    var _a, _b, _c;
    const markdown = (_b = (_a = this.editorEl) == null ? void 0 : _a.value) != null ? _b : "";
    const title = ((_c = this.file) == null ? void 0 : _c.basename) || "SermonPrint";
    return buildPaginatedManuscriptHtml(markdown, this.plugin.settings, title);
  }
  renderPreview() {
    var _a, _b;
    const markdown = (_b = (_a = this.editorEl) == null ? void 0 : _a.value) != null ? _b : "";
    if (this.lastHtml && markdown === this.lastMarkdown) return;
    this.lastMarkdown = markdown;
    this.lastHtml = this.buildCurrentHtml();
    if (this.iframeEl) this.iframeEl.srcdoc = this.lastHtml;
  }
  async saveMarkdown() {
    if (!this.file || !this.editorEl) {
      new import_obsidian5.Notice("Open a sermon note first.");
      return;
    }
    await this.app.vault.modify(this.file, this.editorEl.value);
    this.renderPreview();
    new import_obsidian5.Notice("SermonPrint markdown saved.");
  }
  async exportPdf() {
    if (!this.file) {
      new import_obsidian5.Notice("Open a sermon note first.");
      return;
    }
    const outputPath = await this.choosePdfPath();
    if (!outputPath) return;
    this.renderPreview();
    await this.plugin.exportHtmlToPdf(this.lastHtml, this.file.basename, outputPath);
  }
  async openMarkdownFile() {
    if (!this.file) return;
    await this.app.workspace.openLinkText(this.file.path, "", false);
  }
  async choosePdfPath() {
    var _a, _b, _c, _d, _e;
    if (!this.file) return null;
    const electron = (_a = window.require) == null ? void 0 : _a.call(window, "electron");
    const remote = electron == null ? void 0 : electron.remote;
    const dialog = (_b = remote == null ? void 0 : remote.dialog) != null ? _b : electron == null ? void 0 : electron.dialog;
    const currentWindow = (_c = remote == null ? void 0 : remote.getCurrentWindow) == null ? void 0 : _c.call(remote);
    if (!(dialog == null ? void 0 : dialog.showSaveDialog) && !(dialog == null ? void 0 : dialog.showSaveDialogSync)) {
      new import_obsidian5.Notice("SermonPrint could not open a save dialog in this Obsidian window.");
      return null;
    }
    const options = {
      title: "Save SermonPrint PDF",
      defaultPath: `${this.file.basename} SermonPrint.pdf`,
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    };
    if (dialog.showSaveDialog) {
      const result = currentWindow ? await dialog.showSaveDialog(currentWindow, options) : await dialog.showSaveDialog(options);
      return result.canceled ? null : this.ensurePdfExtension(result.filePath);
    }
    const selectedPath = currentWindow ? (_d = dialog.showSaveDialogSync(currentWindow, options)) != null ? _d : null : (_e = dialog.showSaveDialogSync(options)) != null ? _e : null;
    return this.ensurePdfExtension(selectedPath);
  }
  ensurePdfExtension(filePath) {
    if (!filePath) return null;
    return filePath.toLowerCase().endsWith(".pdf") ? filePath : `${filePath}.pdf`;
  }
};
async function openSermonPrintPrintPreview(plugin) {
  const active = plugin.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
  const file = active == null ? void 0 : active.file;
  if (!file) {
    new import_obsidian5.Notice("Open a sermon note first.");
    return;
  }
  const leaf = plugin.app.workspace.getLeaf("tab");
  await leaf.setViewState({ type: SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE, active: true });
  const view = leaf.view;
  await view.setFile(file);
}

// src/main.ts
var SermonPrintPlugin = class extends import_obsidian6.Plugin {
  async onload() {
    await this.loadSettings();
    this.exporter = new SermonPrintExporter(this, this.settings);
    this.addCommand({
      id: "sermonprint-engine-v2",
      name: "Engine V2",
      callback: () => openManuscriptEngineV2(this)
    });
    this.addSettingTab(new SermonPrintSettingTab(this.app, this));
    this.registerView(
      VIEW_TYPE_SERMONPRINT_MANUSCRIPT,
      (leaf) => new SermonPrintManuscriptView(leaf, this)
    );
    this.registerView(
      SERMONPRINT_V2_VIEW_TYPE,
      (leaf) => new ManuscriptEditorV2View(leaf, this)
    );
    this.registerView(
      SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE,
      (leaf) => new SermonPrintPrintPreviewView(leaf, this)
    );
    this.refreshLayoutStyles();
    this.addCommand({
      id: "sermonprint-edit-export",
      name: "Edit & Export",
      callback: async () => this.openManuscriptView()
    });
    this.addCommand({
      id: "sermonprint-compare-preview-pdf-pagination",
      name: "Compare Preview and PDF Pagination",
      callback: async () => this.comparePreviewAndPdfPagination()
    });
    this.addCommand({
      id: "sermonprint-print-preview",
      name: "Print Preview",
      callback: async () => openSermonPrintPrintPreview(this)
    });
  }
  async exportWithMode(mode) {
    await this.exporter.exportCurrentNote(mode);
  }
  async exportHtmlToPdf(html, basename2, outputPath) {
    return this.exporter.exportHtml(html, basename2, outputPath);
  }
  async openManuscriptView() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new import_obsidian6.Notice("Open a sermon note first.");
      return;
    }
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT)[0];
    if (!leaf) leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_SERMONPRINT_MANUSCRIPT, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
  async comparePreviewAndPdfPagination() {
    var _a, _b, _c;
    const file = this.app.workspace.getActiveFile();
    const manuscriptView = (_a = this.app.workspace.getLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT)[0]) == null ? void 0 : _a.view;
    const preview = (_b = manuscriptView == null ? void 0 : manuscriptView.getPaginationDiagnostics()) != null ? _b : null;
    const pdfPath = file ? this.getExportedPdfPath(file.basename) : null;
    const pdfPageCount = pdfPath && fs3.existsSync(pdfPath) ? this.readPdfPageCount(pdfPath) : null;
    const lines = [
      "SermonPrint pagination diagnostics",
      `Preview page count: ${(_c = preview == null ? void 0 : preview.previewPageCount) != null ? _c : "unavailable - open Legacy Edit & Export"}`,
      `PDF page count: ${pdfPageCount != null ? pdfPageCount : "unavailable - export PDF first"}`,
      `Preview effective page step: ${preview ? `${preview.previewEffectivePageStepIn.toFixed(3)}in` : "unavailable"}`,
      `Export page size/margins: ${preview ? `${preview.exportPageSize}, margin ${preview.exportMargin}` : `${this.settings.pageWidth} x ${this.settings.pageHeight}, margin ${this.settings.margin}`}`,
      `Preview guide text: ${(preview == null ? void 0 : preview.firstVisibleTextByGuide.length) ? preview.firstVisibleTextByGuide.map((text, index) => `Page ${index + 2}: ${text || "(blank)"}`).join(" | ") : "unavailable"}`,
      `PDF path: ${pdfPath != null ? pdfPath : "unavailable"}`
    ];
    console.log(lines.join("\n"));
    new import_obsidian6.Notice(lines.slice(1, 5).join("\n"), 12e3);
  }
  getExportedPdfPath(basename2) {
    const vaultPath = this.getVaultPath();
    if (!vaultPath) return null;
    const configuredFolder = (this.settings.pdfFolder || "Sermon PDFs").trim();
    const exportFolder = path4.isAbsolute(configuredFolder) ? configuredFolder : path4.join(vaultPath, configuredFolder);
    return path4.join(exportFolder, `${basename2} SermonPrint.pdf`);
  }
  getVaultPath() {
    var _a, _b, _c;
    const adapter = this.app.vault.adapter;
    return (_c = (_b = (_a = adapter.getBasePath) == null ? void 0 : _a.call(adapter)) != null ? _b : adapter.basePath) != null ? _c : null;
  }
  readPdfPageCount(pdfPath) {
    var _a;
    try {
      const text = fs3.readFileSync(pdfPath).toString("latin1");
      const matches = text.match(/\/Type\s*\/Page\b/g);
      return (_a = matches == null ? void 0 : matches.length) != null ? _a : null;
    } catch (e) {
      return null;
    }
  }
  onunload() {
    removeLayoutStyles();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT);
    this.app.workspace.detachLeavesOfType(SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE);
  }
  refreshLayoutStyles() {
    injectLayoutStyles(this.settings);
    this.exporter = new SermonPrintExporter(this, this.settings);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshLayoutStyles();
  }
};
