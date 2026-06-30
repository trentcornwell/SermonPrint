import { SermonPrintSettings } from "./settings";
import { parseInches } from "./engine/Layout";
import { MANUSCRIPT_LAYOUT_DEFAULTS, MANUSCRIPT_SPACING, getManuscriptLayoutMetrics } from "./export/ManuscriptHtml";

const STYLE_ID = "sermonprint-layout-styles";

function numberFromAnyInch(value: string): number {
  return parseInches(value, 0);
}

export function getPageMetrics(settings: SermonPrintSettings): {
  pageHeight: number;
  pageWidth: number;
  margin: number;
  printableHeight: number;
  guideAt: number;
} {
  const metrics = getManuscriptLayoutMetrics(settings);
  const pageHeight = metrics.pageHeightIn;
  const pageWidth = metrics.pageWidthIn;
  const margin = metrics.marginIn;
  const offset = numberFromAnyInch(settings.pageGuideOffset);
  const printableHeight = metrics.printableHeightIn;
  return { pageHeight, pageWidth, margin, printableHeight, guideAt: Math.max(1, metrics.firstGuideTopIn + offset) };
}

export function injectLayoutStyles(settings: SermonPrintSettings): void {
  document.getElementById(STYLE_ID)?.remove();

  const { pageHeight, pageWidth, margin, guideAt } = getPageMetrics(settings);
  const textWidth = Math.max(1, pageWidth - margin * 2);
  const defaults = MANUSCRIPT_LAYOUT_DEFAULTS;
  const spacing = MANUSCRIPT_SPACING;

  // In editable Live Preview, the paper card includes padding for margins.
  // The red guide marks the bottom of the printable area on each physical page.
  const guideBackground = settings.showPageGuides
    ? `background-image: repeating-linear-gradient(
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
      background-position: 0 0 !important;`
    : "background-image: none !important;";

  const shadow = settings.showPageShadow ? "box-shadow: 0 0 18px rgba(0,0,0,0.26) !important;" : "";
  const ruler = settings.showMarginRuler
    ? `outline: 1px solid rgba(0,0,0,0.08) !important;
       border-left: 1px solid rgba(139,0,0,0.16) !important;
       border-right: 1px solid rgba(139,0,0,0.16) !important;`
    : "";

  const keepTogether = settings.keepTogetherRules
    ? `
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
    `
    : "";

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
      content: "SermonPrint editable 5.5 × 8.5 page view";
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

export function removeLayoutStyles(): void {
  document.getElementById(STYLE_ID)?.remove();
}
