import { Editor } from "obsidian";

export function insertPageBreak(editor: Editor): void {
  editor.replaceSelection('\n\n<div class="page-break"></div>\n\n');
}

export function insertFullTemplate(editor: Editor): void {
  editor.replaceSelection(`# Sermon Title

Text:

Big Idea:

## Review

## Bible Reading

## Prayer

## Sermon Introduction

## 1. Main Point Title

### A. Subpoint Title

#### 1. Detail

#### 2. Detail

### B. Subpoint Title

## Transition

## 2. Main Point Title

### A. Subpoint Title

#### 1. Detail

#### 2. Detail

### B. Subpoint Title

## Transition

## 3. Main Point Title

### A. Subpoint Title

#### 1. Detail

#### 2. Detail

### B. Subpoint Title

## Application

## Good News

## Conclusion
`);
}
