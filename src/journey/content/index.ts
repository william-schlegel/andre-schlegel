import { ouverture } from './ouverture';
import { tours } from './tours';
import type { ChapterContent, ChapterId, PrintCue } from './types';

/** The Chapters that are built. */
const CONTENT: Partial<Record<ChapterId, ChapterContent>> = {
  ouverture,
  tours,
};

export function contentOf(id: ChapterId): ChapterContent {
  const content = CONTENT[id];
  if (!content) throw new Error(`Chapter not built: ${id}`);
  return content;
}

export function printOf(chapter: ChapterId, id: string): PrintCue | null {
  const cue = CONTENT[chapter]?.cues.find((candidate) => candidate.kind === 'print' && candidate.id === id);
  return (cue as PrintCue | undefined) ?? null;
}
