import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { DEFAULT_SETTINGS, SermonPrintSettings, SermonPrintSettingTab } from "./settings";
import { injectLayoutStyles, removeLayoutStyles } from "./styles";
import { SermonPrintExporter, type ExportMode } from "./exporter";
import { SermonPrintManuscriptView, VIEW_TYPE_SERMONPRINT_MANUSCRIPT } from "./manuscriptView";
import { ManuscriptEditorV2View, SERMONPRINT_V2_VIEW_TYPE, openManuscriptEngineV2 } from "./ui/ManuscriptEditorV2";

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

    this.refreshLayoutStyles();

    this.addCommand({
      id: "sermonprint-edit-export",
      name: "Edit & Export",
      callback: () => openManuscriptEngineV2(this)
    });

    this.addCommand({
      id: "sermonprint-legacy-edit-export",
      name: "Legacy Edit & Export",
      callback: async () => this.openManuscriptView()
    });
  }

  async exportWithMode(mode: ExportMode): Promise<void> {
    await this.exporter.exportCurrentNote(mode);
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

  onunload(): void {
    removeLayoutStyles();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SERMONPRINT_MANUSCRIPT);
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
