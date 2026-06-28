import { SermonBlock } from "./Block";
import { SermonDocument } from "./Document";

function idFor(index: number): string {
  return `block-${index + 1}`;
}

function detectType(line: string): SermonBlock["type"] {
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

export function parseMarkdownToDocument(markdown: string, fallbackTitle = "Untitled Sermon"): SermonDocument {
  const chunks = markdown
    .split(/\n{2,}/)
    .map((x) => x.trim())
    .filter(Boolean);

  const blocks: SermonBlock[] = chunks.map((chunk, index) => {
    const type = detectType(chunk);
    const level = chunk.startsWith("### ") ? 3 : chunk.startsWith("## ") ? 2 : chunk.startsWith("# ") ? 1 : undefined;

    return {
      id: idFor(index),
      type,
      level,
      text: chunk,
    };
  });

  const titleBlock = blocks.find((b) => b.type === "title");
  const title = titleBlock?.text.replace(/^#\s+/, "").trim() || fallbackTitle;

  return {
    id: "sermon-document",
    title,
    blocks,
  };
}
