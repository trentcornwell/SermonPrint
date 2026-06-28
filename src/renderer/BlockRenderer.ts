import { SermonBlock } from "../engine/Block";

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s?/, "")
    .replace(/\*\*/g, "")
    .trim();
}

export function blockToHtml(block: SermonBlock): string {
  const text = stripMarkdown(block.text);

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
