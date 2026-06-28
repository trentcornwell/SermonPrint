import { App, PluginSettingTab, Setting } from "obsidian";
import SermonPrintPlugin from "./main";

export interface SermonPrintSettings {
  pageSizePreset: "half-sheet" | "letter" | "a4" | "legal" | "custom";
  pdfFolder: string;
  fontFamily: string;
  fontSize: string;
  pageWidth: string;
  pageHeight: string;
  margin: string;
  lineHeight: string;
  pageGuideOffset: string;
  showPageGuides: boolean;
  showPageShadow: boolean;
  showPageBreakLabels: boolean;
  showMarginRuler: boolean;
  showPageNumbers: boolean;
  keepTogetherRules: boolean;
  autoPageBalancing: boolean;
  openAfterExport: boolean;
  defaultExportMode: "pdf" | "booklet" | "large-print" | "half-sheet";
  bibleVerseColor: string;
}

export const DEFAULT_SETTINGS: SermonPrintSettings = {
  pageSizePreset: "half-sheet",
  pdfFolder: "Sermon PDFs",
  fontFamily: "Georgia",
  fontSize: "12.5pt",
  pageWidth: "5.5in",
  pageHeight: "8.5in",
  margin: "0.58in",
  lineHeight: "1.65",
  pageGuideOffset: "0in",
  showPageGuides: true,
  showPageShadow: true,
  showPageBreakLabels: true,
  showMarginRuler: true,
  showPageNumbers: true,
  keepTogetherRules: true,
  autoPageBalancing: true,
  openAfterExport: true,
  defaultExportMode: "pdf",
  bibleVerseColor: "#8b0000"
};

export class SermonPrintSettingTab extends PluginSettingTab {
  plugin: SermonPrintPlugin;

  constructor(app: App, plugin: SermonPrintPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "SermonPrint Settings" });

    this.addPageSetupSettings();

    this.addTextSetting("PDF folder", "Relative to the vault or an absolute path. Example: Sermon PDFs", "pdfFolder");
    this.addTextSetting("Font family", "Example: Georgia", "fontFamily");
    this.addTextSetting("Font size", "Example: 11.5pt", "fontSize");
    this.addTextSetting("Page width", "Example: 5.5in", "pageWidth");
    this.addTextSetting("Page height", "Example: 8.5in", "pageHeight");
    this.addTextSetting("Margin", "Applies to all sides. Example: 0.55in", "margin");
    this.addTextSetting("Line height", "Example: 1.45", "lineHeight");
    this.addTextSetting("Bible verse color", "Used by the manuscript toolbar. Example: #8b0000", "bibleVerseColor");
    new Setting(containerEl)
      .setName("Reset page view")
      .setDesc("Turns on the paper view, red page guides, margin ruler, live page numbers, and keep-together rules.")
      .addButton((button) =>
        button.setButtonText("Reset layout view").onClick(async () => {
          this.plugin.settings.showPageGuides = true;
          this.plugin.settings.showPageShadow = true;
          this.plugin.settings.showMarginRuler = true;
          this.plugin.settings.showPageNumbers = true;
          this.plugin.settings.keepTogetherRules = true;
          this.plugin.settings.autoPageBalancing = true;
          await this.plugin.saveSettings();
          this.display();
        })
      );

    this.addToggle("Show page guides", "Show a page frame and page-break marker while writing.", "showPageGuides");
    this.addToggle("Show page shadow", "Show a real paper card in Sermon Layout.", "showPageShadow");
    this.addToggle("Show margin ruler", "Show the printable margin area while writing.", "showMarginRuler");
    this.addToggle("Show live page numbers", "Show approximate page count in the status bar.", "showPageNumbers");
    this.addToggle("Keep-together rules", "Keep headings, quotes, transitions, and lists together when possible.", "keepTogetherRules");
    this.addToggle("Open PDF after export", "Automatically open the finished PDF after SermonPrint creates it.", "openAfterExport");
  }


  private addPageSetupSettings(): void {
    new Setting(this.containerEl)
      .setName("Page size")
      .setDesc("This controls both the red page guides and the exported PDF. Your preferred default is Half-sheet, 5.5 × 8.5.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("half-sheet", "Half-sheet sermon page (5.5 × 8.5)")
          .addOption("letter", "US Letter (8.5 × 11)")
          .addOption("legal", "US Legal (8.5 × 14)")
          .addOption("a4", "A4 (8.27 × 11.69)")
          .addOption("custom", "Custom")
          .setValue(this.plugin.settings.pageSizePreset || "half-sheet")
          .onChange(async (value) => {
            this.plugin.settings.pageSizePreset = value as SermonPrintSettings["pageSizePreset"];

            if (value === "half-sheet") {
              this.plugin.settings.pageWidth = "5.5in";
              this.plugin.settings.pageHeight = "8.5in";
            } else if (value === "letter") {
              this.plugin.settings.pageWidth = "8.5in";
              this.plugin.settings.pageHeight = "11in";
            } else if (value === "legal") {
              this.plugin.settings.pageWidth = "8.5in";
              this.plugin.settings.pageHeight = "14in";
            } else if (value === "a4") {
              this.plugin.settings.pageWidth = "8.27in";
              this.plugin.settings.pageHeight = "11.69in";
            }

            await this.plugin.saveSettings();
            this.display();
          })
      );

    new Setting(this.containerEl)
      .setName("Use half-sheet sermon page")
      .setDesc("Sets the layout and exporter to 5.5 × 8.5 immediately.")
      .addButton((button) =>
        button.setButtonText("Set 5.5 × 8.5").onClick(async () => {
          this.plugin.settings.pageSizePreset = "half-sheet";
          this.plugin.settings.pageWidth = "5.5in";
          this.plugin.settings.pageHeight = "8.5in";
          await this.plugin.saveSettings();
          this.display();
        })
      );
  }

  private addTextSetting(name: string, desc: string, key: keyof SermonPrintSettings): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addText((text) =>
        text.setValue(String(this.plugin.settings[key])).onChange(async (value) => {
          (this.plugin.settings as any)[key] = value;
          await this.plugin.saveSettings();
          this.plugin.refreshLayoutStyles();
          this.plugin.updateStatusBar();
        })
      );
  }

  private addToggle(name: string, desc: string, key: keyof SermonPrintSettings): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addToggle((toggle) =>
        toggle.setValue(Boolean(this.plugin.settings[key])).onChange(async (value) => {
          (this.plugin.settings as any)[key] = value;
          await this.plugin.saveSettings();
          this.plugin.refreshLayoutStyles();
          this.plugin.updateStatusBar();
        })
      );
  }
}
