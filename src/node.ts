import * as fs from "fs";
import * as os from "os";
import * as path from "path";

function isFile(value: string): boolean {
  try {
    return fs.existsSync(value) && fs.statSync(value).isFile();
  } catch {
    return false;
  }
}

function addIfFile(candidates: string[], value: string | undefined | null): void {
  if (!value) return;
  if (isFile(value)) candidates.push(value);
}

function nodeVersionScore(version: string): number[] {
  return version
    .replace(/^v/, "")
    .split(".")
    .map((part) => Number(part) || 0);
}

function compareNodeVersions(a: string, b: string): number {
  const av = nodeVersionScore(a);
  const bv = nodeVersionScore(b);
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const diff = (bv[i] || 0) - (av[i] || 0);
    if (diff !== 0) return diff;
  }
  return b.localeCompare(a);
}

export function getNodeExecutable(): string {
  const candidates: string[] = [];

  addIfFile(candidates, process.env.SERMONPRINT_NODE_PATH);

  const pathEntries = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    addIfFile(candidates, path.join(entry, "node"));
  }

  addIfFile(candidates, "/opt/homebrew/bin/node");
  addIfFile(candidates, "/usr/local/bin/node");
  addIfFile(candidates, "/usr/bin/node");

  const home = os.homedir();
  const nvmVersionsDir = path.join(home, ".nvm", "versions", "node");

  try {
    const versions = fs
      .readdirSync(nvmVersionsDir)
      .filter((name) => name.startsWith("v"))
      .sort(compareNodeVersions);

    for (const version of versions) {
      addIfFile(candidates, path.join(nvmVersionsDir, version, "bin", "node"));
    }
  } catch {
    // No nvm folder. That is fine.
  }

  const uniqueCandidates = Array.from(new Set(candidates));
  if (uniqueCandidates.length > 0) return uniqueCandidates[0];

  throw new Error(
    "SermonPrint could not find Node. Set SERMONPRINT_NODE_PATH or install Node with nvm, Homebrew, or the official installer."
  );
}
