import { SermonBlock } from "./Block";

export interface SermonDocument {
  id: string;
  title: string;
  blocks: SermonBlock[];
}
