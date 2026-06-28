export type SermonBlockType =
  | "title"
  | "heading"
  | "paragraph"
  | "scripture"
  | "quote"
  | "mainPoint"
  | "subPoint"
  | "transition"
  | "application"
  | "invitation"
  | "conclusion";

export interface SermonBlock {
  id: string;
  type: SermonBlockType;
  text: string;
  level?: number;
  html?: string;
}
