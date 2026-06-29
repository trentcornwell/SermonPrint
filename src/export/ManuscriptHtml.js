const MANUSCRIPT_LAYOUT_DEFAULTS = {
  fontFamily: "Georgia",
  fontSize: "12.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.58in",
  lineHeight: "1.65",
  verseColor: "#8b0000",
};

const MANUSCRIPT_SPACING = {
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

function parseInches(value, fallback) {
  const parsed = Number(String(value ?? "").replace("in", "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePositiveInches(value, fallback) {
  const parsed = parseInches(value, fallback);
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
    autoPageBalancing: settings.autoPageBalancing !== false,
  };
}

function getManuscriptLayoutMetrics(settings = {}) {
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

function cleanMarkdown(value) {
  return String(value).replace(/^kangaroo names\s*$/gim, "");
}

function preserveIntentionalBlankLines(markdown) {
  return String(markdown).replace(/\n{3,}/g, "\n\n<div class=\"sp-blank-line\"></div>\n\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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

function manuscriptPrintCss(settings = {}) {
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
`;
}

function renderMarkdownToHtml(markdown) {
  const MarkdownIt = eval("require")("markdown-it");
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true });
  return md.render(preserveIntentionalBlankLines(cleanMarkdown(markdown)));
}

function buildPrintHtml(markdown, settings = {}, title = "SermonPrint") {
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

module.exports = {
  MANUSCRIPT_LAYOUT_DEFAULTS,
  MANUSCRIPT_SPACING,
  buildPrintHtml,
  cleanMarkdown,
  getManuscriptLayoutMetrics,
  manuscriptContentCss,
  manuscriptPrintCss,
  normalizeSettings,
  preserveIntentionalBlankLines,
  renderMarkdownToHtml,
};
