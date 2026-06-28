const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error("Usage: node booklet.js input.pdf output.pdf");
  process.exit(1);
}

const LETTER_LANDSCAPE = { width: 792, height: 612 };
const HALF_LETTER = { width: 396, height: 612 };

(async () => {
  const sourceBytes = fs.readFileSync(input);
  const sourcePdf = await PDFDocument.load(sourceBytes);
  const outputPdf = await PDFDocument.create();

  const pageCount = sourcePdf.getPageCount();
  const paddedCount = Math.ceil(pageCount / 4) * 4;
  const sheets = paddedCount / 4;

  async function drawPage(targetPage, sourceIndex, x) {
    if (sourceIndex < 0 || sourceIndex >= pageCount) return;
    const [embedded] = await outputPdf.embedPdf(sourceBytes, [sourceIndex]);
    targetPage.drawPage(embedded, {
      x,
      y: 0,
      width: HALF_LETTER.width,
      height: HALF_LETTER.height
    });
  }

  for (let sheet = 0; sheet < sheets; sheet++) {
    const front = outputPdf.addPage([LETTER_LANDSCAPE.width, LETTER_LANDSCAPE.height]);
    await drawPage(front, paddedCount - 1 - sheet * 2, 0);
    await drawPage(front, sheet * 2, HALF_LETTER.width);

    const back = outputPdf.addPage([LETTER_LANDSCAPE.width, LETTER_LANDSCAPE.height]);
    await drawPage(back, sheet * 2 + 1, 0);
    await drawPage(back, paddedCount - 2 - sheet * 2, HALF_LETTER.width);
  }

  fs.writeFileSync(output, await outputPdf.save());
})();
