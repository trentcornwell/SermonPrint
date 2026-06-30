import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_SETTINGS, SermonPrintSettings, SermonPrintSettingTab } from "./settings";
import { injectLayoutStyles, removeLayoutStyles } from "./styles";
import { SermonPrintExporter, type ExportMode } from "./exporter";
import { SermonPrintManuscriptView, VIEW_TYPE_SERMONPRINT_MANUSCRIPT } from "./manuscriptView";
import { ManuscriptEditorV2View, SERMONPRINT_V2_VIEW_TYPE, openManuscriptEngineV2 } from "./ui/ManuscriptEditorV2";
import { SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE, SermonPrintPrintPreviewView, openSermonPrintPrintPreview } from "./ui/PrintPreviewView";

export default class SermonPrintPlugin extends Plugin {
  settings: SermonPrintSettings;
  exporter: SermonPrintExporter;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.exporter = new SermonPrintExporter(this, this.settings);
    this.addCommand({
      id: "sermonprint-engine-v2",
      name: "Engine V2",
      callback: () => openManuscriptEngineV2(this),
    });

    this.addSettingTab(new SermonPrintSettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE_SERMONPRINT_MANUSCRIPT,
      (leaf: WorkspaceLeaf) => new SermonPrintManuscriptView(leaf, this)
    );

    this.registerView(
      SERMONPRINT_V2_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new ManuscriptEditorV2View(leaf, this)
    );

    this.registerView(
      SERMONPRINT_PRINT_PREVIEW_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new SermonPrintPrintPreviewView(leaf, this)
    );

    this.refreshLayoutStyles();

    this.addCommand({
      id: "sermonprint-edit-export",
      name: "Edit & Export",
      callback: async () => this.openManuscriptView()
    });

    this.addCommand({
      id: "sermonprint-compare-preview-pdf-pagination",
      name: "Compare Preview and PDF Pagination",
      callback: async () => this.comparePreviewAndPdfPagination()
    });

    this.addCommand({
      id: "sermonprint-print-preview",
      name: "Print Preview",
      callback: async () => openSermonPrintPrintPreview(this)
    });
  }

  async exportWithMode(mode: ExportMode): Promise<void> {
    await this.exporter.exportCurrentNote(mode);
  }

  async exportHtmlToPdf(html: string, basename: string, outputPath?: string): Promise<string | null> {
    return this.exporter.exportHtml(html, basename, outputPath);
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

  async comparePreviewAndPdfPagination(): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    const manuscriptView = this.app.workspace.getLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT)[0]?.view as SermonPrintManuscriptView | undefined;
    const preview = manuscriptView?.getPaginationDiagnostics() ?? null;
    const pdfPath = file ? this.getExportedPdfPath(file.basename) : null;
    const pdfPageCount = pdfPath && fs.existsSync(pdfPath) ? this.readPdfPageCount(pdfPath) : null;

    const lines = [
      "SermonPrint pagination diagnostics",
      `Preview page count: ${preview?.previewPageCount ?? "unavailable - open Legacy Edit & Export"}`,
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
