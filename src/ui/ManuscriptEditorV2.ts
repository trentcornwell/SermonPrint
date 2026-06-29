import { ItemView, WorkspaceLeaf, TFile, MarkdownView, Notice } from "obsidian";
import SermonPrintPlugin from "../main";
import { parseMarkdownToDocument } from "../engine/Parser";
import { paginateDocument } from "../engine/Paginator";
import { DEFAULT_PAGE_SETTINGS } from "../engine/Page";
import { DomMeasureService } from "../engine/DomMeasure";
import { estimateBlockHeight } from "../engine/Measure";
import { renderPagesToHtml } from "../renderer/PageRenderer";
import { blockToHtml } from "../renderer/BlockRenderer";
import type { ExportMode } from "../exporter";

export const SERMONPRINT_V2_VIEW_TYPE = "sermonprint-manuscript-engine-v2";

type RestoreState = {
  scrollTop: number;
  pageNumber: number;
  blockIndex: number;
  tagName: string;
  text: string;
  textOffset: number;
};

export class ManuscriptEditorV2View extends ItemView {
  plugin: SermonPrintPlugin;
  file: TFile | null = null;
  rootEl: HTMLElement | null = null;
  measureService: DomMeasureService | null = null;
  editButton: HTMLButtonElement | null = null;
  cancelEditButton: HTMLButtonElement | null = null;
  saveButton: HTMLButtonElement | null = null;
  dirtyIndicatorEl: HTMLElement | null = null;
  modeIndicatorEl: HTMLElement | null = null;
  pageCountEl: HTMLElement | null = null;
  currentPages: ReturnType<typeof paginateDocument> = [];
  currentMeasuredHeights: Map<string, number> | undefined;
  renderedMarkdownSnapshot = "";
  debugEnabled = false;
  editMode = false;
  dirty = false;

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
    this.rootEl.tabIndex = -1;
    this.rootEl.addEventListener("keydown", (event) => this.handleKeydown(event));
    this.measureService = new DomMeasureService(this.rootEl, blockToHtml);

    const toolbar = this.rootEl.createDiv({ cls: "sp-v2-toolbar" });
    toolbar.createEl("button", { text: "Refresh" }).onclick = () => this.refreshFromDiskWithWarning();
    toolbar.createEl("button", { text: "Back to Markdown" }).onclick = () => this.openMarkdownFileWithWarning();
    this.editButton = toolbar.createEl("button", { text: "Edit Mode" });
    this.editButton.onclick = () => {
      if (this.editMode) return;
      this.editMode = true;
      this.applyEditModeToPages();
    };
    this.cancelEditButton = toolbar.createEl("button", { text: "Cancel Edit" });
    this.cancelEditButton.onclick = () => this.cancelEditMode();
    this.saveButton = toolbar.createEl("button", { text: "Save" });
    this.saveButton.disabled = true;
    this.saveButton.onclick = () => this.saveEditedMarkdown();
    this.dirtyIndicatorEl = toolbar.createSpan({ text: "● Unsaved", cls: "sp-v2-dirty-indicator" });
    this.modeIndicatorEl = toolbar.createSpan({ text: "Viewing", cls: "sp-v2-mode-indicator" });
    this.pageCountEl = toolbar.createSpan({ text: "0 pages", cls: "sp-v2-page-count" });
    this.updateEditStateControls();
    toolbar.createEl("button", { text: "Export PDF" }).onclick = () => this.exportWithUnsavedGuard("pdf");
    toolbar.createEl("button", { text: "Export Booklet" }).onclick = () => this.exportWithUnsavedGuard("booklet");
    const debugButton = toolbar.createEl("button", { text: "Debug" });
    debugButton.toggleClass("is-active", this.debugEnabled);
    debugButton.onclick = () => {
      this.debugEnabled = !this.debugEnabled;
      debugButton.toggleClass("is-active", this.debugEnabled);
      this.updateDebugOverlays();
    };

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

