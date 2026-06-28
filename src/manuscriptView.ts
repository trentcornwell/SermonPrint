import { ItemView, MarkdownRenderer, Notice, TFile, WorkspaceLeaf } from "obsidian";
import SermonPrintPlugin from "./main";
import { applyLayoutVariables, pageSizeForPreset, parseInches, parsePoints } from "./layout/engine";
import { calculateVisualPages } from "./layout/paginator";

export const VIEW_TYPE_SERMONPRINT_MANUSCRIPT = "sermonprint-manuscript-view";

type BlockTag = "h1" | "h2" | "h3" | "p" | "blockquote";

type StructureInsert = {
  label: string;
  markdown: string;
};

const STRUCTURE_INSERTS: StructureInsert[] = [
  { label: "Big Idea", markdown: "> **Big Idea:** " },
  { label: "Text", markdown: "**Text:** " },
  { label: "Introduction", markdown: "## Introduction" },
  { label: "Review", markdown: "## Review" },
  { label: "Main Point 1", markdown: "## Point 1 — " },
  { label: "Main Point 2", markdown: "## Point 2 — " },
  { label: "Main Point 3", markdown: "## Point 3 — " },
  { label: "Main Point 4", markdown: "## Point 4 — " },
  { label: "Main Point 5", markdown: "## Point 5 — " },
  { label: "Main Point 6", markdown: "## Point 6 — " },
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

function inlineHtmlToMarkdown(el: HTMLElement): string {
  let output = "";

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      output += node.textContent ?? "";
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as HTMLElement;
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

function htmlToMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];

  function textOf(el: HTMLElement): string {
    return inlineHtmlToMarkdown(el).trimEnd();
  }

  function walkBlock(el: Element): void {
    const tag = el.tagName.toLowerCase();
    const htmlEl = el as HTMLElement;
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
      blocks.push(items.map((li, index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${textOf(li as HTMLElement).trim()}`).join("\n"));
    } else if (tag === "pre") {
      blocks.push("```\n" + text + "\n```");
    } else if (tag === "p" || tag === "div") {
      blocks.push(text);
    }
  }

  Array.from(root.children).forEach(walkBlock);
  return blocks.join("\n\n") + "\n";
}

export class SermonPrintManuscriptView extends ItemView {
  private plugin: SermonPrintPlugin;
  private file: TFile | null = null;
  private editorEl: HTMLElement | null = null;
  private guidesEl: HTMLElement | null = null;
  private pageCountEl: HTMLElement | null = null;
  private colorInput: HTMLInputElement | null = null;
  private updateTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: SermonPrintPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_SERMONPRINT_MANUSCRIPT;
  }

  getDisplayText(): string {
    return "SermonPrint Manuscript";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
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

  private buildToolbar(toolbar: HTMLElement): void {
    toolbar.createEl("button", { text: "Save" }).onclick = () => this.save();

    const pageSize = toolbar.createEl("select", { cls: "sermonprint-page-size-select" }) as HTMLSelectElement;
    pageSize.createEl("option", { text: "5.5 × 8.5", value: "half-sheet" });
    pageSize.createEl("option", { text: "Letter", value: "letter" });
    pageSize.createEl("option", { text: "A4", value: "a4" });
    pageSize.createEl("option", { text: "Legal", value: "legal" });
    pageSize.value = this.plugin.settings.pageSizePreset || "half-sheet";
    pageSize.onchange = async () => {
      await this.setPageSize(pageSize.value as any);
      this.applyManuscriptVariables();
      this.scheduleGuideUpdate();
    };

    toolbar.createEl("button", { text: "Normal" }).onclick = () => this.formatBlock("p");
    toolbar.createEl("button", { text: "H1" }).onclick = () => this.formatBlock("h1");
    toolbar.createEl("button", { text: "H2" }).onclick = () => this.formatBlock("h2");
    toolbar.createEl("button", { text: "H3" }).onclick = () => this.formatBlock("h3");

    const structure = toolbar.createEl("select", { cls: "sermonprint-structure-select" }) as HTMLSelectElement;
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
    this.colorInput = toolbar.createEl("input", { type: "color" }) as HTMLInputElement;
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

  private async setPageSize(value: "half-sheet" | "letter" | "a4" | "legal" | "custom"): Promise<void> {
    this.plugin.settings.pageSizePreset = value;
    if (value === "half-sheet") {
      const size = pageSizeForPreset(value);
      this.plugin.settings.pageWidth = size.width;
      this.plugin.settings.pageHeight = size.height;
    }
    await this.plugin.saveSettings();
  }

  async loadActiveFile(): Promise<void> {
    this.file = this.plugin.app.workspace.getActiveFile();
    if (!this.file || !this.editorEl) {
      new Notice("Open a sermon note before opening SermonPrint Manuscript View.");
      return;
    }

    this.editorEl.empty();
    const md = await this.plugin.app.vault.read(this.file);
    await MarkdownRenderer.render(this.plugin.app, md, this.editorEl, this.file.path, this);
    new Notice("SermonPrint Manuscript View loaded.");
    this.scheduleGuideUpdate();
  }

  async save(): Promise<void> {
    if (!this.file || !this.editorEl) return;
    const markdown = htmlToMarkdown(this.editorEl);
    await this.plugin.app.vault.modify(this.file, markdown);
    new Notice("SermonPrint manuscript saved.");
  }

  formatBlock(tag: BlockTag): void {
    this.editorEl?.focus();
    document.execCommand("formatBlock", false, tag);
    this.scheduleGuideUpdate();
  }

  private insertMarkdownBlock(markdown: string): void {
    this.editorEl?.focus();
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

  applyScriptureStyle(): void {
    const color = this.colorInput?.value || this.plugin.settings.bibleVerseColor || "#8b0000";
    this.plugin.settings.bibleVerseColor = color;
    this.plugin.saveSettings();
    this.editorEl?.focus();

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
    } catch {
      document.execCommand("foreColor", false, color);
    }
    this.scheduleGuideUpdate();
  }

  private applyManuscriptVariables(): void {
    const shell = this.containerEl.querySelector(".sermonprint-manuscript-shell") as HTMLElement | null;
    if (!shell) return;

    applyLayoutVariables(shell, this.plugin.settings);
  }

  private scheduleGuideUpdate(): void {
    if (this.updateTimer) window.clearTimeout(this.updateTimer);
    this.updateTimer = window.setTimeout(() => this.updatePageGuides(), 80);
  }

  private updatePageGuides(): void {
    if (!this.editorEl || !this.guidesEl || !this.pageCountEl) return;

    this.applyManuscriptVariables();
    this.guidesEl.empty();

    const layout = applyLayoutVariables(this.containerEl.querySelector(".sermonprint-manuscript-shell") as HTMLElement, this.plugin.settings);
    const pages = calculateVisualPages(this.editorEl.scrollHeight, layout);

    pages.slice(1).forEach((page) => {
      const marker = this.guidesEl!.createDiv({ cls: "sermonprint-page-break-marker" });
      marker.style.top = `${page.topPx}px`;
      marker.createSpan({ text: `Page ${page.pageNumber}` });
    });

    this.pageCountEl.setText(`Page 1 of ${pages.length}`);
  }
}
