import { ItemView, MarkdownView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import SermonPrintPlugin from "../main";
import { buildPaginatedManuscriptHtml } from "../export/ManuscriptHtml";

export const SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE = "sermonprint-editable-print-preview";

export class SermonPrintEditablePrintPreviewView extends ItemView {
  plugin: SermonPrintPlugin;
  file: TFile | null = null;
  iframeEl: HTMLIFrameElement | null = null;
  lastMarkdown = "";

  constructor(leaf: WorkspaceLeaf, plugin: SermonPrintPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "SermonPrint Editable Print Preview";
  }

  async onOpen(): Promise<void> {
    this.containerEl.empty();

    const root = this.containerEl.createDiv({ cls: "sp-print-preview-root" });
    const toolbar = root.createDiv({ cls: "sp-print-preview-toolbar" });

    toolbar.createEl("button", { text: "Save" }).onclick = () => this.saveMarkdown();
    toolbar.createEl("button", { text: "Refresh from Markdown" }).onclick = () => this.refreshFromMarkdown();
    toolbar.createEl("button", { text: "Export PDF" }).onclick = () => this.exportPdf();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFile();

    const shell = root.createDiv({ cls: "sp-print-preview-shell" });
    this.iframeEl = shell.createEl("iframe", {
      cls: "sp-print-preview-frame",
      attr: { title: "SermonPrint Editable Print Preview" },
    });

    await this.loadCurrentFile();
  }

  async setFile(file: TFile): Promise<void> {
    this.file = file;
    await this.loadCurrentFile();
  }

  private async loadCurrentFile(): Promise<void> {
    const active = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = this.file || active?.file;

    if (!file) {
      new Notice("Open a sermon note first.");
      return;
    }

    this.file = file;
    this.lastMarkdown = await this.app.vault.read(file);
    this.renderMarkdown(this.lastMarkdown);
  }

  private renderMarkdown(markdown: string): void {
    if (!this.iframeEl) return;

    this.iframeEl.onload = () => this.enablePageEditing();
    this.iframeEl.srcdoc = buildPaginatedManuscriptHtml(markdown, this.plugin.settings, this.file?.basename || "SermonPrint");
  }

  private enablePageEditing(): void {
    const doc = this.iframeEl?.contentDocument;
    if (!doc) return;

    doc.querySelectorAll<HTMLElement>(".sp-print-page-content").forEach((pageContent) => {
      pageContent.contentEditable = "true";
      pageContent.spellcheck = true;
    });

    doc.querySelectorAll<HTMLElement>(".sp-print-page-label, .sp-print-source").forEach((el) => {
      el.contentEditable = "false";
    });
  }

  private async refreshFromMarkdown(): Promise<void> {
    if (!this.file) {
      new Notice("Open a sermon note first.");
      return;
    }

    this.lastMarkdown = await this.app.vault.read(this.file);
    this.renderMarkdown(this.lastMarkdown);
  }

  private async saveMarkdown(): Promise<void> {
    if (!this.file) {
      new Notice("Open a sermon note first.");
      return;
    }

    const markdown = this.currentPagesToMarkdown();
    await this.app.vault.modify(this.file, markdown);
    this.lastMarkdown = markdown;
    new Notice("SermonPrint editable preview saved.");
  }

  private async exportPdf(): Promise<void> {
    if (!this.file) {
      new Notice("Open a sermon note first.");
      return;
    }

    const outputPath = await this.choosePdfPath();
    if (!outputPath) return;

    const html = this.currentDisplayedHtml();
    await this.plugin.exportHtmlToPdf(html, this.file.basename, outputPath);
  }

  private currentDisplayedHtml(): string {
    const doc = this.iframeEl?.contentDocument;
    if (!doc) return buildPaginatedManuscriptHtml("", this.plugin.settings, "SermonPrint");

    const clone = doc.documentElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll<HTMLElement>("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
    clone.querySelectorAll<HTMLElement>(".sp-print-page-content").forEach((el) => {
      el.removeAttribute("spellcheck");
    });

    return `<!doctype html>\n${clone.outerHTML}`;
  }

  private currentPagesToMarkdown(): string {
    const doc = this.iframeEl?.contentDocument;
    if (!doc) return "";

    const blocks = Array.from(doc.querySelectorAll<HTMLElement>(".sp-print-page-content > *"));
    const markdownBlocks: string[] = [];
    const seenContinuationIds = new Set<string>();

    blocks.forEach((block) => {
      const continuationOf = block.dataset.spContinuationOf;
      if (continuationOf) {
        const last = markdownBlocks.pop() ?? "";
        markdownBlocks.push(`${last}${this.blockText(block)}`);
        seenContinuationIds.add(continuationOf);
        return;
      }

      if (block.dataset.spBlockId && seenContinuationIds.has(block.dataset.spBlockId)) return;

      const markdown = this.blockToMarkdown(block);
      if (markdown) markdownBlocks.push(markdown);
    });

    return markdownBlocks.join("\n\n").trimEnd() + "\n";
  }

  private blockToMarkdown(block: HTMLElement): string {
    const tag = block.tagName.toLowerCase();

    if (tag === "h1") return `# ${this.blockText(block)}`;
    if (tag === "h2") return `## ${this.blockText(block)}`;
    if (tag === "h3") return `### ${this.blockText(block)}`;
    if (tag === "blockquote") return this.blockText(block).split("\n").map((line) => `> ${line}`).join("\n");
    if (tag === "ul") return Array.from(block.querySelectorAll(":scope > li")).map((li) => this.listItemToMarkdown(li as HTMLElement, false)).join("\n");
    if (tag === "ol") return Array.from(block.querySelectorAll(":scope > li")).map((li, index) => `${index + 1}. ${this.listItemText(li as HTMLElement)}`).join("\n");
    if (tag === "hr") return "---";
    if (block.classList.contains("sp-blank-line")) return "";
    if (tag === "p") return this.blockText(block);

    return this.blockText(block);
  }

  private listItemToMarkdown(item: HTMLElement, ordered: boolean): string {
    if (ordered) return this.listItemText(item);

    const checkbox = item.querySelector<HTMLInputElement>("input[type='checkbox']");
    if (checkbox) return `- [${checkbox.checked ? "x" : " "}] ${this.listItemText(item)}`;
    return `- ${this.listItemText(item)}`;
  }

  private listItemText(item: HTMLElement): string {
    const clone = item.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input[type='checkbox']").forEach((input) => input.remove());
    return this.blockText(clone);
  }

  private blockText(block: HTMLElement): string {
    return block.innerText.replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").trim();
  }

  private async openMarkdownFile(): Promise<void> {
    if (!this.file) return;
    await this.app.workspace.openLinkText(this.file.path, "", false);
  }

  private async choosePdfPath(): Promise<string | null> {
    if (!this.file) return null;

    const electron = (window as any).require?.("electron");
    const remote = electron?.remote;
    const dialog = remote?.dialog ?? electron?.dialog;
    const currentWindow = remote?.getCurrentWindow?.();

    if (!dialog?.showSaveDialog && !dialog?.showSaveDialogSync) {
      new Notice("SermonPrint could not open a save dialog in this Obsidian window.");
      return null;
    }

    const options = {
      title: "Save SermonPrint PDF",
      defaultPath: `${this.file.basename} SermonPrint.pdf`,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    };

    if (dialog.showSaveDialog) {
      const result = currentWindow
        ? await dialog.showSaveDialog(currentWindow, options)
        : await dialog.showSaveDialog(options);
      return result.canceled ? null : this.ensurePdfExtension(result.filePath);
    }

    const selectedPath = currentWindow
      ? dialog.showSaveDialogSync(currentWindow, options) ?? null
      : dialog.showSaveDialogSync(options) ?? null;
    return this.ensurePdfExtension(selectedPath);
  }

  private ensurePdfExtension(filePath: string | null | undefined): string | null {
    if (!filePath) return null;
    return filePath.toLowerCase().endsWith(".pdf") ? filePath : `${filePath}.pdf`;
  }
}

export async function openSermonPrintEditablePrintPreview(plugin: SermonPrintPlugin): Promise<void> {
  const active = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  const file = active?.file;

  if (!file) {
    new Notice("Open a sermon note first.");
    return;
  }

  const leaf = plugin.app.workspace.getLeaf("tab");
  await leaf.setViewState({ type: SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE, active: true });

  const view = leaf.view as SermonPrintEditablePrintPreviewView;
  await view.setFile(file);
}