  async renderCurrentFile(restoreState: RestoreState | null = null): Promise<void> {
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
    const measuredHeights = this.measureService?.measureBlocks(document.blocks, DEFAULT_PAGE_SETTINGS);
    const pages = measuredHeights
      ? paginateDocument(document, DEFAULT_PAGE_SETTINGS, (block, settings) => measuredHeights.get(block.id) ?? estimateBlockHeight(block, settings))
      : paginateDocument(document, DEFAULT_PAGE_SETTINGS);
    this.currentPages = pages;
    this.currentMeasuredHeights = measuredHeights;
    this.dirty = false;

    pagesEl.innerHTML = renderPagesToHtml(pages, DEFAULT_PAGE_SETTINGS);
    this.renderedMarkdownSnapshot = this.markdownFromRenderedPages();
    this.applyEditModeToPages();
    this.updateDebugOverlays();
    if (restoreState) this.restorePosition(restoreState);
  }

  private applyEditModeToPages(): void {
    const pagesEl = this.rootEl?.querySelector(".sp-v2-pages") as HTMLElement | null;
    this.updateEditStateControls();
    if (!pagesEl) return;

    pagesEl.querySelectorAll<HTMLElement>(".sp-page-content").forEach((contentEl) => {
      contentEl.contentEditable = this.editMode ? "true" : "false";
      contentEl.spellcheck = this.editMode;
      contentEl.toggleClass("is-editing", this.editMode);
      contentEl.oninput = this.editMode ? () => this.markDirty() : null;
      contentEl.onbeforeinput = this.editMode ? () => this.markDirty() : null;
      contentEl.onpaste = this.editMode ? () => this.markDirty() : null;
    });
  }

  private markDirty(): void {
    if (!this.editMode || this.dirty) return;
    this.dirty = true;
    this.updateEditStateControls();
  }

  private updateEditStateControls(): void {
    if (this.editButton) this.editButton.toggleClass("is-active", this.editMode);
    if (this.cancelEditButton) this.cancelEditButton.toggleClass("is-hidden", !this.editMode);
    if (this.saveButton) this.saveButton.disabled = !this.editMode || !this.dirty;
    if (this.dirtyIndicatorEl) this.dirtyIndicatorEl.toggleClass("is-visible", this.editMode && this.dirty);
    if (this.modeIndicatorEl) {
      this.modeIndicatorEl.setText(this.editMode ? (this.dirty ? "Unsaved" : "Editing") : "Viewing");
      this.modeIndicatorEl.toggleClass("is-editing", this.editMode && !this.dirty);
      this.modeIndicatorEl.toggleClass("is-unsaved", this.editMode && this.dirty);
    }
    if (this.pageCountEl) this.pageCountEl.setText(`${this.currentPages.length} ${this.currentPages.length === 1 ? "page" : "pages"}`);
  }

  private hasUnsavedEdits(): boolean {
    return this.editMode && (this.dirty || this.markdownFromRenderedPages() !== this.renderedMarkdownSnapshot);
  }

  private confirmDiscardUnsavedChanges(action: string): boolean {
    if (!this.hasUnsavedEdits()) return true;
    return window.confirm(`You have unsaved Engine V2 edits. ${action}?`);
  }

  private async refreshFromDiskWithWarning(): Promise<void> {
    if (!this.confirmDiscardUnsavedChanges("Discard them and refresh from markdown")) return;
    await this.renderCurrentFile(this.captureRestoreState());
  }

  private async openMarkdownFileWithWarning(): Promise<void> {
    if (!this.confirmDiscardUnsavedChanges("Leave without saving")) return;
    await this.openMarkdownFile();
  }

  private async cancelEditMode(): Promise<void> {
    const restoreState = this.captureRestoreState();
    this.editMode = false;
    this.dirty = false;
    this.updateEditStateControls();
    await this.renderCurrentFile(restoreState);
  }

  private updateDebugOverlays(): void {
    const pagesEl = this.rootEl?.querySelector(".sp-v2-pages") as HTMLElement | null;
    if (!pagesEl) return;

    pagesEl.querySelectorAll(".sp-debug-overlay").forEach((overlay) => overlay.remove());
    if (this.debugEnabled) this.renderDebugOverlays(pagesEl, this.currentPages, this.currentMeasuredHeights);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
    if (!this.editMode) return;

    event.preventDefault();
    event.stopPropagation();
    this.saveEditedMarkdown();
  }

