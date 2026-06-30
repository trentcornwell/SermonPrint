import { Notice, Plugin, TFile } from "obsidian";
import { execFile } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { SermonPrintSettings } from "./settings";
import { createBooklet } from "./booklet";
import { getNodeExecutable } from "./node";

export type ExportMode = "pdf" | "booklet" | "large-print" | "half-sheet";

export class SermonPrintExporter {
  constructor(private plugin: Plugin, private settings: SermonPrintSettings) {}

  async exportHtml(html: string, basename: string, outputPath?: string): Promise<string | null> {
    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      new Notice("Could not find vault path.");
      return null;
    }

    const pluginDir = path.join(vaultPath, this.plugin.manifest.dir ?? ".obsidian/plugins/vision-sermon-toolkit");
    const exporterScript = path.join(pluginDir, "exporter.js");
    const defaultFolder = this.resolveExportFolder(vaultPath);
    const pdfPath = outputPath || path.join(defaultFolder, `${basename} SermonPrint.pdf`);
    const exportFolder = path.dirname(pdfPath);
    fs.mkdirSync(exportFolder, { recursive: true });
    const htmlPath = path.join(exportFolder, `${path.basename(pdfPath, ".pdf")}.sermonprint-preview.html`);

    new Notice("Creating SermonPrint PDF...");

