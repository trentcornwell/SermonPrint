import { execFile } from "child_process";
import * as path from "path";
import { getNodeExecutable } from "./node";

export function createBooklet(pluginDir: string, inputPdf: string, outputPdf: string): Promise<void> {
  const bookletScript = path.join(pluginDir, "booklet.js");

  return new Promise((resolve, reject) => {
    execFile(getNodeExecutable(), [bookletScript, inputPdf, outputPdf], (error, _stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
        return;
      }
      resolve();
    });
  });
}