  private async saveEditedMarkdown(): Promise<void> {
    if (!this.editMode || !this.dirty) return;

    if (!this.file) {
      new Notice("Open a sermon note first.");
      return;
    }

    const pagesEl = this.rootEl?.querySelector(".sp-v2-pages") as HTMLElement | null;
    if (!pagesEl) return;

    const markdown = this.markdownFromRenderedPages();
    if (!markdown) return;

    const restoreState = this.captureRestoreState();
    await this.app.vault.modify(this.file, markdown);
    new Notice("SermonPrint Engine V2 saved.");
    await this.renderCurrentFile(restoreState);
  }

  private async saveEditedMarkdownForExport(): Promise<boolean> {
    if (!this.file) {
      new Notice("Open a sermon note first.");
      return false;
    }

    const markdown = this.markdownFromRenderedPages();
    if (!markdown) return false;

    const restoreState = this.captureRestoreState();
    await this.app.vault.modify(this.file, markdown);
    new Notice("SermonPrint Engine V2 saved.");
    await this.renderCurrentFile(restoreState);
    return true;
  }

  private async exportWithUnsavedGuard(mode: ExportMode): Promise<void> {
    if (this.hasUnsavedEdits()) {
      const shouldSave = window.confirm("You have unsaved changes. Save before exporting?");
      if (!shouldSave) return;

      const saved = await this.saveEditedMarkdownForExport();
      if (!saved) return;
    }

    await this.plugin.exportWithMode(mode);
  }

  private captureRestoreState(): RestoreState | null {
    const pagesEl = this.rootEl?.querySelector(".sp-v2-pages") as HTMLElement | null;
    const scroller = this.rootEl;
    if (!pagesEl || !scroller) return null;

    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const selectedBlock = range ? this.closestEditableBlock(range.startContainer) : null;
    const pageEl = selectedBlock?.closest(".sp-page") as HTMLElement | null;
    const visiblePage = this.visiblePageElement();
    const targetPage = pageEl || visiblePage;

    const blockIndex = selectedBlock ? this.blockIndexInPages(selectedBlock) : -1;
    return {
      scrollTop: scroller.scrollTop,
      pageNumber: Number(targetPage?.dataset.page || visiblePage?.dataset.page || 1),
      blockIndex,
      tagName: selectedBlock?.tagName.toLowerCase() || "",
      text: selectedBlock ? this.textFromElement(selectedBlock) : "",
      textOffset: range && selectedBlock ? this.textOffsetWithin(selectedBlock, range) : 0,
    };
  }

  private restorePosition(state: RestoreState): void {
    const scroller = this.rootEl;
    if (!scroller) return;

    scroller.scrollTop = state.scrollTop;

    if (!this.editMode) {
      this.scrollPageIntoView(state.pageNumber, state.scrollTop);
      return;
    }

    const block = this.findClosestBlock(state);
    if (!block) {
      this.scrollPageIntoView(state.pageNumber, state.scrollTop);
      return;
    }

    this.placeCaret(block, state.textOffset);
    block.scrollIntoView({ block: "center" });
  }

  private visiblePageElement(): HTMLElement | null {
    const pages = Array.from(this.rootEl?.querySelectorAll<HTMLElement>(".sp-page") || []);
    if (!this.rootEl || pages.length === 0) return null;

    const rootTop = this.rootEl.getBoundingClientRect().top;
    return pages.reduce((closest, page) => {
      const currentDistance = Math.abs(page.getBoundingClientRect().top - rootTop);
      const closestDistance = Math.abs(closest.getBoundingClientRect().top - rootTop);
      return currentDistance < closestDistance ? page : closest;
    }, pages[0]);
  }

  private scrollPageIntoView(pageNumber: number, fallbackScrollTop: number): void {
    const pageEl = this.rootEl?.querySelector<HTMLElement>(`.sp-page[data-page="${pageNumber}"]`);
    if (pageEl) pageEl.scrollIntoView({ block: "start" });
    else if (this.rootEl) this.rootEl.scrollTop = fallbackScrollTop;
  }

  private closestEditableBlock(node: Node): HTMLElement | null {
    const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    const block = el?.closest("h1, h2, blockquote, p") as HTMLElement | null;
    return block?.closest(".sp-page-content") ? block : null;
  }

  private blockIndexInPages(block: HTMLElement): number {
    const blocks = Array.from(this.rootEl?.querySelectorAll<HTMLElement>(".sp-page-content > h1, .sp-page-content > h2, .sp-page-content > blockquote, .sp-page-content > p") || []);
    return blocks.indexOf(block);
  }