    try {
      let nodeExecutable: string;
      try {
        nodeExecutable = getNodeExecutable();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("SermonPrint export failed", error);
        new Notice("SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting.");
        return null;
      }

      fs.writeFileSync(htmlPath, html, "utf8");
      await this.runNode(nodeExecutable, exporterScript, ["--html", htmlPath, pdfPath]);
      await this.waitForValidPdf(pdfPath);

      new Notice(`SermonPrint PDF saved: ${pdfPath}`);
      if (this.settings.openAfterExport) await this.tryOpenFile(pdfPath);
      return pdfPath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("SermonPrint export failed", error);
      new Notice(message.includes("Node") ? "SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting." : `SermonPrint export failed: ${message}`);
      return null;
    } finally {
      try {
        if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
      } catch (error) {
        console.warn("SermonPrint could not remove temporary preview HTML.", error);
      }
    }
  }

  async exportHtmlBooklet(html: string, basename: string, outputPath: string): Promise<string | null> {
    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      new Notice("Could not find vault path.");
      return null;
    }

    const pluginDir = path.join(vaultPath, this.plugin.manifest.dir ?? ".obsidian/plugins/vision-sermon-toolkit");
    const exportFolder = path.dirname(outputPath);
    fs.mkdirSync(exportFolder, { recursive: true });
    const baseName = path.basename(outputPath, ".pdf");
    const intermediatePdf = path.join(exportFolder, `${baseName}.sermonprint-source.pdf`);

    try {
      new Notice("Creating SermonPrint booklet...");
      const pdfPath = await this.exportHtml(html, basename, intermediatePdf);
      if (!pdfPath) return null;

      await createBooklet(pluginDir, pdfPath, outputPath);
      await this.waitForValidPdf(outputPath);

      new Notice(`SermonPrint booklet saved: ${outputPath}`);
      if (this.settings.openAfterExport) await this.tryOpenFile(outputPath);
      return outputPath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("SermonPrint booklet export failed", error);
      new Notice(`SermonPrint booklet export failed: ${message}`);
      return null;
    } finally {
      try {
        if (fs.existsSync(intermediatePdf)) fs.unlinkSync(intermediatePdf);
      } catch (error) {
        console.warn("SermonPrint could not remove temporary booklet source PDF.", error);
      }
    }
  }

  async exportCurrentNote(mode: ExportMode): Promise<void> {
    const file = this.plugin.app.workspace.getActiveFile();

    if (!file || !(file instanceof TFile)) {
      new Notice("No active note found.");
      return;
    }

    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      new Notice("Could not find vault path.");
      return;
    }

    const pluginDir = path.join(vaultPath, this.plugin.manifest.dir ?? ".obsidian/plugins/vision-sermon-toolkit");
    const exporterScript = path.join(pluginDir, "exporter.js");
    const inputPath = path.join(vaultPath, file.path);
    const exportFolder = this.resolveExportFolder(vaultPath);

    const suffix = mode === "large-print" ? " Large Print" : mode === "half-sheet" ? " Half-Sheet" : " SermonPrint";
    const pdfPath = path.join(exportFolder, `${file.basename}${suffix}.pdf`);
    const bookletPath = path.join(exportFolder, `${file.basename} SermonPrint Booklet.pdf`);

    const exportSettings = this.modeSettings(mode);

    new Notice(`Creating SermonPrint ${mode === "booklet" ? "booklet" : "PDF"}...`);

    try {
      let nodeExecutable: string;
      try {
        nodeExecutable = getNodeExecutable();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("SermonPrint export failed", error);
        new Notice("SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting.");
        return;
      }

      await this.runNode(nodeExecutable, exporterScript, [
        inputPath,
        pdfPath,
        file.basename,
        exportSettings.fontFamily,
        exportSettings.fontSize,
        exportSettings.pageWidth,
        exportSettings.pageHeight,
        exportSettings.margin,
        exportSettings.lineHeight,
        exportSettings.keepTogetherRules ? "true" : "false",
        exportSettings.autoPageBalancing ? "true" : "false"
      ]);

      await this.waitForValidPdf(pdfPath);

      if (mode !== "booklet") {
        new Notice("SermonPrint PDF created.");
        if (this.settings.openAfterExport) await this.tryOpenFile(pdfPath);
        return;
      }

      await createBooklet(pluginDir, pdfPath, bookletPath);
      await this.waitForValidPdf(bookletPath);
      new Notice("SermonPrint booklet created.");
      if (this.settings.openAfterExport) await this.tryOpenFile(bookletPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("SermonPrint export failed", error);
      new Notice(message.includes("Node") ? "SermonPrint could not start because Node.js is unavailable. Install Node.js or set the Node path before exporting." : `SermonPrint export failed: ${message}`);
    }
  }

  private modeSettings(mode: ExportMode): SermonPrintSettings {
    const next = { ...this.settings };
    if (mode === "large-print") {
      next.fontSize = "14pt";
      next.lineHeight = "1.55";
    }
    if (mode === "half-sheet") {
      next.pageWidth = "5.5in";
      next.pageHeight = "8.5in";
    }
    return next;
  }

  private resolveExportFolder(vaultPath: string): string {
    const configuredFolder = (this.settings.pdfFolder || "Sermon PDFs").trim();
    const exportFolder = path.isAbsolute(configuredFolder) ? configuredFolder : path.join(vaultPath, configuredFolder);
    fs.mkdirSync(exportFolder, { recursive: true });
    return exportFolder;
  }

  private getVaultPath(): string | null {
    const adapter: any = this.plugin.app.vault.adapter;
    return adapter.getBasePath?.() ?? adapter.basePath ?? null;
  }

  private runNode(nodeExecutable: string, scriptPath: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`SermonPrint exporter script was not found at ${scriptPath}. Reinstall the plugin.`));
        return;
      }

      execFile(nodeExecutable, [scriptPath, ...args], (error, _stdout, stderr) => {
        if (error) {
          const details = stderr?.trim() || error.message;
          console.error(details);
          reject(new Error(details));
          return;
        }
        resolve();
      });
    });
  }

  private async tryOpenFile(filePath: string): Promise<void> {
    await new Promise<void>((resolve) => {
      execFile("open", [filePath], (error) => {
        if (error) {
          console.warn("SermonPrint created the PDF but could not auto-open it.", error);
          new Notice("PDF created, but macOS could not auto-open it.");
        }
        resolve();
      });
    });
  }

  private async waitForValidPdf(filePath: string): Promise<void> {
    const start = Date.now();
    let lastSize = -1;
    let stableCount = 0;

    while (Date.now() - start < 8000) {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.size > 1000 && stat.size === lastSize) {
          stableCount += 1;
        } else {
          stableCount = 0;
          lastSize = stat.size;
        }

        if (stableCount >= 2 && this.looksLikePdf(filePath)) return;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    throw new Error(`SermonPrint created an invalid or incomplete PDF: ${filePath}`);
  }

  private looksLikePdf(filePath: string): boolean {
    try {
      const buffer = fs.readFileSync(filePath);
      const start = buffer.subarray(0, 5).toString("utf8");
      const tail = buffer.subarray(Math.max(0, buffer.length - 2048)).toString("latin1");
      return start === "%PDF-" && tail.includes("%%EOF");
    } catch {
      return false;
    }
  }
}
