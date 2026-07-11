import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_SETTINGS, SermonPrintSettings, SermonPrintSettingTab } from "./settings";
import { injectLayoutStyles, removeLayoutStyles } from "./styles";
import { SermonPrintExporter, type ExportMode } from "./exporter";
import { SermonPrintManuscriptView, VIEW_TYPE_SERMONPRINT_MANUSCRIPT } from "./manuscriptView";
import { SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE, SermonPrintPrintPreviewView } from "./ui/PrintPreviewView";
import { SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE, SermonPrintEditablePrintPreviewView, openSermonPrintEditablePrintPreview } from "./ui/EditablePrintPreviewView";

export default class SermonPrintPlugin extends Plugin {
  settings: SermonPrintSettings;
  exporter: SermonPrintExporter;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.exporter = new SermonPrintExporter(this, this.settings);
    this.addSettingTab(new SermonPrintSettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE_SERMONPRINT_MANUSCRIPT,
      (leaf: WorkspaceLeaf) => new SermonPrintManuscriptView(leaf, this)
    );

    this.registerView(
      SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new SermonPrintPrintPreviewView(leaf, this)
    );

    this.registerView(
      SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new SermonPrintEditablePrintPreviewView(leaf, this)
    );

    this.refreshLayoutStyles();

    // The only user-facing command, displayed by Obsidian as
    // "SermonPrint: Open". Always opens the Editable Print Preview editor,
    // whose page layout is produced by buildPaginatedManuscriptHtml() +
    // paginationScript() - the same code path used for PDF/booklet export
    // (see exportHtml()/exportHtmlBooklet() below) - so what the user edits
    // is what gets exported. The command ID is kept as-is so any existing
    // hotkey binding keeps working.
    //
    // Print Preview and Legacy Edit & Export have no command anymore. Their
    // view types stay registered above (and openManuscriptView() below is
    // kept) purely so previously-saved workspace layouts that still
    // reference those leaves keep loading without erroring.
    this.addCommand({
      id: "sermonprint-editable-print-preview",
      name: "Open",
      callback: async () => openSermonPrintEditablePrintPreview(this)
    });
  }

  async exportWithMode(mode: ExportMode): Promise<void> {
    await this.exporter.exportCurrentNote(mode);
  }

  async exportHtmlToPdf(html: string, basename: string, outputPath?: string): Promise<string | null> {
    return this.exporter.exportHtml(html, basename, outputPath);
  }

  async exportHtmlToBooklet(html: string, basename: string, outputPath: string): Promise<string | null> {
    return this.exporter.exportHtmlBooklet(html, basename, outputPath);
  }

  /**
   * Re-renders every open SermonPrint editor (Editable Print Preview) leaf
   * with the current settings, without discarding unsaved edits - see
   * SermonPrintEditablePrintPreviewView.repaginate(). Called after a margin
   * change so the open editor repaginates with the exact same margin used
   * by PDF/booklet export, instead of only taking effect on next open.
   */
  refreshOpenEditors(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE)) {
      (leaf.view as SermonPrintEditablePrintPreviewView).repaginate();
    }
  }

  async openManuscriptView(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("Open a sermon note first.");
      return;
    }

    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT)[0];
    if (!leaf) leaf = this.app.workspace.getLeaf(true);

    await leaf.setViewState({ type: VIEW_TYPE_SERMONPRINT_MANUSCRIPT, active: true });
    this.app.workspace.revealLeaf(leaf);
  }

  /**
   * No-op. This used to show the Legacy Edit & Export view's approximate
   * page-count estimate in the status bar. That view is no longer the
   * primary workflow, and the accurate SermonPrint editor already shows
   * real, final pages in place - there is no separate estimate to show and
   * this is intentionally not replaced with another one. Kept as a callable
   * no-op so existing call sites (settings.ts, manuscriptView.ts) don't need
   * to change.
   */
  updateStatusBar(): void {}

  async comparePreviewAndPdfPagination(): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    const manuscriptView = this.app.workspace.getLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT)[0]?.view as SermonPrintManuscriptView | undefined;
    const preview = manuscriptView?.getPaginationDiagnostics() ?? null;
    const pdfPath = file ? this.getExportedPdfPath(file.basename) : null;
    const pdfPageCount = pdfPath && fs.existsSync(pdfPath) ? this.readPdfPageCount(pdfPath) : null;

    const lines = [
      "SermonPrint pagination diagnostics",
      `Preview page count: ${preview?.previewPageCount ?? "unavailable"}`,
      `PDF page count: ${pdfPageCount ?? "unavailable - export PDF first"}`,
      `Preview effective page step: ${preview ? `${preview.previewEffectivePageStepIn.toFixed(3)}in` : "unavailable"}`,
      `Export page size/margins: ${preview ? `${preview.exportPageSize}, margin ${preview.exportMargin}` : `${this.settings.pageWidth} x ${this.settings.pageHeight}, margin ${this.settings.margin}`}`,
      `Preview guide text: ${preview?.firstVisibleTextByGuide.length ? preview.firstVisibleTextByGuide.map((text, index) => `Page ${index + 2}: ${text || "(blank)"}`).join(" | ") : "unavailable"}`,
      `PDF path: ${pdfPath ?? "unavailable"}`,
    ];

    console.log(lines.join("\n"));
    new Notice(lines.slice(1, 5).join("\n"), 12000);
  }

  private getExportedPdfPath(basename: string): string | null {
    const vaultPath = this.getVaultPath();
    if (!vaultPath) return null;

    const configuredFolder = (this.settings.pdfFolder || "Sermon PDFs").trim();
    const exportFolder = path.isAbsolute(configuredFolder) ? configuredFolder : path.join(vaultPath, configuredFolder);
    return path.join(exportFolder, `${basename} SermonPrint.pdf`);
  }

  private getVaultPath(): string | null {
    const adapter: any = this.app.vault.adapter;
    return adapter.getBasePath?.() ?? adapter.basePath ?? null;
  }

  private readPdfPageCount(pdfPath: string): number | null {
    try {
      const text = fs.readFileSync(pdfPath).toString("latin1");
      const matches = text.match(/\/Type\s*\/Page\b/g);
      return matches?.length ?? null;
    } catch {
      return null;
    }
  }

  onunload(): void {
    removeLayoutStyles();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT);
    this.app.workspace.detachLeavesOfType(SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(SERMONPRINT_EDITABLE_PRINT_PREVIEW_VIEW_TYPE);
  }

  refreshLayoutStyles(): void {
    injectLayoutStyles(this.settings);
    this.exporter = new SermonPrintExporter(this, this.settings);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshLayoutStyles();
  }
}
