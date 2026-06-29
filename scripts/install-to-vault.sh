#!/bin/bash
set -e

VAULT_PLUGIN_DIR="/Users/trentcornwell/Documents/MainVault/.obsidian/plugins/vision-sermon-toolkit"
mkdir -p "$VAULT_PLUGIN_DIR"
mkdir -p "$VAULT_PLUGIN_DIR/src/export"
cp main.js manifest.json exporter.js booklet.js package.json package-lock.json "$VAULT_PLUGIN_DIR/"
cp src/export/ManuscriptHtml.js "$VAULT_PLUGIN_DIR/src/export/"
cd "$VAULT_PLUGIN_DIR"
npm install

echo "SermonPrint installed to MainVault. Restart Obsidian."
