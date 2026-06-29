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
var import_obsidian5 = require("obsidian");

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

// src/styles.ts
var STYLE_ID = "sermonprint-layout-styles";
function numberFromInches(value) {
  return parsePositiveInches(value, 1);
}
function numberFromAnyInch(value) {
  return parseInches(value, 0);
}
function getPageMetrics(settings) {
  const pageHeight = numberFromInches(settings.pageHeight);
  const pageWidth = numberFromInches(settings.pageWidth);
  const margin = numberFromInches(settings.margin);
  const offset = numberFromAnyInch(settings.pageGuideOffset);
  const printableHeight = Math.max(1, pageHeight - margin * 2);
  return { pageHeight, pageWidth, margin, printableHeight, guideAt: Math.max(1, pageHeight - margin + offset) };
}
function injectLayoutStyles(settings) {
  var _a;
  (_a = document.getElementById(STYLE_ID)) == null ? void 0 : _a.remove();
  const { pageHeight, pageWidth, margin, guideAt } = getPageMetrics(settings);
  const textWidth = Math.max(1, pageWidth - margin * 2);
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
  --sp-page-width: 5.5in;
  --sp-page-height: 8.5in;
  --sp-page-margin: .58in;
  --sp-printable-height: 7.34in;
  --sp-font-family: Georgia, serif;
  --sp-font-size: 12.5pt;
  --sp-line-height: 1.65;
  --sp-verse-color: #8b0000;
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
  margin: 0 0 .20in 0;
}
body .sermonprint-manuscript-editor h1 {
  text-align: center;
  font-size: 18pt;
  line-height: 1.15;
  margin: 0 0 .22in 0;
}
body .sermonprint-manuscript-editor h2 {
  font-size: 15pt;
  line-height: 1.22;
  margin: .34in 0 .16in;
}
body .sermonprint-manuscript-editor h3 {
  font-size: 13pt;
  line-height: 1.28;
  margin: .28in 0 .13in;
}
body .sermonprint-manuscript-editor h4 {
  font-size: 12pt;
  line-height: 1.25;
  margin: .18in 0 .10in;
}
body .sermonprint-manuscript-editor blockquote {
  margin: .20in 0 .22in .18in;
  padding-left: .15in;
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
  margin-top: .10in;
  margin-bottom: .18in;
  padding-left: .32in;
}
body .sermonprint-manuscript-editor li {
  margin-bottom: .10in;
}
body .sermonprint-manuscript-editor div,
body .sermonprint-manuscript-editor p,
body .sermonprint-manuscript-editor li,
body .sermonprint-manuscript-editor blockquote {
  max-width: 100%;
}


    body.sermonprint-layout {
      --sp-line-height: ${settings.lineHeight};
      --sp-paragraph-space: 0.20in;
      --sp-line-space: 0.095in;
      --sp-heading-before: 0.28in;
      --sp-heading-after: 0.13in;
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
      font-size: 18pt !important;
      line-height: 1.15 !important;
      margin: 0 0 0.18in 0 !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view h2,
    body.sermonprint-layout .markdown-rendered h2,
    body.sermonprint-layout .cm-header-2 {
      font-size: 15pt !important;
      line-height: 1.2 !important;
      margin-top: var(--sp-heading-before) !important;
      margin-bottom: var(--sp-heading-after) !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view h3,
    body.sermonprint-layout .markdown-rendered h3,
    body.sermonprint-layout .cm-header-3 {
      font-size: 13pt !important;
      line-height: 1.25 !important;
      margin-top: 0.22in !important;
      margin-bottom: 0.09in !important;
      font-weight: 700 !important;
    }

    body.sermonprint-layout .markdown-preview-view h4,
    body.sermonprint-layout .markdown-rendered h4,
    body.sermonprint-layout .cm-header-4 {
      font-size: 12pt !important;
      line-height: 1.25 !important;
      margin-top: 0.16in !important;
      margin-bottom: 0.07in !important;
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
      margin-top: 0.08in !important;
      margin-bottom: 0.13in !important;
      padding-left: 0.30in !important;
      max-width: ${textWidth}in !important;
    }

    body.sermonprint-layout .markdown-preview-view li,
    body.sermonprint-layout .markdown-rendered li {
      margin-bottom: 0.055in !important;
    }

    body.sermonprint-layout .markdown-preview-view blockquote,
    body.sermonprint-layout .markdown-rendered blockquote,
    body.sermonprint-layout blockquote {
      margin: 0.16in 0 0.16in 0.18in !important;
      padding-left: 0.14in !important;
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

body .sp-v2-toolbar button.is-active {
  background: #fff3f3;
  border-color: rgba(139,0,0,.45);
  color: #8b0000;
}

body .sp-v2-toolbar button.is-hidden {
  display: none;
}

body .sp-v2-dirty-indicator {
  display: none;
  color: #8b0000;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 12px;
  font-weight: 700;
}

body .sp-v2-dirty-indicator.is-visible {
  display: inline-flex;
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

body .sp-page-content.is-editing {
  outline: 2px solid rgba(139,0,0,.55);
  outline-offset: 6px;
  background: rgba(139,0,0,.035);
  caret-color: #8b0000;
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
    await this.plugin.app.vault.modify(this.file, markdown);
    new import_obsidian3.Notice("SermonPrint manuscript saved.");
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
    const pageHeightPx = parsePositiveInches(this.plugin.settings.pageHeight, 8.5) * INCH_TO_PX;
    const totalHeight = Math.max(pageHeightPx, this.editorEl.scrollHeight + 24);
    const pages = Math.max(1, Math.ceil(totalHeight / pageHeightPx));
    for (let i = 1; i <= pages; i++) {
      const marker = this.guidesEl.createDiv({ cls: "sermonprint-page-break-marker" });
      marker.style.top = `${i * pageHeightPx}px`;
      marker.createSpan({ text: `Page ${i + 1}` });
    }
    this.pageCountEl.setText(`Page 1 of ${pages}`);
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
    this.editButton = null;
    this.cancelEditButton = null;
    this.saveButton = null;
    this.dirtyIndicatorEl = null;
    this.currentPages = [];
    this.renderedMarkdownSnapshot = "";
    this.debugEnabled = false;
    this.editMode = false;
    this.dirty = false;
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
    toolbar.createEl("button", { text: "Refresh" }).onclick = () => this.refreshFromDiskWithWarning();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFileWithWarning();
    this.editButton = toolbar.createEl("button", { text: "Edit Mode" });
    this.editButton.onclick = () => {
      if (this.editMode) return;
      this.editMode = true;
      this.applyEditModeToPages();
    };
    this.cancelEditButton = toolbar.createEl("button", { text: "Cancel Edit" });
    this.cancelEditButton.onclick = () => this.cancelEditMode();
    this.saveButton = toolbar.createEl("button", { text: "Save" });
    this.saveButton.disabled = true;
    this.saveButton.onclick = () => this.saveEditedMarkdown();
    this.dirtyIndicatorEl = toolbar.createSpan({ text: "\u25CF Unsaved", cls: "sp-v2-dirty-indicator" });
    this.updateEditStateControls();
    toolbar.createEl("button", { text: "Export PDF" }).onclick = () => this.plugin.exportWithMode("pdf");
    toolbar.createEl("button", { text: "Export Booklet" }).onclick = () => this.plugin.exportWithMode("booklet");
    const debugButton = toolbar.createEl("button", { text: "Debug" });
    debugButton.toggleClass("is-active", this.debugEnabled);
    debugButton.onclick = () => {
      this.debugEnabled = !this.debugEnabled;
      debugButton.toggleClass("is-active", this.debugEnabled);
      this.updateDebugOverlays();
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
  async renderCurrentFile(restoreState = null) {
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
    this.currentPages = pages;
    this.currentMeasuredHeights = measuredHeights;
    this.dirty = false;
    pagesEl.innerHTML = renderPagesToHtml(pages, DEFAULT_PAGE_SETTINGS);
    this.renderedMarkdownSnapshot = this.markdownFromRenderedPages();
    this.applyEditModeToPages();
    this.updateDebugOverlays();
    if (restoreState) this.restorePosition(restoreState);
  }
  applyEditModeToPages() {
    var _a;
    const pagesEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(".sp-v2-pages");
    this.updateEditStateControls();
    if (!pagesEl) return;
    pagesEl.querySelectorAll(".sp-page-content").forEach((contentEl) => {
      contentEl.contentEditable = this.editMode ? "true" : "false";
      contentEl.spellcheck = this.editMode;
      contentEl.toggleClass("is-editing", this.editMode);
      contentEl.oninput = this.editMode ? () => this.markDirty() : null;
      contentEl.onbeforeinput = this.editMode ? () => this.markDirty() : null;
      contentEl.onpaste = this.editMode ? () => this.markDirty() : null;
    });
  }
  markDirty() {
    if (!this.editMode || this.dirty) return;
    this.dirty = true;
    this.updateEditStateControls();
  }
  updateEditStateControls() {
    if (this.editButton) this.editButton.toggleClass("is-active", this.editMode);
    if (this.cancelEditButton) this.cancelEditButton.toggleClass("is-hidden", !this.editMode);
    if (this.saveButton) this.saveButton.disabled = !this.editMode || !this.dirty;
    if (this.dirtyIndicatorEl) this.dirtyIndicatorEl.toggleClass("is-visible", this.editMode && this.dirty);
  }
  hasUnsavedEdits() {
    return this.editMode && (this.dirty || this.markdownFromRenderedPages() !== this.renderedMarkdownSnapshot);
  }
  confirmDiscardUnsavedChanges(action) {
    if (!this.hasUnsavedEdits()) return true;
    return window.confirm(`You have unsaved Engine V2 edits. ${action}?`);
  }
  async refreshFromDiskWithWarning() {
    if (!this.confirmDiscardUnsavedChanges("Discard them and refresh from markdown")) return;
    await this.renderCurrentFile(this.captureRestoreState());
  }
  async openMarkdownFileWithWarning() {
    if (!this.confirmDiscardUnsavedChanges("Leave without saving")) return;
    await this.openMarkdownFile();
  }
  async cancelEditMode() {
    const restoreState = this.captureRestoreState();
    this.editMode = false;
    this.dirty = false;
    this.updateEditStateControls();
    await this.renderCurrentFile(restoreState);
  }
  updateDebugOverlays() {
    var _a;
    const pagesEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(".sp-v2-pages");
    if (!pagesEl) return;
    pagesEl.querySelectorAll(".sp-debug-overlay").forEach((overlay) => overlay.remove());
    if (this.debugEnabled) this.renderDebugOverlays(pagesEl, this.currentPages, this.currentMeasuredHeights);
  }
  async saveEditedMarkdown() {
    var _a;
    if (!this.editMode || !this.dirty) return;
    if (!this.file) {
      new import_obsidian4.Notice("Open a sermon note first.");
      return;
    }
    const pagesEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(".sp-v2-pages");
    if (!pagesEl) return;
    const markdown = this.markdownFromRenderedPages();
    if (!markdown) return;
    const restoreState = this.captureRestoreState();
    await this.app.vault.modify(this.file, markdown);
    new import_obsidian4.Notice("SermonPrint Engine V2 saved.");
    await this.renderCurrentFile(restoreState);
  }
  captureRestoreState() {
    var _a;
    const pagesEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(".sp-v2-pages");
    const scroller = this.rootEl;
    if (!pagesEl || !scroller) return null;
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const selectedBlock = range ? this.closestEditableBlock(range.startContainer) : null;
    const pageEl = selectedBlock == null ? void 0 : selectedBlock.closest(".sp-page");
    const visiblePage = this.visiblePageElement();
    const targetPage = pageEl || visiblePage;
    const blockIndex = selectedBlock ? this.blockIndexInPages(selectedBlock) : -1;
    return {
      scrollTop: scroller.scrollTop,
      pageNumber: Number((targetPage == null ? void 0 : targetPage.dataset.page) || (visiblePage == null ? void 0 : visiblePage.dataset.page) || 1),
      blockIndex,
      tagName: (selectedBlock == null ? void 0 : selectedBlock.tagName.toLowerCase()) || "",
      text: selectedBlock ? this.textFromElement(selectedBlock) : "",
      textOffset: range && selectedBlock ? this.textOffsetWithin(selectedBlock, range) : 0
    };
  }
  restorePosition(state) {
    const scroller = this.rootEl;
    if (!scroller) return;
    scroller.scrollTop = state.scrollTop;
    if (!this.editMode) {
      this.scrollPageIntoView(state.pageNumber, state.scrollTop);
      return;
    }
    const block = this.findClosestBlock(state);
    if (!block) {
      this.scrollPageIntoView(state.pageNumber, state.scrollTop);
      return;
    }
    this.placeCaret(block, state.textOffset);
    block.scrollIntoView({ block: "center" });
  }
  visiblePageElement() {
    var _a;
    const pages = Array.from(((_a = this.rootEl) == null ? void 0 : _a.querySelectorAll(".sp-page")) || []);
    if (!this.rootEl || pages.length === 0) return null;
    const rootTop = this.rootEl.getBoundingClientRect().top;
    return pages.reduce((closest, page) => {
      const currentDistance = Math.abs(page.getBoundingClientRect().top - rootTop);
      const closestDistance = Math.abs(closest.getBoundingClientRect().top - rootTop);
      return currentDistance < closestDistance ? page : closest;
    }, pages[0]);
  }
  scrollPageIntoView(pageNumber, fallbackScrollTop) {
    var _a;
    const pageEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(`.sp-page[data-page="${pageNumber}"]`);
    if (pageEl) pageEl.scrollIntoView({ block: "start" });
    else if (this.rootEl) this.rootEl.scrollTop = fallbackScrollTop;
  }
  closestEditableBlock(node) {
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    const block = el == null ? void 0 : el.closest("h1, h2, blockquote, p");
    return (block == null ? void 0 : block.closest(".sp-page-content")) ? block : null;
  }
  blockIndexInPages(block) {
    var _a;
    const blocks = Array.from(((_a = this.rootEl) == null ? void 0 : _a.querySelectorAll(".sp-page-content > h1, .sp-page-content > h2, .sp-page-content > blockquote, .sp-page-content > p")) || []);
    return blocks.indexOf(block);
  }
  findClosestBlock(state) {
    var _a, _b;
    const blocks = Array.from(((_a = this.rootEl) == null ? void 0 : _a.querySelectorAll(".sp-page-content > h1, .sp-page-content > h2, .sp-page-content > blockquote, .sp-page-content > p")) || []);
    if (blocks.length === 0) return null;
    const exactTextMatch = blocks.find((block) => block.tagName.toLowerCase() === state.tagName && this.textFromElement(block) === state.text);
    if (exactTextMatch) return exactTextMatch;
    const sameTagBlocks = blocks.filter((block) => block.tagName.toLowerCase() === state.tagName);
    if (sameTagBlocks.length > 0 && state.blockIndex >= 0) {
      return sameTagBlocks.reduce((closest, block) => {
        return Math.abs(blocks.indexOf(block) - state.blockIndex) < Math.abs(blocks.indexOf(closest) - state.blockIndex) ? block : closest;
      }, sameTagBlocks[0]);
    }
    if (state.blockIndex >= 0) return blocks[Math.min(state.blockIndex, blocks.length - 1)];
    return ((_b = this.rootEl) == null ? void 0 : _b.querySelector(`.sp-page[data-page="${state.pageNumber}"] .sp-page-content > *`)) || blocks[0];
  }
  textOffsetWithin(block, range) {
    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(block);
    prefixRange.setEnd(range.startContainer, range.startOffset);
    return prefixRange.toString().length;
  }
  placeCaret(block, textOffset) {
    const selection = window.getSelection();
    if (!selection) return;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let remaining = textOffset;
    let target = null;
    let offset = 0;
    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (remaining <= textNode.data.length) {
        target = textNode;
        offset = remaining;
        break;
      }
      remaining -= textNode.data.length;
    }
    if (!target) {
      target = block.lastChild instanceof Text ? block.lastChild : document.createTextNode("");
      if (!target.parentNode) block.appendChild(target);
      offset = target.data.length;
    }
    const range = document.createRange();
    range.setStart(target, Math.min(offset, target.data.length));
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    block.focus();
  }
  markdownFromRenderedPages() {
    var _a;
    const pagesEl = (_a = this.rootEl) == null ? void 0 : _a.querySelector(".sp-v2-pages");
    if (!pagesEl) return "";
    const blocks = [];
    pagesEl.querySelectorAll(".sp-page-content").forEach((contentEl) => {
      Array.from(contentEl.children).forEach((child) => {
        const el = child;
        const text = this.textFromElement(el);
        if (!text) return;
        const tag = el.tagName.toLowerCase();
        if (tag === "h1") blocks.push(`# ${text}`);
        else if (tag === "h2") blocks.push(`## ${text}`);
        else if (tag === "blockquote") blocks.push(text.split(/\n+/).map((line) => `> ${line.trim()}`).join("\n"));
        else blocks.push(text);
      });
    });
    return `${blocks.join("\n\n")}
`;
  }
  textFromElement(el) {
    return (el.innerText || el.textContent || "").replace(/\u00a0/g, " ").trim();
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

// src/main.ts
var SermonPrintPlugin = class extends import_obsidian5.Plugin {
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
    this.refreshLayoutStyles();
    this.addCommand({
      id: "sermonprint-edit-export",
      name: "Edit & Export",
      callback: () => openManuscriptEngineV2(this)
    });
    this.addCommand({
      id: "sermonprint-legacy-edit-export",
      name: "Legacy Edit & Export",
      callback: async () => this.openManuscriptView()
    });
  }
  async exportWithMode(mode) {
    await this.exporter.exportCurrentNote(mode);
  }
  async openManuscriptView() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new import_obsidian5.Notice("Open a sermon note first.");
      return;
    }
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT)[0];
    if (!leaf) leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_SERMONPRINT_MANUSCRIPT, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
  onunload() {
    removeLayoutStyles();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT);
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
