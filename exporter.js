const fs = require("fs");
const { chromium } = require("playwright");
const { buildManuscriptHtml } = require("./ManuscriptHtml");

const args = process.argv.slice(2);

function printUsageAndExit() {
  console.error("Usage: node exporter.js input.md output.pdf title fontFamily fontSize pageWidth pageHeight margin lineHeight keepTogetherRules autoPageBalancing");
  console.error("   or: node exporter.js --html input.html output.pdf");
  process.exit(1);
}

let documentHtml;
let outputPath;

if (args[0] === "--html") {
  const [, htmlInput, pdfOutput] = args;
  if (!htmlInput || !pdfOutput) printUsageAndExit();
  documentHtml = fs.readFileSync(htmlInput, "utf8");
  outputPath = pdfOutput;
} else {
  const [
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
  ] = args;

  if (!input || !output) printUsageAndExit();

  documentHtml = buildManuscriptHtml(fs.readFileSync(input, "utf8"), {
    fontFamily,
    fontSize,
    pageWidth,
    pageHeight,
    margin,
    lineHeight,
    keepTogetherRules: keepTogetherRules === "true",
    autoPageBalancing: autoPageBalancing === "true",
  }, title);
  outputPath = output;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(documentHtml, { waitUntil: "networkidle" });
  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
})();
