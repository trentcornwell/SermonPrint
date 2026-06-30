#!/bin/bash
set -e

VAULT_PLUGIN="$HOME/Documents/MainVault/.obsidian/plugins/vision-sermon-toolkit"
mkdir -p "$VAULT_PLUGIN"

cp manifest.json "$VAULT_PLUGIN/manifest.json"
cp main.js "$VAULT_PLUGIN/main.js"
cp ManuscriptHtml.js "$VAULT_PLUGIN/ManuscriptHtml.js"
cp exporter.js "$VAULT_PLUGIN/exporter.js"
cp booklet.js "$VAULT_PLUGIN/booklet.js"
cp package.json "$VAULT_PLUGIN/package.json"

if [ -d node_modules ]; then
  rsync -a --delete node_modules "$VAULT_PLUGIN/"
fi

echo "SermonPrint copied to Obsidian plugin folder. Restart Obsidian."
