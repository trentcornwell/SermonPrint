const fs = require("fs");
const { chromium } = require("playwright");
const { buildPrintHtml } = require("./src/export/ManuscriptHtml");

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

const documentHtml = buildPrintHtml(fs.readFileSync(input, "utf8"), {
  fontFamily,
  fontSize,
  pageWidth,
  pageHeight,
  margin,
  lineHeight,
  keepTogetherRules: keepTogetherRules === "true",
  autoPageBalancing: autoPageBalancing === "true",
}, title);

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
