import { ItemView, MarkdownView, Notice, TFile, WorkspaceLeaf } from "obsidian";
import SermonPrintPlugin from "../main";
import { buildPaginatedManuscriptHtml } from "../export/ManuscriptHtml";

export const SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE = "sermonprint-print-preview";

export class SermonPrintPrintPreviewView extends ItemView {
  plugin: SermonPrintPlugin;
  file: TFile | null = null;
  editorEl: HTMLTextAreaElement | null = null;
  iframeEl: HTMLIFrameElement | null = null;
  lastHtml = "";
  lastMarkdown = "";

  private refreshTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: SermonPrintPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "SermonPrint Print Preview";
  }

  async onOpen(): Promise<void> {
    this.containerEl.empty();

    const root = this.containerEl.createDiv({ cls: "sp-print-preview-root" });
    const toolbar = root.createDiv({ cls: "sp-print-preview-toolbar" });

    toolbar.createEl("button", { text: "Save" }).onclick = () => this.saveMarkdown();
    toolbar.createEl("button", { text: "Refresh" }).onclick = () => this.renderPreview();
    toolbar.createEl("button", { text: "Export PDF" }).onclick = () => this.exportPdf();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFile();

    const shell = root.createDiv({ cls: "sp-print-preview-shell" });
    this.editorEl = shell.createEl("textarea", {
      cls: "sp-print-preview-editor",
      attr: { spellcheck: "true" },
    });
    this.iframeEl = shell.createEl("iframe", {
      cls: "sp-print-preview-frame",
      attr: { title: "SermonPrint PDF preview" },
    });

    this.editorEl.addEventListener("input", () => this.schedulePreviewRefresh());
    await this.loadCurrentFile();
  }

  onClose(): Promise<void> {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    return Promise.resolve();
  }

  async setFile(file: TFile): Promise<void> {
    this.file = file;
    await this.loadCurrentFile();
  }

  private async loadCurrentFile(): Promise<void> {
    const active = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = this.file || active?.file;

    if (!file) {
      if (this.editorEl) this.editorEl.value = "";
      this.lastHtml = buildPaginatedManuscriptHtml("", this.plugin.settings, "SermonPrint");
      if (this.iframeEl) this.iframeEl.srcdoc = this.lastHtml;
      new Notice("Open a sermon note first.");
      return;
    }

    this.file = file;
    if (this.editorEl) this.editorEl.value = await this.app.vault.read(file);
    this.renderPreview();
  }

  private schedulePreviewRefresh(): void {
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.renderPreview();
    }, 400);
  }

  private buildCurrentHtml(): string {
    const markdown = this.editorEl?.value ?? "";
    const title = this.file?.basename || "SermonPrint";
    return buildPaginatedManuscriptHtml(markdown, this.plugin.settings, title);
  }

  renderPreview(): void {
    const markdown = this.editorEl?.value ?? "";
    if (this.lastHtml && markdown === this.lastMarkdown) return;

    this.lastMarkdown = markdown;
    this.lastHtml = this.buildCurrentHtml();
    if (this.iframeEl) this.iframeEl.srcdoc = this.lastHtml;
  }

  private async saveMarkdown(): Promise<void> {
    if (!this.file || !this.editorEl) {
      new Notice("Open a sermon note first.");
      return;
    }

    await this.app.vault.modify(this.file, this.editorEl.value);
    this.renderPreview();
    new Notice("SermonPrint markdown saved.");
  }

  private async exportPdf(): Promise<void> {
    if (!this.file) {
      new Notice("Open a sermon note first.");
      return;
    }

    const outputPath = await this.choosePdfPath();
    if (!outputPath) return;

    this.renderPreview();
    await this.plugin.exportHtmlToPdf(this.lastHtml, this.file.basename, outputPath);
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

export async function openSermonPrintPrintPreview(plugin: SermonPrintPlugin): Promise<void> {
  const active = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  const file = active?.file;

  if (!file) {
    new Notice("Open a sermon note first.");
    return;
  }

  const leaf = plugin.app.workspace.getLeaf("tab");
  await leaf.setViewState({ type: SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE, active: true });

  const view = leaf.view as SermonPrintPrintPreviewView;
  await view.setFile(file);
}
