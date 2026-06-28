import { ItemView, WorkspaceLeaf, TFile, MarkdownView, Notice } from "obsidian";
import SermonPrintPlugin from "../main";
import { parseMarkdownToDocument } from "../engine/Parser";
import { paginateDocument } from "../engine/Paginator";
import { DEFAULT_PAGE_SETTINGS } from "../engine/Page";
import { DomMeasureService } from "../engine/DomMeasure";
import { renderPagesToHtml } from "../renderer/PageRenderer";
import { blockToHtml } from "../renderer/BlockRenderer";

export const SERMONPRINT_V2_VIEW_TYPE = "sermonprint-manuscript-engine-v2";

export class ManuscriptEditorV2View extends ItemView {
  plugin: SermonPrintPlugin;
  file: TFile | null = null;
  rootEl: HTMLElement | null = null;
  measureService: DomMeasureService | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: SermonPrintPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return SERMONPRINT_V2_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "SermonPrint Engine V2";
  }

  async onOpen(): Promise<void> {
    this.containerEl.empty();
    this.rootEl = this.containerEl.createDiv({ cls: "sp-v2-root" });
    this.measureService = new DomMeasureService(this.rootEl, blockToHtml);

    const toolbar = this.rootEl.createDiv({ cls: "sp-v2-toolbar" });
    toolbar.createEl("button", { text: "Refresh Pages" }).onclick = () => this.renderCurrentFile();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFile();

    this.rootEl.createDiv({ cls: "sp-v2-pages" });

    await this.renderCurrentFile();
  }

  onClose(): Promise<void> {
    this.measureService?.destroy();
    this.measureService = null;
    return Promise.resolve();
  }

  async setFile(file: TFile): Promise<void> {
    this.file = file;
    await this.renderCurrentFile();
  }

  async renderCurrentFile(): Promise<void> {
    const pagesEl = this.rootEl?.querySelector(".sp-v2-pages") as HTMLElement | null;
    if (!pagesEl) return;

    const active = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = this.file || active?.file;

    if (!file) {
      pagesEl.setText("Open a sermon note first.");
      return;
    }

    this.file = file;
    const markdown = await this.app.vault.read(file);
    const document = parseMarkdownToDocument(markdown, file.basename);
    this.measureService?.clear();
    const pages = this.measureService
      ? paginateDocument(document, DEFAULT_PAGE_SETTINGS, (block, settings) => this.measureService!.measureBlock(block, settings))
      : paginateDocument(document, DEFAULT_PAGE_SETTINGS);

    pagesEl.innerHTML = renderPagesToHtml(pages, DEFAULT_PAGE_SETTINGS);
  }

  async openMarkdownFile(): Promise<void> {
    if (!this.file) return;
    await this.app.workspace.openLinkText(this.file.path, "", false);
  }
}

export async function openManuscriptEngineV2(plugin: SermonPrintPlugin): Promise<void> {
  const active = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  const file = active?.file;

  if (!file) {
    new Notice("Open a sermon note first.");
    return;
  }

  const leaf = plugin.app.workspace.getLeaf("tab");
  await leaf.setViewState({ type: SERMONPRINT_V2_VIEW_TYPE, active: true });

  const view = leaf.view as ManuscriptEditorV2View;
  await view.setFile(file);
}
