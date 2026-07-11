# SermonPrint — Current Architecture (branch `v3-editable-html`)

This document describes what is actually wired up and running today. It does not describe
planned or aspirational features.

## Recommended editing view

**"SermonPrint: Edit Sermon in Print Layout"** (`SermonPrintEditablePrintPreviewView`,
`src/ui/EditablePrintPreviewView.ts`) is the recommended way to edit a sermon. Its paginated
layout comes from `buildPaginatedManuscriptHtml()` running `paginationScript()` (see below),
which is the same HTML and the same script used to produce the exported PDF/booklet via
`exportHtml()`/`exportHtmlBooklet()`. That makes its on-screen page layout the authoritative
preview of PDF and booklet export - not an estimate of it.

"SermonPrint: Legacy Edit & Export" (`SermonPrintManuscriptView`, `src/manuscriptView.ts`)
remains available for direct access, but its page guides are computed independently (see
"Which pagination implementation is production" below) and are approximate: they are not
guaranteed to land on the same lines as the exported PDF. The Legacy view links to "Edit
Sermon in Print Layout" for anyone who needs accurate page breaks while editing.

## Active preview and export pipeline

A sermon note's markdown is converted to HTML by `renderMarkdownToHtml()` in
`src/export/ManuscriptHtml.ts` (a hand-written regex-based converter — the `markdown-it`
dependency in `package.json` is not imported by any active code path). The HTML is wrapped
with inline CSS (and, for paginated views, an inline `<script>`) and displayed in an
`<iframe srcdoc>`:

- `SermonPrintPrintPreviewView` (`src/ui/PrintPreviewView.ts`) — read-only paginated preview
  with a separate markdown textarea.
- `SermonPrintEditablePrintPreviewView` (`src/ui/EditablePrintPreviewView.ts`) — the same
  paginated HTML, but the rendered pages are made `contentEditable` in place. This is the
  "editable HTML" feature referenced in the branch name.
- `SermonPrintManuscriptView` (`src/manuscriptView.ts`) — an older, still-registered
  contentEditable editor with its own page-guide overlay. The plugin's command list labels
  it "Legacy Edit & Export".

To export, the plugin hands the current HTML (either freshly rendered from markdown, or the
live DOM of the editable iframe) to `SermonPrintExporter` (`src/exporter.ts`), which writes it
to a temporary file and drives a separate Node/Playwright process (see below) to produce a PDF,
optionally followed by a booklet imposition pass.

## Purpose of main.js and ManuscriptHtml.js

`esbuild.config.mjs` defines two build targets:

- `src/main.ts` → `main.js` — the Obsidian plugin bundle. It statically imports from
  `src/export/ManuscriptHtml.ts`, so esbuild inlines a full copy of that module's code into
  `main.js` for use inside Obsidian (previews, layout-style calculations, iframe HTML).
- `src/export/ManuscriptHtml.ts` → `ManuscriptHtml.js` — a **second**, standalone build of the
  same module, placed at the repo root. This copy exists solely so the external child process
  `exporter.js` (run outside Obsidian via plain `require`, not part of the Obsidian module
  graph) can generate the same HTML when doing full-note PDF exports.

Both bundles must be rebuilt together (`npm run build` does this) whenever
`ManuscriptHtml.ts` changes, since the two copies are not shared at runtime.

## Which pagination implementation is production

The paginator that actually runs is the inline client-side script produced by
`paginationScript()` in `src/export/ManuscriptHtml.ts`. It is stringified into the exported
HTML/iframe and executes in the browser (iframe or Playwright page) to lay content into
`.sp-print-page` sections, splitting paragraphs across pages as needed. This is the only
pagination logic that affects what a user sees in Print Preview, Editable Print Preview, and
the exported PDF/booklet.

`src/manuscriptView.ts` has its own, separate, simpler page-count estimator
(`updatePageGuides()` / `getPaginationDiagnostics()`) used only to draw guide markers in the
Legacy Edit & Export view. It does not affect export output.

## Unused / experimental paginator and layout files

The following files implement a second, typed document-model pagination engine
(parse → measure → paginate → render). They are not imported by `main.ts`, not registered as
a command or view, and are unreachable from any user-facing entry point:

- `src/engine/Block.ts`, `Document.ts`, `Page.ts`, `Parser.ts`, `Measure.ts`,
  `DomMeasure.ts`, `Paginator.ts`, `Layout.ts`
- `src/renderer/BlockRenderer.ts`, `PageRenderer.ts`
- `src/ui/ManuscriptEditorV2.ts`

`src/layout.ts` (`insertPageBreak`, `insertFullTemplate`) is similarly unreferenced by any
active code path. These files are left in place intentionally (per current project direction)
and are still compiled by TypeScript, but ship no user-visible behavior.

## Known duplication in HTML/Markdown conversion

There are two independent DOM ⇄ Markdown serializers for editable content:

- `htmlToMarkdown()` / `inlineHtmlToMarkdown()` in `src/manuscriptView.ts`, used by the Legacy
  editor's Save action.
- `currentPagesToMarkdown()` / `blockToMarkdown()` in `src/ui/EditablePrintPreviewView.ts`,
  used by the Editable Print Preview's Save action, with its own handling of paragraph
  continuation markers produced by the pagination script.

The two serializers do not share code and can diverge in how edge cases (checkboxes, blank
lines, continuation paragraphs) are handled.

## Temporary file and child-process flow

Export always goes through a separate Node process, because the PDF is produced by Playwright
Chromium rather than Obsidian's own renderer:

1. `getNodeExecutable()` (`src/node.ts`) locates a Node binary (env var, `PATH`, Homebrew,
   `/usr(/local)/bin`, or `~/.nvm`).
2. `SermonPrintExporter` (`src/exporter.ts`) writes the export HTML to a temporary
   `*.sermonprint-preview.html` file next to the destination PDF, then `execFile`s Node against
   the plugin's copied `exporter.js`.
3. `exporter.js` launches Playwright Chromium (`chromium.launch()`), sets the HTML as page
   content, and calls `page.pdf()`. The browser is closed in a `finally` block so a failure
   during page creation, content loading, or PDF generation still releases the process.
4. The exporter polls the output path until the file size is stable and starts with `%PDF-`
   / ends with `%%EOF` before treating the export as successful.
5. For booklet mode, a second child process (`booklet.js`, using `pdf-lib`) re-imposes the
   already-produced PDF onto letter-landscape sheets; the intermediate single-page PDF is
   deleted afterward.
6. The temporary preview HTML (and, for booklets, the intermediate PDF) is removed in a
   `finally` block in `exporter.ts` after export completes or fails.

## Current desktop-only assumptions

- `manifest.json` declares `isDesktopOnly: true`.
- `SermonPrintExporter.tryOpenFile()` shells out to the macOS `open` command specifically;
  there is no Windows/Linux equivalent in this code path.
- `PrintPreviewView` and `EditablePrintPreviewView` use `window.require("electron")` to reach
  native save dialogs (`dialog.showSaveDialog[Sync]`), which only exist in Obsidian's Electron
  desktop shell.
- Export requires a standalone Node executable discoverable on the machine (see
  `src/node.ts`); Obsidian's bundled Electron runtime is not used to run Playwright.
