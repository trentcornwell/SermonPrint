const fs = require("fs");
const MarkdownIt = require("markdown-it");
const { chromium } = require("playwright");

const [
  ,
  ,
  input,
  output,
  title = "SermonPrint",
  fontFamily = "Georgia",
  fontSize = "12.5pt",
  pageWidth = "5.5in",
  pageHeight = "8.5in",
  margin = "0.58in",
  lineHeight = "1.65",
  keepTogetherRules = "true",
  autoPageBalancing = "true"
] = process.argv;

if (!input || !output) {
  console.error("Usage: node exporter.js input.md output.pdf title fontFamily fontSize pageWidth pageHeight margin lineHeight keepTogetherRules autoPageBalancing");
  process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cleanMarkdown(value) {
  return value.replace(/^kangaroo names\s*$/gim, "");
}

function preserveIntentionalBlankLines(markdown) {
  // Markdown preserves paragraph breaks, but collapses larger blank spaces.
  // In a sermon manuscript, those extra blank lines often matter visually.
  return markdown.replace(/\n{3,}/g, "\n\n<div class=\"sp-blank-line\"></div>\n\n");
}

const mdText = preserveIntentionalBlankLines(cleanMarkdown(fs.readFileSync(input, "utf8")));
const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true });
const html = md.render(mdText);

const verseColor = "#8b0000";

const keepCss = keepTogetherRules === "true" ? `
h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
blockquote, table, pre, .callout { break-inside: avoid; page-break-inside: avoid; }
li { break-inside: avoid; page-break-inside: avoid; }
p { orphans: 3; widows: 3; }
` : "";

const balanceCss = autoPageBalancing === "true" ? `
h2 + blockquote, h2 + p, h2 + ol, h2 + ul,
h3 + blockquote, h3 + p, h3 + ol, h3 + ul { break-before: avoid; page-break-before: avoid; }
` : "";

const documentHtml = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
@page {
  size: ${pageWidth} ${pageHeight};
  margin: ${margin};
}

html, body {
  margin: 0;
  padding: 0;
  background: white;
}

body {
  font-family: ${fontFamily}, Georgia, serif;
  font-size: ${fontSize};
  line-height: ${lineHeight};
  color: #111;
}

/*
  IMPORTANT:
  This export stylesheet intentionally mirrors the custom Manuscript View.
  If spacing changes in the viewer, change the same value here.
*/
.sermonprint-export {
  box-sizing: border-box;
  font-family: ${fontFamily}, Georgia, serif;
  font-size: ${fontSize};
  line-height: ${lineHeight};
  color: #111;
}

.sermonprint-export h1 {
  text-align: center;
  font-size: 18pt;
  line-height: 1.15;
  margin: 0 0 .22in 0;
}

.sermonprint-export h2 {
  font-size: 15pt;
  line-height: 1.22;
  margin: .34in 0 .16in;
}

.sermonprint-export h3 {
  font-size: 13pt;
  line-height: 1.28;
  margin: .28in 0 .13in;
}

.sermonprint-export h4 {
  font-size: 12pt;
  line-height: 1.25;
  margin: .18in 0 .10in;
}

.sermonprint-export p {
  margin: 0 0 .20in 0;
  orphans: 3;
  widows: 3;
}

.sermonprint-export br {
  display: block;
  content: "";
  margin-bottom: .12in;
}

.sermonprint-export .sp-blank-line {
  display: block;
  height: .24in;
}

.sermonprint-export ul,
.sermonprint-export ol {
  margin-top: .10in;
  margin-bottom: .18in;
  padding-left: .32in;
}

.sermonprint-export li {
  margin-bottom: .10in;
}

.sermonprint-export blockquote {
  margin: .20in 0 .22in .18in;
  padding-left: .15in;
  border-left: 3px solid ${verseColor};
  color: ${verseColor};
  font-style: italic;
}

.sermonprint-export .sp-verse-text,
.sermonprint-export font[color] {
  color: ${verseColor} !important;
}

.sermonprint-export hr {
  border: none;
  border-top: 1px solid #cfcfcf;
  margin: .22in 0;
}

.sermonprint-export .page-break {
  break-after: page;
  page-break-after: always;
}

${keepCss}
${balanceCss}
</style>
</head>
<body>
<main class="sermonprint-export">
${html}
</main>
</body>
</html>
`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(documentHtml, { waitUntil: "networkidle" });
  await page.pdf({
    path: output,
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
})();