  private findClosestBlock(state: RestoreState): HTMLElement | null {
    const blocks = Array.from(this.rootEl?.querySelectorAll<HTMLElement>(".sp-page-content > h1, .sp-page-content > h2, .sp-page-content > blockquote, .sp-page-content > p") || []);
    if (blocks.length === 0) return null;

    const exactTextMatch = blocks.find((block) => block.tagName.toLowerCase() === state.tagName && this.textFromElement(block) === state.text);
    if (exactTextMatch) return exactTextMatch;

    const sameTagBlocks = blocks.filter((block) => block.tagName.toLowerCase() === state.tagName);
    if (sameTagBlocks.length > 0 && state.blockIndex >= 0) {
      return sameTagBlocks.reduce((closest, block) => {
        return Math.abs(blocks.indexOf(block) - state.blockIndex) < Math.abs(blocks.indexOf(closest) - state.blockIndex) ? block : closest;
      }, sameTagBlocks[0]);
    }

    if (state.blockIndex >= 0) return blocks[Math.min(state.blockIndex, blocks.length - 1)];
    return this.rootEl?.querySelector<HTMLElement>(`.sp-page[data-page="${state.pageNumber}"] .sp-page-content > *`) || blocks[0];
  }

  private textOffsetWithin(block: HTMLElement, range: Range): number {
    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(block);
    prefixRange.setEnd(range.startContainer, range.startOffset);
    return prefixRange.toString().length;
  }

  private placeCaret(block: HTMLElement, textOffset: number): void {
    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let remaining = textOffset;
    let target: Text | null = null;
    let offset = 0;

    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      if (remaining <= textNode.data.length) {
        target = textNode;
        offset = remaining;
        break;
      }
      remaining -= textNode.data.length;
    }

    if (!target) {
      target = block.lastChild instanceof Text ? block.lastChild : document.createTextNode("");
      if (!target.parentNode) block.appendChild(target);
      offset = target.data.length;
    }

    const range = document.createRange();
    range.setStart(target, Math.min(offset, target.data.length));
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    block.focus();
  }

  private markdownFromRenderedPages(): string {
    const pagesEl = this.rootEl?.querySelector(".sp-v2-pages") as HTMLElement | null;
    if (!pagesEl) return "";

    const blocks: string[] = [];
    pagesEl.querySelectorAll<HTMLElement>(".sp-page-content").forEach((contentEl) => {
      Array.from(contentEl.children).forEach((child) => {
        const el = child as HTMLElement;
        const text = this.textFromElement(el);
        if (!text) return;

        const tag = el.tagName.toLowerCase();
        if (tag === "h1") blocks.push(`# ${text}`);
        else if (tag === "h2") blocks.push(`## ${text}`);
        else if (tag === "blockquote") blocks.push(text.split(/\n+/).map((line) => `> ${line.trim()}`).join("\n"));
        else blocks.push(text);
      });
    });

    return `${blocks.join("\n\n")}\n`;
  }

  private textFromElement(el: HTMLElement): string {
    return (el.innerText || el.textContent || "").replace(/\u00a0/g, " ").trim();
  }

  private renderDebugOverlays(pagesEl: HTMLElement, pages: ReturnType<typeof paginateDocument>, measuredHeights?: Map<string, number>): void {
    pages.forEach((page) => {
      const pageEl = pagesEl.querySelector(`.sp-page[data-page="${page.number}"]`) as HTMLElement | null;
      if (!pageEl) return;

      const overlay = pageEl.createDiv({ cls: "sp-debug-overlay" });
      overlay.createDiv({ text: `printable: ${page.availableHeightPx.toFixed(2)}px` });
      overlay.createDiv({ text: `used: ${page.usedHeightPx.toFixed(2)}px` });
      overlay.createDiv({ text: `remaining: ${Math.max(0, page.availableHeightPx - page.usedHeightPx).toFixed(2)}px` });
      overlay.createDiv({ text: `blocks: ${page.blocks.length}` });

      const list = overlay.createEl("ul");
      page.blocks.forEach((block) => {
        const measured = measuredHeights?.get(block.id) ?? estimateBlockHeight(block, DEFAULT_PAGE_SETTINGS);
        list.createEl("li", { text: `${block.id} | ${block.type} | ${measured.toFixed(2)}px` });
      });
    });
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
