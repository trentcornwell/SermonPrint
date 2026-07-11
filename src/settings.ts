import { App, PluginSettingTab, Setting } from "obsidian";
import SermonPrintPlugin from "./main";
import { getPagePreset } from "./engine/Layout";

/**
 * Presets are a convenience layer over the single existing `margin` field
 * (see SermonPrintSettings.margin) - there is no separate stored preset
 * value. The dropdown's selection is derived from the current margin each
 * render (marginPresetIdFor), so picking "Custom" never overwrites
 * settings.margin, and an existing user's saved margin is left untouched
 * unless they explicitly choose a different preset or edit the text field.
 */
const MARGIN_PRESETS: { id: string; label: string; value: string }[] = [
  { id: "compact", label: "Compact (0.35 in)", value: "0.35in" },
  { id: "standard", label: "Standard (0.5 in)", value: "0.5in" },
  { id: "printer-safe", label: "Printer Safe (0.65 in) – recommended", value: "0.65in" },
  { id: "wide", label: "Wide (0.75 in)", value: "0.75in" }
];
const CUSTOM_MARGIN_ID = "custom";

function parseMarginInches(value: string): number | null {
  const parsed = Number(String(value).replace("in", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function marginPresetIdFor(margin: string): string {
  const parsed = parseMarginInches(margin);
  if (parsed === null) return CUSTOM_MARGIN_ID;

  const match = MARGIN_PRESETS.find((preset) => {
    const presetValue = parseMarginInches(preset.value);
    return presetValue !== null && Math.abs(presetValue - parsed) < 0.001;
  });

  return match?.id ?? CUSTOM_MARGIN_ID;
}

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
    this.addMarginSetting();
    this.addTextSetting("Line height", "Example: 1.45", "lineHeight");
    this.addTextSetting("Bible verse color", "Used by the manuscript toolbar. Example: #8b0000", "bibleVerseColor");
    new Setting(containerEl)
      .setName("Reset page view")
      .setDesc("Turns on the paper view, red page guides, margin ruler, and keep-together rules.")
      .addButton((button) =>
        button.setButtonText("Reset layout view").onClick(async () => {
          this.plugin.settings.showPageGuides = true;
          this.plugin.settings.showPageShadow = true;
          this.plugin.settings.showMarginRuler = true;
          this.plugin.settings.keepTogetherRules = true;
          this.plugin.settings.autoPageBalancing = true;
          await this.plugin.saveSettings();
          this.display();
        })
      );

    this.addToggle("Show page guides", "Show a page frame and page-break marker while writing.", "showPageGuides");
    this.addToggle("Show page shadow", "Show a real paper card in Sermon Layout.", "showPageShadow");
    this.addToggle("Show margin ruler", "Show the printable margin area while writing.", "showMarginRuler");
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

            const preset = getPagePreset(value as SermonPrintSettings["pageSizePreset"]);
            if (preset) {
              this.plugin.settings.pageWidth = preset.width;
              this.plugin.settings.pageHeight = preset.height;
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
          const preset = getPagePreset("half-sheet")!;
          this.plugin.settings.pageSizePreset = "half-sheet";
          this.plugin.settings.pageWidth = preset.width;
          this.plugin.settings.pageHeight = preset.height;
          await this.plugin.saveSettings();
          this.display();
        })
      );
  }

  /**
   * Same single settings.margin field used everywhere else (editor,
   * paginationScript(), PDF export, booklet source PDF) - this only adds a
   * preset picker on top of it. Selecting a preset writes settings.margin
   * directly; selecting Custom leaves it untouched. Both controls
   * repaginate any open SermonPrint editor so what's on screen keeps
   * matching what will export.
   */
  private addMarginSetting(): void {
    new Setting(this.containerEl)
      .setName("Margin preset")
      .setDesc(
        "Printer Safe is recommended for ordinary home and church printers, which usually can't print all the way to the paper's edge. Larger margins leave less room for text and may increase the total page count. Choose Custom to type an exact value below."
      )
      .addDropdown((dropdown) => {
        MARGIN_PRESETS.forEach((preset) => dropdown.addOption(preset.id, preset.label));
        dropdown.addOption(CUSTOM_MARGIN_ID, "Custom");
        dropdown.setValue(marginPresetIdFor(this.plugin.settings.margin)).onChange(async (value) => {
          if (value === CUSTOM_MARGIN_ID) return;
          const preset = MARGIN_PRESETS.find((candidate) => candidate.id === value);
          if (!preset) return;

          this.plugin.settings.margin = preset.value;
          await this.plugin.saveSettings();
          this.plugin.refreshOpenEditors();
          this.display();
        });
      });

    new Setting(this.containerEl)
      .setName("Margin")
      .setDesc("Applies to all sides. Example: 0.65in. Matches the preset above when the value is one of the presets; edit freely with Custom selected.")
      .addText((text) =>
        text.setValue(this.plugin.settings.margin).onChange(async (value) => {
          this.plugin.settings.margin = value;
          await this.plugin.saveSettings();
          this.plugin.refreshLayoutStyles();
          this.plugin.updateStatusBar();
          this.plugin.refreshOpenEditors();
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
